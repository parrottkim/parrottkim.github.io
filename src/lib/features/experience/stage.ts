import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lockScroll, scrollToImmediately } from '#lib/scroll/index.ts';
import { bindScrollInput } from '#lib/scroll/input.ts';

type StageOptions = {
	experience: HTMLElement;
	section: HTMLElement;
	start: () => number;
	canStart?: () => boolean;
	alignOnHold?: boolean;
	onHold: (delta: number) => void;
	onScroll: (delta: number, isNewGesture: boolean) => void;
	onReset: (alreadyPassed: boolean) => void;
};

let heldSection: HTMLElement | undefined;

export function bindStage({
	experience,
	section,
	start,
	canStart = () => true,
	alignOnHold = false,
	onHold,
	onScroll,
	onReset
}: StageOptions) {
	let unlock: (() => void) | undefined;
	let ready = false;
	let finished = false;
	let waitingForGesture = false;
	let anchor = Infinity;
	let heldAt = 0;

	function release() {
		const unlockScroll = unlock;
		unlock = undefined;
		if (heldSection === section) heldSection = undefined;
		input.sync();
		unlockScroll?.();
	}

	const isWaitingAtAnchor = () => waitingForGesture && Math.abs(window.scrollY - heldAt) <= 3;
	const canHold = () =>
		ready &&
		!finished &&
		!heldSection &&
		canStart() &&
		Number(document.documentElement.style.getPropertyValue('--experience-reveal')) >= 1;

	function hold(delta: number) {
		heldSection = section;
		unlock = lockScroll();
		input.consumeGesture();
		input.sync();
		heldAt = alignOnHold || section.getBoundingClientRect().top < 0 ? anchor : window.scrollY;
		if (Math.abs(window.scrollY - heldAt) > 0.5) scrollToImmediately(heldAt);
		onHold(delta);
	}

	const input = bindScrollInput({
		handleDirection(direction, isNewGesture, delta) {
			if (waitingForGesture) {
				if (isWaitingAtAnchor() && !isNewGesture) return true;
				waitingForGesture = false;
				input.sync();
			}

			if (!unlock) {
				// Also covers restoring the page inside this stage without a new onEnter callback.
				if (direction < 0 || window.scrollY < anchor || !canHold()) return false;
				hold(delta);
				return true;
			}

			if (direction < 0) {
				if (!isNewGesture) return true;
				release();
				return false;
			}

			onScroll(delta, isNewGesture);
			return true;
		},
		stopAtBoundary(delta) {
			const y = window.scrollY;
			if (delta <= 0 || y < anchor - 2 || y + delta < anchor || !canHold()) return false;

			hold(delta);
			return true;
		},
		isTransitioning: () => Boolean(unlock) || isWaitingAtAnchor(),
		shouldCapture: () =>
			Boolean(unlock) ||
			isWaitingAtAnchor() ||
			(ready && !finished && anchor - window.scrollY <= 160)
	});

	const trigger = ScrollTrigger.create({
		trigger: section,
		start,
		end: 'max',
		onEnter: () => {
			if (canHold()) hold(Math.max(0, window.scrollY - anchor));
		},
		onRefresh: (self) => {
			anchor = self.start;
			input.sync();
		}
	});
	anchor = trigger.start;

	function reset() {
		ready = false;
		waitingForGesture = false;
		const { top, bottom } = section.getBoundingClientRect();
		finished = alignOnHold ? bottom <= 0 : top < 0;
		onReset(finished);
		release();
		ready = true;
		input.sync();
	}

	reset();
	experience.addEventListener('experience-reveal-start', reset);

	return {
		canContinue: () => finished && !isWaitingAtAnchor(),
		finish() {
			finished = true;
			waitingForGesture = Boolean(unlock);
			release();
		},
		keepVisible(element: Element) {
			const overflow = element.getBoundingClientRect().bottom + 24 - window.innerHeight;
			if (overflow <= 0) return;

			heldAt = window.scrollY + overflow;
			scrollToImmediately(heldAt);
		},
		destroy() {
			experience.removeEventListener('experience-reveal-start', reset);
			trigger.kill();
			input.destroy();
			if (heldSection === section) heldSection = undefined;
			unlock?.();
		}
	};
}
