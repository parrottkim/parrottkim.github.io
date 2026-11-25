import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let active: Lenis | null = null;
let locks = 0;

export function initializeScroll() {
	gsap.registerPlugin(ScrollTrigger);

	const lenis = new Lenis({
		autoRaf: false,
		lerp: 0.1,
		smoothWheel: true,
		syncTouch: false,
		anchors: true,
		stopInertiaOnNavigate: true,
		respectReducedMotion: true
	});

	active = lenis;
	if (locks > 0) lenis.stop();

	const removeScrollListener = lenis.on('scroll', ScrollTrigger.update);
	const update = (time: number) => lenis.raf(time * 1000);

	gsap.ticker.add(update);
	gsap.ticker.lagSmoothing(0);

	requestAnimationFrame(() => ScrollTrigger.refresh());

	return () => {
		removeScrollListener();
		gsap.ticker.remove(update);
		lenis.destroy();

		if (active === lenis) active = null;
	};
}

export function lockScroll() {
	locks += 1;
	active?.stop();

	let released = false;

	return () => {
		if (released) return;

		released = true;
		locks = Math.max(0, locks - 1);

		if (locks === 0) {
			active?.resize();
			active?.start();
		}
	};
}

export function isScrollLocked() {
	return locks > 0;
}

export function scrollToImmediately(top: number) {
	if (active) {
		active.scrollTo(top, {
			immediate: true,
			force: true
		});
		return;
	}

	window.scrollTo(0, top);
}
