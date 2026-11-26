<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { bindManifesto } from './manifesto';
	import { bindPrinciples } from './principles';

	const designPrinciples = [
		{
			title: 'Question.',
			description: '무엇을 만들 것인지보다, 누구에게 왜 필요한지를 먼저 고민합니다.'
		},
		{
			title: 'Structure.',
			description: '복잡한 아이디어를 명확하고 직관적인 구조로 정리합니다.'
		},
		{
			title: 'Detail.',
			description: '작은 디테일까지 다듬어 경험의 완성도를 높입니다.'
		}
	].map((principle, index) => ({ ...principle, number: String(index + 1).padStart(2, '0') }));
	const manifestoQuestionText = 'WHAT MATTERS?';

	let experience: HTMLElement;
	let introTitle: HTMLHeadingElement;
	let introDescription: HTMLParagraphElement;
	let principles: HTMLElement;
	let about: HTMLElement;
	let aboutLayout: HTMLDivElement;
	let aboutDescription: HTMLParagraphElement;
	let manifesto: HTMLElement;
	let manifestoQuestion: HTMLParagraphElement;
	let manifestoLabel: HTMLParagraphElement;
	let manifestoTexture: HTMLCanvasElement;

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

			const principlesStage = bindPrinciples(experience, principles, () => {
				const { top, height } = principles.getBoundingClientRect();
				return startAt(top + height / 2, window.innerHeight / 2);
			});

			const manifestoStage = bindManifesto(
				experience,
				manifesto,
				manifestoTexture,
				manifestoQuestion,
				manifestoLabel.querySelectorAll('.manifesto-word'),
				() => {
					const { top, height } = manifesto.getBoundingClientRect();
					return startAt(top + height / 2, window.innerHeight / 2);
				},
				principlesStage.canContinue
			);

			const aboutWords = aboutDescription.querySelectorAll('span');
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
						end: 'clamp(bottom 45%)',
						scrub: true
					}
				}
			);

			let aboutShown = false;
			const aboutReveal = gsap.fromTo(
				aboutLayout,
				{ opacity: 0, y: 18 },
				{
					opacity: 1,
					y: 0,
					duration: 0.38,
					ease: 'power2.out',
					paused: true,
					onReverseComplete: () => about.removeAttribute('data-reveal-started')
				}
			);

			function setAboutShown(shown: boolean) {
				if (shown === aboutShown) return;
				aboutShown = shown;
				if (shown) {
					about.setAttribute('data-reveal-started', '');
					aboutReveal.play();
				} else if (aboutReveal.progress() > 0) {
					aboutReveal.reverse();
				} else {
					aboutReveal.pause();
					about.removeAttribute('data-reveal-started');
				}
			}

			function syncAbout({ start }: ScrollTrigger) {
				setAboutShown(manifestoStage.canContinue() && window.scrollY >= start);
			}

			const aboutTrigger = ScrollTrigger.create({
				trigger: about,
				start: 'top 90%',
				end: 'max',
				onUpdate: syncAbout,
				onRefresh: syncAbout
			});

			function resetAbout() {
				aboutShown = manifestoStage.canContinue() && about.getBoundingClientRect().top < 0;
				about.toggleAttribute('data-reveal-started', aboutShown);
				aboutReveal.pause().totalProgress(aboutShown ? 1 : 0, true);
				syncAbout(aboutTrigger);
			}

			function leaveExperience() {
				introReveal.reverse();
				setAboutShown(false);
			}

			resetAbout();
			revealTarget.addEventListener('experience-reveal-start', resetAbout);
			revealTarget.addEventListener('experience-reveal-leave', leaveExperience);

			return () => {
				revealTarget.removeEventListener('experience-reveal-start', playIntro);
				revealTarget.removeEventListener('experience-reveal-start', resetAbout);
				revealTarget.removeEventListener('experience-reveal-leave', leaveExperience);
				about.removeAttribute('data-reveal-started');
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

				<section class="principles" aria-label="디자인 원칙" bind:this={principles}>
					<span class="principles-label text-eyebrow">DESIGN PRINCIPLES</span>

					<div class="principles-body">
						<div class="principles-list">
							{#each designPrinciples as principle, index (principle.title)}
								<div class="principles-item" class:is-active={index === 0}>
									<span class="principles-marker" aria-hidden="true"></span>
									<span class="principles-index text-eyebrow">{principle.number}</span>
									<h3 class="principles-title">{principle.title}</h3>
								</div>
							{/each}
						</div>

						<div class="principles-details" aria-live="polite" aria-atomic="true">
							{#each designPrinciples as principle, index (principle.title)}
								<div class="principles-detail" class:is-active={index === 0}>
									<p class="principles-description">{principle.description}</p>
								</div>
							{/each}
						</div>
					</div>

					<div class="principles-progress" aria-hidden="true">
						{#each designPrinciples as principle, index (principle.title)}
							<span class="principles-segment" class:is-active={index === 0}></span>
						{/each}
					</div>
				</section>
			</div>
		</section>

		<!-- Manifesto -->
		<section class="manifesto" aria-labelledby="manifesto-title" bind:this={manifesto}>
			<canvas class="manifesto-texture" aria-hidden="true" bind:this={manifestoTexture}></canvas>
			<svg class="manifesto-filters" width="0" height="0" aria-hidden="true">
				<defs>
					<filter id="manifesto-question-outline">
						<feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="interior" />
						<feComposite in="SourceGraphic" in2="interior" operator="out" />
					</filter>
				</defs>
			</svg>
			<div class="page-container">
				<p
					class="manifesto-type manifesto-question"
					aria-hidden="true"
					bind:this={manifestoQuestion}
				>
					<span class="manifesto-question-outline">{manifestoQuestionText}</span>
					<span class="manifesto-question-fill">
						<span class="manifesto-question-contours">{manifestoQuestionText}</span>
					</span>
				</p>
				<p id="manifesto-title" class="manifesto-type manifesto-label" bind:this={manifestoLabel}>
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
		--principles-gap: clamp(7rem, 12vw, 20rem);

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
		margin-bottom: var(--principles-gap);
	}

	.intro-description {
		max-width: 40rem;
		margin-top: 12px;
	}

	/* Principles */

	.principles {
		display: grid;
		gap: clamp(1.25rem, 3vw, 2.75rem);
	}

	.principles .text-eyebrow {
		font-size: clamp(0.625rem, 1vw, 0.75rem);
	}

	.principles-progress {
		display: flex;
		justify-self: end;
		gap: 4px;
		margin-block-start: clamp(0.5rem, 2.2vw, 1.75rem);
	}

	.principles-segment {
		inline-size: clamp(1.125rem, 3.3vw, 2.75rem);
		block-size: 2px;
		background: var(--border);
		transition: background-color 220ms ease;
	}

	.principles-segment.is-active {
		background: var(--accent);
	}

	.principles-body {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: clamp(1rem, 2.25vw, 2.5rem);
		align-items: center;
	}

	.principles-item {
		display: grid;
		grid-template-columns: clamp(1.2rem, 1.45vw, 1.5rem) minmax(0, 1fr);
		align-content: center;
		align-items: center;
		column-gap: clamp(0.5rem, 1.25vw, 1.125rem);
		row-gap: clamp(0.2rem, 0.5vw, 0.45rem);
		min-block-size: clamp(3.4rem, min(9.5vw, 13svh), 6.75rem);
		padding-block: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.principles-marker {
		position: relative;
		grid-row: 1 / span 2;
		grid-column: 1;
		justify-self: center;
		inline-size: clamp(0.8rem, 0.95vw, 1rem);
		aspect-ratio: 1;
		border: 1px solid color-mix(in srgb, var(--muted) 65%, var(--background));
		transform: rotate(45deg);
	}

	.principles-marker::after {
		content: '';
		position: absolute;
		inset: 26%;
		background: var(--accent);
		opacity: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.principles-marker {
			transition: border-color 220ms ease;
		}

		.principles-marker::after {
			transition: opacity 220ms ease;
		}

		.principles-item.is-active .principles-marker {
			border-color: var(--accent);
		}

		.principles-item.is-active .principles-marker::after {
			opacity: 1;
		}
	}

	.principles-index {
		grid-area: 1 / 2;
		transition: color 220ms ease;
	}

	.principles-title {
		grid-area: 2 / 2;
		min-width: 0;
		margin: 0;
		font-size: clamp(1.5rem, 3.3vw, 3.25rem);
		font-weight: 400;
		line-height: 1.12;
		letter-spacing: -0.045em;
		color: color-mix(in srgb, var(--foreground) 52%, var(--background));
		transition:
			color 220ms ease,
			font-weight 220ms ease;
	}

	.principles-item.is-active .principles-title {
		color: var(--foreground);
		font-weight: 600;
	}

	.principles-item.is-active .principles-index {
		color: var(--accent);
	}

	.principles-details {
		display: grid;
		perspective: 1000px;
	}

	.principles-detail {
		display: grid;
		grid-area: 1 / 1;
		align-content: center;
		gap: clamp(0.8rem, 1.7vw, 1.5rem);
		min-inline-size: 0;
		max-inline-size: 42rem;
		padding-block: clamp(0.75rem, 1.75vw, 1.5rem);
		opacity: 0;
		visibility: hidden;
		backface-visibility: hidden;
	}

	.principles-detail::before {
		content: '';
		inline-size: clamp(1.5rem, 3vw, 2.5rem);
		block-size: 1px;
		background: var(--accent);
	}

	.principles-detail.is-active {
		opacity: 1;
		visibility: visible;
	}

	.principles-description {
		margin: 0;
		font-size: clamp(1.125rem, 2.4vw, 2.15rem);
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: var(--type-lead-tracking);
		word-break: keep-all;
	}

	/* Manifesto */

	.manifesto {
		position: relative;
		isolation: isolate;
		display: grid;
		align-items: center;
		min-block-size: clamp(12rem, 23vw, 24rem);
		margin-block: var(--principles-gap) var(--experience-section-gap);
		padding-block: clamp(1.25rem, 2vw, 2.25rem);
		overflow: hidden;

		color: var(--foreground);
		background: var(--background);
		border-block: 1px solid var(--border);
	}

	.manifesto > .page-container {
		position: relative;
		z-index: 2;
		width: 100%;
	}

	@media (prefers-reduced-motion: no-preference) {
		.manifesto:not([data-reveal-started]) .manifesto-label,
		.about:not([data-reveal-started]) {
			visibility: hidden;
		}
	}

	.manifesto-texture {
		position: absolute;
		inset: 0;
		z-index: 0;
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.manifesto-texture:not([data-webgl]) {
		background-image: repeating-radial-gradient(
			ellipse 82% 145% at 86% 15%,
			transparent 0 14px,
			color-mix(in srgb, var(--accent) 46%, transparent) 15px,
			transparent 16px 19px
		);
	}

	@media (prefers-reduced-motion: no-preference) {
		.manifesto-texture:not([data-webgl]) {
			mask-image: linear-gradient(
				to top,
				black calc(var(--manifesto-reveal, 0%) * 1.16 - 10%),
				transparent calc(var(--manifesto-reveal, 0%) * 1.16)
			);
		}
	}

	.manifesto-label,
	.manifesto-phrase {
		display: flex;
		gap: 0.22em;
	}

	.manifesto-type {
		font-family: var(--font-display);
		font-size: clamp(2rem, 7.5vw, 8.5rem);
		font-weight: 600;
		line-height: 1.05;
		letter-spacing: var(--type-display-tracking);
	}

	.manifesto-filters {
		position: absolute;
		pointer-events: none;
	}

	.manifesto-question {
		--contour-fill: 0%;

		display: none;
		position: absolute;
		inset-block-start: 50%;
		inset-inline-start: var(--page-gutter);
		margin: 0;
		translate: 0 -50%;
		white-space: nowrap;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.manifesto-question {
			display: block;
		}
	}

	.manifesto-question-outline {
		display: block;
		filter: url('#manifesto-question-outline');
		opacity: calc(72% - var(--contour-fill) * 0.34);
	}

	.manifesto-question-fill {
		position: absolute;
		inset: 0;
		clip-path: inset(calc(100% - var(--contour-fill)) 0 0);
	}

	.manifesto-question-contours {
		display: block;
		color: transparent;
		background-color: color-mix(in srgb, var(--accent) 72%, var(--foreground));
		background-clip: text;
		mask: url('./manifesto-contours.svg') center / 100% 100% no-repeat;
	}

	.manifesto-label {
		flex-wrap: wrap;
		row-gap: 0;
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
		.manifesto-type {
			font-size: 7.5vw;
		}

		.manifesto-label {
			flex-wrap: nowrap;
			white-space: nowrap;
		}

		.about-layout {
			grid-template-columns: 1fr;
			gap: 32px;
		}

		.about-media {
			width: clamp(9rem, 40vw, 14rem);
			max-width: 100%;
		}

		.principles-body {
			grid-template-columns: 1fr;
			gap: clamp(2rem, 9vw, 2.5rem);
		}

		.principles-item {
			grid-template-columns: 1rem minmax(0, 1fr);
			column-gap: 0.6875rem;
			row-gap: 0.35rem;
			min-block-size: clamp(4rem, 8.25svh, 4.75rem);
			padding-block: 0.625rem;
		}

		.principles-marker {
			inline-size: 0.74rem;
		}
	}

	/* Reduced Motion */

	@media (prefers-reduced-motion: reduce) {
		.principles-body {
			grid-template-columns: 1fr;
		}

		.principles-details {
			gap: 1.5rem;
			perspective: none;
		}

		.principles-detail {
			grid-area: auto;
			visibility: visible;
			opacity: 1;
			transform: none;
		}

		.principles-progress {
			display: none;
		}

		.principles-item .principles-title {
			color: var(--foreground);
		}

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
