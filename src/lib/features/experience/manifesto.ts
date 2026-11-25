import { gsap } from 'gsap';
import { bindStage } from './stage';

export function bindManifesto(
	experience: HTMLElement,
	section: HTMLElement,
	fill: HTMLDivElement,
	words: NodeListOf<Element>,
	start: () => number,
	canStart: () => boolean
) {
	const perspective = 3600;
	const reveal = gsap.fromTo(
		words,
		{ yPercent: 30, rotationX: -100, transformPerspective: perspective },
		{
			yPercent: 0,
			rotationX: 0,
			transformPerspective: perspective,
			duration: 0.6,
			stagger: 0.144,
			ease: 'power2.out',
			paused: true,
			onComplete: () => stage.finish()
		}
	);

	gsap.set(fill, { scaleX: 0 });
	const setFill = gsap.quickSetter(fill, 'scaleX');
	let progress = 0;
	let textStarted = false;
	const scrubTo = gsap.quickTo(fill, 'scaleX', {
		duration: 0.22,
		ease: 'power2.out',
		onComplete: () => {
			if (progress < 1 || textStarted) return;
			textStarted = true;
			reveal.play();
		}
	});

	function advance(delta: number) {
		if (delta <= 0 || progress >= 1) return;

		const distance = Math.max(200, window.innerHeight * 0.35);
		progress = Math.min(1, progress + Math.min(delta, 72) / distance);
		scrubTo(progress, Number(gsap.getProperty(fill, 'scaleX')));
	}

	const stage = bindStage({
		experience,
		section,
		start,
		canStart,
		alignOnHold: true,
		onHold: (delta) => {
			section.setAttribute('data-reveal-started', '');
			advance(delta);
		},
		onScroll: advance,
		onReset: (alreadyPassed) => {
			section.toggleAttribute('data-reveal-started', alreadyPassed);
			progress = alreadyPassed ? 1 : 0;
			textStarted = alreadyPassed;
			scrubTo.tween.pause();
			setFill(progress);
			reveal.pause().totalProgress(progress, true);
		}
	});

	return {
		canContinue: stage.canContinue,
		destroy() {
			stage.destroy();
			section.removeAttribute('data-reveal-started');
		}
	};
}
