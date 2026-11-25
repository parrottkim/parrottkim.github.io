<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { bindManifesto } from './manifesto';
	import { bindPrinciples } from './principles';

	let experience: HTMLElement;
	let introTitle: HTMLHeadingElement;
	let introDescription: HTMLParagraphElement;
	let principles: HTMLElement;
	let principlesLayout: HTMLDivElement;
	let about: HTMLElement;
	let aboutLayout: HTMLDivElement;
	let aboutDescription: HTMLParagraphElement;
	let manifesto: HTMLElement;
	let manifestoFill: HTMLDivElement;
	let manifestoLabel: HTMLParagraphElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const motion = gsap.matchMedia();
		motion.add('(prefers-reduced-motion: no-preference)', () => {
			const revealTarget = experience;
			const introReveal = gsap.from([introTitle, introDescription], {
				autoAlpha: 0,
				y: 18,
				duration: 0.38,
				stagger: 0.1,
				ease: 'power2.out',
				paused: true
			});
			const playIntro = () => introReveal.restart();
			revealTarget.addEventListener('experience-reveal-start', playIntro);

			const initialReveal = Number(
				document.documentElement.style.getPropertyValue('--experience-reveal')
			);
			if (initialReveal > 0) introReveal.play();

			function startAt(position: number, viewportPosition: number) {
				const sectionTop = experience.getBoundingClientRect().top;
				return window.scrollY + Math.max(sectionTop, position - viewportPosition);
			}

			const principleItems = principlesLayout.querySelectorAll('.principle-item');
			const principlesStage = bindPrinciples(experience, principles, principleItems, () =>
				startAt(principleItems[0].getBoundingClientRect().bottom, window.innerHeight - 24)
			);
			const manifestoStage = bindManifesto(
				experience,
				manifesto,
				manifestoFill,
				manifestoLabel.querySelectorAll('.manifesto-word'),
				() => {
					const { top, height } = manifesto.getBoundingClientRect();
					return startAt(top + height / 2, window.innerHeight / 2);
				},
				principlesStage.canContinue
			);
			const aboutWords = aboutDescription.querySelectorAll('span');
			let aboutHighlight: gsap.Context | undefined;

			function startAboutHighlight() {
				aboutHighlight ??= gsap.context(() => {
					gsap.fromTo(
						aboutWords,
						{ '--word-highlight': '0%' },
						{
							'--word-highlight': '100%',
							duration: 1,
							stagger: 1,
							ease: 'none',
							scrollTrigger: {
								trigger: aboutDescription,
								start: 'top 85%',
								end: 'bottom 45%',
								scrub: true
							}
						}
					);
				});
			}

			const aboutReveal = gsap.fromTo(
				aboutLayout,
				{ opacity: 0, y: 18 },
				{
					opacity: 1,
					y: 0,
					duration: 0.38,
					ease: 'power2.out',
					paused: true,
					onComplete: startAboutHighlight
				}
			);

			function showAbout({ start, direction }: ScrollTrigger) {
				if (
					direction < 0 ||
					about.hasAttribute('data-reveal-started') ||
					!manifestoStage.canContinue() ||
					window.scrollY < start
				)
					return;

				about.setAttribute('data-reveal-started', '');
				aboutReveal.play();
			}

			const aboutTrigger = ScrollTrigger.create({
				trigger: about,
				start: 'top 90%',
				end: 'max',
				onUpdate: showAbout
			});

			function resetAbout() {
				const alreadyPassed = manifestoStage.canContinue() && about.getBoundingClientRect().top < 0;
				about.toggleAttribute('data-reveal-started', alreadyPassed);
				aboutReveal.pause().totalProgress(alreadyPassed ? 1 : 0, true);
				if (alreadyPassed) {
					startAboutHighlight();
				} else {
					aboutHighlight?.revert();
					aboutHighlight = undefined;
				}
				showAbout(aboutTrigger);
			}

			resetAbout();
			revealTarget.addEventListener('experience-reveal-start', resetAbout);

			return () => {
				revealTarget.removeEventListener('experience-reveal-start', playIntro);
				revealTarget.removeEventListener('experience-reveal-start', resetAbout);
				about.removeAttribute('data-reveal-started');
				aboutHighlight?.revert();
				manifestoStage.destroy();
				principlesStage.destroy();
			};
		});

		return () => {
			motion.revert();
		};
	});
