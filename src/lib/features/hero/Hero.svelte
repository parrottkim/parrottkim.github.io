<script lang="ts">
	import { onMount } from 'svelte';
	import { MathUtils } from 'three';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { isScrollLocked, lockScroll, scrollToImmediately } from '#lib/scroll/index.ts';
	import { bindScrollInput, type ScrollDirection } from '#lib/scroll/input.ts';
	import { createHeroScene } from './scene';

	let { model }: { model: GLTF } = $props();

	let section: HTMLElement;
	let heroCanvas: HTMLDivElement;
	let glow: HTMLDivElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		type HeroHmrState = {
			introFinished: boolean;
			phase: 'opening' | 'ready' | 'entering' | 'experience' | 'leaving';
		};

		const hmrData = import.meta.hot?.data as { heroState?: HeroHmrState } | undefined;

		const savedState = hmrData?.heroState;

		// HMR로 재마운트되거나 이미 스크롤된 페이지라면 인트로 생략
		const skipIntro = reducedMotion || savedState?.introFinished === true || window.scrollY > 1;

		// Intro Scroll Lock
		const previousOverflow = document.body.style.overflow;
		let releaseIntroScroll: (() => void) | undefined;

		if (!skipIntro) {
			document.body.style.overflow = 'hidden';
			releaseIntroScroll = lockScroll();
		}

		let disposed = false;
		let isVisible = true;
		let introFinished = skipIntro;

		const heroScene = createHeroScene({
			model,
			canvas: heroCanvas
		});

		const { pivot, setLidProgress, setScreenActive, updateTransition } = heroScene;

		function smoothstep(start: number, end: number, value: number) {
			const t = MathUtils.clamp((value - start) / (end - start), 0, 1);

			return t * t * (3 - 2 * t);
		}

		function getExperience(): HTMLElement | null {
			return document.getElementById('experience');
		}

		type Phase = 'opening' | 'ready' | 'entering' | 'experience' | 'leaving';

		let phase: Phase = 'opening';

		const openingState = {
			progress: 0
		};

		const transitionState = {
			zoom: 0,
			tunnelProgress: 0,
			cover: 0,
			reveal: 0
		};

		let openingTrigger: ScrollTrigger | null = null;
		let scrollContext: ReturnType<typeof gsap.context> | undefined;
		let syncHeroInput = () => {};
		let releaseBoundaryScroll: (() => void) | undefined;

		function renderTransition() {
			const motion = phase === 'entering' || phase === 'leaving' ? phase : 'normal';
			updateTransition(transitionState, motion);

			const root = document.documentElement;

			root.style.setProperty('--experience-background-opacity', String(transitionState.cover));

			root.style.setProperty('--experience-reveal', String(transitionState.reveal));

			root.style.setProperty(
				'--experience-pointer-events',
				transitionState.reveal >= 0.99 ? 'auto' : 'none'
			);
		}

		const zoomDuration = 0.9;
		const tunnelDuration = 1.1;
		const experienceStart = tunnelDuration + 0.3;
		const transition = gsap.timeline({
			paused: true,

			onUpdate: () => {
				if (phase === 'leaving') {
					// Hero로 돌아갈 때는 별이 모두 빠져나간 뒤의 정지 구간을 건너뛴다.
					const time = transition.time();
					if (time > tunnelDuration && time < experienceStart) {
						transition.time(tunnelDuration, true);
					}
				}
				renderTransition();
				saveHmrState();
			},

			onComplete: () => {
				phase = 'experience';
				releaseBoundary();
				syncHeroInput();
				renderTransition();
				saveHmrState();
			},

			onReverseComplete: () => {
				phase = 'ready';
				holdBoundary();
				syncHeroInput();
				setLidProgress(1);
				renderTransition();
				saveHmrState();
			}
		});

		transition
			.to(
				transitionState,
				{
					zoom: 1,
					duration: zoomDuration,
					ease: 'power2.inOut'
				},
				0
			)
			.to(
				transitionState,
				{
					tunnelProgress: 1,
					duration: tunnelDuration,
					ease: 'none'
				},
				0
			)
			.to(
				transitionState,
				{
					cover: 1,
					duration: 0.24,
					ease: 'sine.inOut'
				},
				experienceStart
			)
			.to(
				transitionState,
				{
					reveal: 1,
					duration: 0.32,
					ease: 'power2.out',
					onStart: () => getExperience()?.dispatchEvent(new Event('experience-reveal-start'))
				},
				experienceStart + 0.08
			);

		function saveHmrState() {
			if (!hmrData) return;

			hmrData.heroState = {
				introFinished,
				phase
			};
		}

		function scrollBoundary() {
			return openingTrigger?.end ?? 0;
		}

		function holdBoundary() {
			const boundary = scrollBoundary();
			if (!boundary) return;

			releaseBoundaryScroll ??= lockScroll();

			if (Math.abs(window.scrollY - boundary) > 0.5) {
				scrollToImmediately(boundary);
			}
		}

		function releaseBoundary() {
			releaseBoundaryScroll?.();
			releaseBoundaryScroll = undefined;
		}

		function enterExperience() {
			if (!introFinished || !openingTrigger || !getExperience()) return;
			if (phase === 'entering' || phase === 'experience') return;

			phase = 'entering';
			holdBoundary();
			syncHeroInput();

			setLidProgress(1);
			renderTransition();
			transition.timeScale(1).play();
		}

		function returnToHero() {
			if (!openingTrigger) return;
			if (phase === 'leaving' || phase === 'opening' || phase === 'ready') return;

			phase = 'leaving';
			holdBoundary();
			syncHeroInput();

			renderTransition();
			transition.timeScale(1.35).reverse();
		}

		function handleDirection(direction: ScrollDirection, isNewGesture: boolean) {
			if (!introFinished || reducedMotion || !openingTrigger || !getExperience()) return false;

			// 트랙패드 관성의 미세한 반대 델타가 전환을 앞뒤로 흔들지 않게 한다.
			if (phase === 'entering' || phase === 'leaving') return true;

			const boundary = scrollBoundary();

			if (phase === 'ready' && direction === 1 && window.scrollY >= boundary - 3) {
				enterExperience();
				return true;
			}

			if (
				phase === 'experience' &&
				!isScrollLocked() &&
				direction === -1 &&
				Math.abs(window.scrollY - boundary) <= 3
			) {
				if (isNewGesture) returnToHero();
				return true;
			}

			return false;
		}

		function stopAtExperienceBoundary() {
			heroInput.consumeGesture();
			holdBoundary();
			releaseBoundary();
		}

		function stopAtBoundary(delta: number) {
			if (!introFinished || reducedMotion || !openingTrigger) return false;

			const y = window.scrollY;
			const end = openingTrigger.end;

			if (phase === 'opening' && delta > 0 && y < end && y + delta >= end) {
				setLidProgress(1);
				phase = 'ready';
				holdBoundary();
				syncHeroInput();
				return true;
			}

			if (
				phase === 'experience' &&
				!isScrollLocked() &&
				delta < 0 &&
				y > end + 3 &&
				y + delta <= end
			) {
				stopAtExperienceBoundary();
				return true;
			}

			return false;
		}

		const heroInput = bindScrollInput({
			handleDirection,
			stopAtBoundary,
			isTransitioning: () => phase === 'entering' || phase === 'leaving',
			shouldCapture: () => {
				if (!openingTrigger || reducedMotion) return false;
				if (phase === 'ready' || phase === 'entering' || phase === 'leaving') return true;

				const range = Math.max(160, window.innerHeight * 0.12);
				const distance = window.scrollY - openingTrigger.end;

				if (phase === 'opening') return distance >= -range;
				if (phase === 'experience') return distance <= range;

				return false;
			}
		});

		syncHeroInput = heroInput.sync;
		syncHeroInput();

		function initializeScrollTrigger() {
			if (reducedMotion || disposed) return;

			scrollContext = gsap.context(() => {
				gsap.to(openingState, {
					progress: 1,
					ease: 'none',

					scrollTrigger: {
						trigger: section,
						start: 'top top',
						end: 'bottom bottom',
						scrub: true,

						onRefresh: (self) => {
							openingTrigger = self;
							syncHeroInput();
						},

						onUpdate: (self) => {
							openingTrigger = self;

							if (phase === 'opening' && self.progress >= 0.998) {
								phase = 'ready';
								setLidProgress(1);
								holdBoundary();
								syncHeroInput();
							}

							if (phase === 'ready' && self.progress < 0.999) {
								phase = 'opening';
								releaseBoundary();
								syncHeroInput();
							}
						},

						onLeave: (self) => {
							openingTrigger = self;

							if (phase === 'opening' || phase === 'ready') {
								setLidProgress(1);
								phase = 'ready';
								holdBoundary();
								syncHeroInput();
							}
						},

						onEnterBack: (self) => {
							openingTrigger = self;

							if (phase === 'experience' && !isScrollLocked()) {
								stopAtExperienceBoundary();
							} else if (phase === 'ready' && self.progress < 0.999) {
								phase = 'opening';
								releaseBoundary();
								syncHeroInput();
							}
						},

						invalidateOnRefresh: true
					},

					onUpdate: () => {
						if (phase === 'opening') {
							setLidProgress(smoothstep(0, 1, openingState.progress));
						}
					}
				});
			}, section);

			ScrollTrigger.refresh();

			if (openingTrigger) {
				const start = openingTrigger.start;
				const end = openingTrigger.end;
				const y = window.scrollY;
				const isAtBoundary = Math.abs(y - end) <= 4;
				const wasEnteringExperience =
					savedState?.phase === 'entering' || savedState?.phase === 'experience';
				const restoreExperience = y > end + 4 || (isAtBoundary && wasEnteringExperience);

				if (restoreExperience) {
					releaseBoundary();
					setLidProgress(1);
					transition.progress(1).pause();
					phase = 'experience';
				} else if (y >= end - 4) {
					setLidProgress(1);
					transition.progress(0).pause();
					phase = 'ready';
					holdBoundary();
				} else {
					releaseBoundary();
					const progress = MathUtils.clamp((y - start) / Math.max(1, end - start), 0, 1);

					openingState.progress = progress;
					setLidProgress(smoothstep(0, 1, progress));
					transition.progress(0).pause();
					phase = 'opening';
				}

				renderTransition();
				saveHmrState();
				syncHeroInput();
			}
		}

		// Intro Animation
		const introState = {
			progress: 0
		};

		let introTimeline: gsap.core.Timeline | undefined;
		let introFrameRendered = false;

		if (skipIntro) {
			pivot.rotation.y = 0;
			pivot.scale.setScalar(1);
			setScreenActive(true);

			section.classList.add('intro-complete');

			if (reducedMotion) {
				setLidProgress(1);
			} else {
				initializeScrollTrigger();
			}
		} else {
			pivot.scale.setScalar(3.5);

			introTimeline = gsap
				.timeline({
					paused: true,
					onComplete: () => {
						pivot.rotation.y = 0;
						pivot.scale.setScalar(1);

						setLidProgress(0);
						setScreenActive(true);

						introFinished = true;
						section.classList.add('intro-complete');
						heroCanvas.style.removeProperty('opacity');
						glow.style.removeProperty('opacity');

						document.body.style.overflow = previousOverflow;
						releaseIntroScroll?.();
						releaseIntroScroll = undefined;

						saveHmrState();
						initializeScrollTrigger();
					}
				})
				.to(
					introState,
					{
						progress: 1,
						duration: 2.2,
						ease: 'power3.out',
						onUpdate: () => {
							const p = introState.progress;

							setLidProgress(1 - p);
							pivot.rotation.y = Math.PI * 2 * p;
							pivot.scale.setScalar(MathUtils.lerp(3.5, 1, p));
						}
					},
					0
				)
				.fromTo(
					[heroCanvas, glow],
					{ opacity: 0 },
					{ opacity: 1, duration: 0.9, ease: 'power1.inOut' },
					0
				);
		}

		// Resize
		let hasCanvasSize = false;

		function resize() {
			hasCanvasSize = heroScene.resize();
			if (!hasCanvasSize) return;

			if (introFinished && !reducedMotion) {
				renderTransition();
			}
		}

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(heroCanvas);

		// Visibility
		const visibilityObserver = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
			},
			{ threshold: 0 }
		);

		visibilityObserver.observe(section);

		// Render Loop
		function tick(_time: number, deltaMs: number) {
			if (disposed || !isVisible || !hasCanvasSize) return;

			if (phase === 'experience') return;

			// 첫 WebGL 프레임을 숨긴 채 그리고, 프레임 지연으로 페이드가 건너뛰지 않게 한다.
			if (introTimeline && !introFinished && introFrameRendered) {
				const delta = Math.min(deltaMs / 1000, 1 / 30);
				introTimeline.time(introTimeline.time() + delta);
			}

			heroScene.render();
			introFrameRendered = true;
		}

		resize();
		gsap.ticker.add(tick);

		// Cleanup
		return () => {
			saveHmrState();

			disposed = true;

			document.body.style.overflow = previousOverflow;
			releaseIntroScroll?.();
			releaseBoundary();

			gsap.ticker.remove(tick);

			introTimeline?.kill();
			transition.kill();
			scrollContext?.revert();
			heroInput.destroy();

			resizeObserver.disconnect();
			visibilityObserver.disconnect();

			heroScene.dispose();

			const root = document.documentElement;
			root.style.removeProperty('--experience-background-opacity');
			root.style.removeProperty('--experience-reveal');
			root.style.removeProperty('--experience-pointer-events');
		};
	});
