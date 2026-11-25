import { gsap } from 'gsap';
import { bindStage } from './stage';

export function bindPrinciples(
	experience: HTMLElement,
	section: HTMLElement,
	items: NodeListOf<Element>,
	start: () => number
) {
	const duration = 0.36;
	const reveal = gsap.fromTo(
		items,
		{ autoAlpha: 0, y: 32 },
		{ autoAlpha: 1, y: 0, duration, stagger: duration, ease: 'power2.out', paused: true }
	);
	let revealed = 0;
	let step: gsap.core.Tween | undefined;

	function revealNext() {
		if (step || revealed >= items.length) return;

		stage.keepVisible(items[revealed]);
		revealed += 1;
		step = gsap.to(reveal, {
			totalProgress: revealed / items.length,
			duration,
			ease: 'none',
			onComplete: () => {
				step = undefined;
				if (revealed === items.length) stage.finish();
			}
		});
	}

	const stage = bindStage({
		experience,
		section,
		start,
		onHold: revealNext,
		onScroll: (_delta, isNewGesture) => {
			if (isNewGesture) revealNext();
		},
		onReset: (alreadyPassed) => {
			step?.kill();
			step = undefined;
			revealed = alreadyPassed ? items.length : 0;
			reveal.totalProgress(alreadyPassed ? 1 : 0);
		}
	});

	return {
		canContinue: stage.canContinue,
		destroy() {
			step?.kill();
			stage.destroy();
		}
	};
}