</script>

<section class="experience" id="experience" bind:this={experience}>
	<div class="experience-content">
		<!-- Intro -->
		<section class="intro">
			<div class="page-container">
				<header class="intro-content">
					<h2 class="intro-title" bind:this={introTitle}>
						<span>좋은</span>
						<span>경험을</span>
						<span>만드는</span>
						<br />
						<span>이유를</span>
						<span>담은</span>
						<span>디자인.</span>
					</h2>

					<p class="intro-description" bind:this={introDescription}>
						사용자의 관점에서 문제를 바라보고, 아이디어를 명확한 구조와 직관적인 인터페이스로
						풀어냅니다.
					</p>
				</header>

				<section class="principles" bind:this={principles}>
					<div class="principles-layout" bind:this={principlesLayout}>
						<div class="principle-item">
							<span class="principle-index text-eyebrow">01</span>
							<h4 class="principle-title">Question.</h4>
							<p class="principle-description">
								무엇을 만들 것인지보다, 누구에게 왜 필요한지를 먼저 고민합니다.
							</p>
						</div>

						<div class="principle-item">
							<span class="principle-index text-eyebrow">02</span>
							<h4 class="principle-title">Structure.</h4>
							<p class="principle-description">
								복잡한 아이디어를 명확하고 직관적인 구조로 정리합니다.
							</p>
						</div>

						<div class="principle-item">
							<span class="principle-index text-eyebrow">03</span>
							<h4 class="principle-title">Detail.</h4>
							<p class="principle-description">작은 디테일까지 다듬어 경험의 완성도를 높입니다.</p>
						</div>
					</div>
				</section>
			</div>
		</section>

		<!-- Manifesto -->
		<section class="manifesto" aria-labelledby="manifesto-title" bind:this={manifesto}>
			<div class="manifesto-fill" aria-hidden="true" bind:this={manifestoFill}></div>
			<div class="page-container">
				<p id="manifesto-title" class="manifesto-label" bind:this={manifestoLabel}>
					<span class="sr-only">DESIGNED TO MATTER.</span>
					<span class="manifesto-word" aria-hidden="true">DESIGNED</span>
					<span class="manifesto-phrase" aria-hidden="true">
						<span class="manifesto-word">TO</span>
						<span class="manifesto-word">MATTER.</span>
					</span>
				</p>
			</div>
		</section>

		<!-- About -->
		<section class="about" aria-labelledby="about-title" bind:this={about}>
			<div class="page-container">
				<div class="about-layout" bind:this={aboutLayout}>
					<div class="about-media">
						<img src="https://placehold.net/shape-400x400.png" alt="" />
					</div>

					<div class="about-content">
						<h2 id="about-title" class="about-title text-eyebrow">ABOUT ME</h2>

						<p class="about-description" bind:this={aboutDescription}>
							<span>안녕하세요,</span>
							<span>김현진입니다.</span>
							<span>저는</span>
							<span>사용자의</span>
							<span>입장에서</span>
							<span>문제를</span>
							<span>바라보고,</span>
							<span>누구나</span>
							<span>직관적이고</span>
							<span>편리하게</span>
							<span>사용할</span>
							<span>수</span>
							<span>있는</span>
							<span>서비스를</span>
							<span>만드는</span>
							<span>데</span>
							<span>관심이</span>
							<span>있습니다.</span>
							<span>좋은</span>
							<span>사용자</span>
							<span>경험은</span>
							<span>완성도</span>
							<span>높은</span>
							<span>구현과</span>
							<span>함께한다고</span>
							<span>생각합니다.</span>
							<span>읽기</span>
							<span>쉬운</span>
							<span>코드와</span>
							<span>간결한</span>
							<span>아키텍처를</span>
							<span>지향하며,</span>
							<span>서비스가</span>
							<span>추구하는</span>
							<span>비즈니스</span>
							<span>가치를</span>
							<span>이해하고</span>
							<span>더</span>
							<span>나은</span>
							<span>아이디어를</span>
							<span>제안하려</span>
							<span>노력합니다.</span>
							<span>또한</span>
							<span>서로를</span>
							<span>신뢰하고</span>
							<span>존중하는</span>
							<span>소통을</span>
							<span>중요하게</span>
							<span>생각합니다.</span>
							<span>다양한</span>
							<span>의견을</span>
							<span>열린</span>
							<span>자세로</span>
							<span>나누고,</span>
							<span>함께</span>
							<span>더</span>
							<span>좋은</span>
							<span>해결책을</span>
							<span>찾아가는</span>
							<span>과정에서</span>
							<span>의미</span>
							<span>있는</span>
							<span>결과가</span>
							<span>만들어진다고</span>
							<span>믿습니다.</span>
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</section>