</script>

<section class="hero" bind:this={section}>
	<div class="hero-layout">
		<div class="hero-glow" bind:this={glow}></div>

		<div class="hero-content">
			<h1>
				모든 아이디어의 시작부터<br />
				사용자에게 닿는 순간까지
			</h1>
		</div>

		<div class="hero-canvas" bind:this={heroCanvas}></div>

		<div class="hero-meta text-eyebrow">
			<span>DESIGNED TO MATTER.</span>
			<span>SCROLL TO EXPLORE ↓</span>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		height: 240svh;
	}

	.hero-layout {
		position: sticky;
		top: 0;

		display: flex;
		width: 100%;
		height: 100svh;

		overflow: hidden;
		align-items: center;
		justify-content: center;

		isolation: isolate;
		background: var(--background);
	}

	.hero-glow {
		position: absolute;
		inset: 0;
		z-index: 0;

		overflow: hidden;
		pointer-events: none;

		opacity: 0;
		background: radial-gradient(
			ellipse 48% 28% at 50% 72%,
			rgb(var(--hero-glow-color) / var(--hero-glow-opacity)),
			transparent 72%
		);
		transition: background 350ms ease;
	}

	.hero-content {
		position: absolute;
		z-index: 1;
		top: 12%;

		text-align: center;
		pointer-events: none;

		opacity: 0;
		transform: translateY(30px);

		transition:
			opacity 800ms ease,
			transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hero-content h1 {
		margin: 0;

		font-size: clamp(36px, 4.5vw, 72px);
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: -0.055em;
	}

	.hero-canvas {
		position: absolute;
		inset: 0;
		z-index: 2;

		opacity: 0;
	}

	.hero-canvas :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.hero-meta {
		position: absolute;
		z-index: 1;

		right: var(--page-gutter);
		bottom: 6svh;
		left: var(--page-gutter);

		display: flex;
		justify-content: space-between;

		text-align: center;
		pointer-events: none;

		opacity: 0;
		transform: translateY(12px);

		transition:
			opacity 700ms ease 200ms,
			transform 700ms ease 200ms;
	}

	.hero:global(.intro-complete) .hero-canvas,
	.hero:global(.intro-complete) .hero-glow {
		opacity: 1;
	}

	.hero:global(.intro-complete) .hero-content {
		opacity: 1;
		transform: translateY(0);
	}

	.hero:global(.intro-complete) .hero-meta {
		opacity: 0.55;
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.hero-content {
			top: 15%;
			right: 7%;
			left: 7%;
		}

		.hero-content h1 {
			font-size: clamp(32px, 8vw, 48px);
		}

		.hero-meta {
			right: 7%;
			left: 7%;
			font-size: 9px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero {
			height: 100svh;
		}

		.hero-content,
		.hero-meta {
			transition: none;
		}
	}
</style>
