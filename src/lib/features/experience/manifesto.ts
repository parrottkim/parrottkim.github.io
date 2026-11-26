import { gsap } from 'gsap';
import { bindManifestoTexture } from './manifesto-texture';
import { bindStage } from './stage';

export function bindManifesto(
	experience: HTMLElement,
	section: HTMLElement,
	canvas: HTMLCanvasElement,
	question: HTMLParagraphElement,
	words: NodeListOf<Element>,
	start: () => number,
	canStart: () => boolean
) {
	const texture = bindManifestoTexture(canvas, section);
	const reveal = gsap
		.timeline({
			paused: true,
			onUpdate(this: gsap.core.Timeline) {
				texture.setReflectionProgress(this.totalProgress());
			},
			onComplete: () => stage.finish(),
			onReverseComplete: rewindTerrain
		})
		.to(question, { autoAlpha: 0, yPercent: -13, duration: 0.28, ease: 'power2.in' }, 0.22)
		.fromTo(
			words,
			{ autoAlpha: 0, yPercent: 42, rotationX: -28, transformPerspective: 1200 },
			{
				autoAlpha: 1,
				yPercent: 0,
				rotationX: 0,
				transformPerspective: 1200,
				duration: 0.49,
				stagger: 0.08,
				ease: 'power3.out'
			},
			0.38
		);

	const visualProgress = { value: 0 };
	function renderProgress(value: number) {
		texture.setRevealProgress(value);
		const contourFill = gsap.utils.clamp(0, 1, (value - 0.22) / 0.61);
		question.style.setProperty('--contour-fill', `${contourFill * 100}%`);
	}

	let progress = 0;
	let textStarted = false;
	const scrubTo = gsap.quickTo(visualProgress, 'value', {
		duration: 0.22,
		ease: 'power2.out',
		onUpdate: () => renderProgress(visualProgress.value),
		onComplete: () => {
			if (progress === 0) {
				finishReverse();
				return;
			}
			if (progress < 1 || textStarted) return;
			textStarted = true;
			reveal.play();
		}
	});

	function advance(delta: number) {
		if (delta <= 0 || progress >= 1) return;

		const distance = Math.max(200, window.innerHeight * 0.35);
		progress = Math.min(1, progress + Math.min(delta, 72) / distance);
		scrubTo(progress, visualProgress.value);
	}

	function finishReverse() {
		section.removeAttribute('data-reveal-started');
		stage.finishReverse();
	}

	function rewindTerrain() {
		progress = 0;
		textStarted = false;
		const current = visualProgress.value;
		if (current > 0) {
			scrubTo(0, current);
		} else {
			finishReverse();
		}
	}

	const stage = bindStage({
		experience,
		section,
		start,
		canStart,
		onHold: (delta) => {
			section.setAttribute('data-reveal-started', '');
			advance(delta);
		},
		onScroll: advance,
		onReverse() {
			scrubTo.tween.pause();
			if (reveal.totalProgress() > 0) {
				reveal.reverse();
			} else {
				reveal.pause();
				rewindTerrain();
			}
		},
		onReset: (alreadyPassed) => {
			section.toggleAttribute('data-reveal-started', alreadyPassed);
			progress = alreadyPassed ? 1 : 0;
			textStarted = alreadyPassed;
			scrubTo.tween.pause();
			visualProgress.value = progress;
			renderProgress(progress);
			reveal.pause().totalProgress(progress, true);
			texture.setReflectionProgress(progress);
		}
	});

	return {
		canContinue: stage.canContinue,
		destroy() {
			stage.destroy();
			texture.destroy();
			question.style.removeProperty('--contour-fill');
			section.removeAttribute('data-reveal-started');
		}
	};
}