<style>
	/* Experience */

	.experience {
		--experience-section-gap: clamp(6rem, 10vw, 19rem);

		position: relative;
		z-index: 4;

		min-height: 200svh;
		margin-top: -100svh;
		padding-block: var(--experience-section-gap) 12svh;

		color: var(--foreground);
		pointer-events: var(--experience-pointer-events, none);
	}

	.experience::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;

		background: var(--background);
		opacity: var(--experience-background-opacity, 0);
		pointer-events: none;
	}

	.experience-content {
		position: relative;
		z-index: 1;

		width: 100%;

		opacity: var(--experience-reveal, 0);
	}

	/* Intro */

	.intro-content {
		margin-bottom: clamp(3rem, 6vw, 6rem);
	}

	.intro-description {
		max-width: 40rem;
		margin-top: 12px;
	}

	/* Principles */

	.principles-layout {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--grid-gap);
		align-items: start;
	}

	.principle-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 0;
	}

	.principle-index {
		margin-bottom: 16px;
	}

	.principle-title {
		align-self: stretch;
		margin-bottom: 0;

		font-size: var(--font-size-h3);
		line-height: var(--type-h3-leading);
	}

	.principle-title::after {
		content: '';
		display: block;
		width: 20%;
		height: 1px;
		margin-top: 16px;
		background: var(--border);
	}

	.principle-description {
		margin-top: 16px;
	}

	/* Manifesto */

	.manifesto {
		position: relative;
		isolation: isolate;
		display: grid;
		align-items: center;
		min-block-size: clamp(7rem, 13vw, 14rem);
		margin-block: var(--experience-section-gap);
		padding-block: clamp(1.25rem, 2vw, 2.25rem);

		color: var(--background);
	}

	@media (prefers-reduced-motion: no-preference) {
		.manifesto:not([data-reveal-started]),
		.about:not([data-reveal-started]) {
			visibility: hidden;
		}
	}

	.manifesto-fill {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--accent);
		transform-origin: left center;
		pointer-events: none;
	}

	.manifesto-label,
	.manifesto-phrase {
		display: flex;
		gap: 0.22em;
	}

	.manifesto-label {
		flex-wrap: wrap;
		row-gap: 0;
		font-family: var(--font-display);
		font-size: clamp(2rem, 7.5vw, 8.5rem);
		font-weight: 600;
		line-height: 1.05;
		letter-spacing: var(--type-display-tracking);
	}

	.manifesto-word {
		display: block;
		backface-visibility: hidden;
		transform-origin: center bottom;
	}

	/* About */

	.about {
		padding-block-end: var(--section-spacing);
	}

	.about-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
		gap: 32px;
		align-items: start;
	}

	.about-media {
		aspect-ratio: 1;
		overflow: hidden;
	}

	.about-media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.about-content {
		min-width: 0;
	}

	.about-title {
		margin-bottom: 16px;
		font-weight: 400;
	}

	.about-description {
		--word-base: color-mix(in srgb, var(--foreground) 25%, var(--background));

		font-size: var(--font-size-h3);
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: -0.035em;
	}

	.about-description span {
		display: inline-block;

		color: color-mix(in srgb, var(--word-base), var(--foreground) var(--word-highlight, 0%));
	}

	/* Responsive */

	@media (max-width: 768px) {
		.manifesto-label {
			flex-wrap: nowrap;
			font-size: 7.5vw;
			white-space: nowrap;
		}

		.principles-layout,
		.about-layout {
			grid-template-columns: 1fr;
			gap: 32px;
		}

		.about-media {
			width: clamp(9rem, 40vw, 14rem);
			max-width: 100%;
		}
	}

	/* Reduced Motion */

	@media (prefers-reduced-motion: reduce) {
		.experience {
			min-height: auto;
			margin-top: 0;
			pointer-events: auto;
		}

		.experience::before {
			opacity: 1;
		}

		.experience-content {
			opacity: 1;
		}

		.about-description span {
			--word-highlight: 100% !important;
		}
	}
</style>
