import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
	bindScrollInput,
	isScrollLocked,
	lockScroll,
	scrollToImmediately
} from '#lib/scroll/scroll.ts';

type StageOptions = {
	experience: HTMLElement;
	section: HTMLElement;
	start: () => number;
	canStart?: () => boolean;
	onHold: (delta: number) => void;
	onScroll: (delta: number, isNewGesture: boolean) => void;
	onReverse?: () => void;
	onReverseScroll?: (delta: number, isNewGesture: boolean) => void;
	onReset: (alreadyPassed: boolean) => void;
};

export function bindStage({
	experience,
	section,
	start,
	canStart = () => true,
	onHold,
	onScroll,
	onReverse,
	onReverseScroll,
	onReset
}: StageOptions) {
	let unlock: (() => void) | undefined;
	let ready = false;
	let finished = false;
	let reversing = false;
	let waitingForGesture = false;
	let anchor = Infinity;
	let refreshFrame = 0;

	function release() {
		const unlockScroll = unlock;
		unlock = undefined;
		unlockScroll?.();
	}

	const canUseBoundary = () =>
		ready &&
		!isScrollLocked() &&
		Number(document.documentElement.style.getPropertyValue('--experience-reveal')) >= 1;
	const canHold = () => !finished && canStart() && canUseBoundary();
	const canReverse = () => Boolean(onReverse) && finished && canUseBoundary();

	function holdAtAnchor() {
		unlock ??= lockScroll();
		input.consumeGesture();
		alignToAnchor();
	}

	function alignToAnchor() {
		if (Math.abs(window.scrollY - anchor) > 0.5) scrollToImmediately(anchor);
	}

	function hold(delta: number) {
		holdAtAnchor();
		onHold(delta);
	}

	function reverse() {
		if (!onReverse) return;
		reversing = true;
		holdAtAnchor();
		onReverse();
	}

	function finish(hasPassed: boolean) {
		finished = hasPassed;
		reversing = false;
		waitingForGesture = Boolean(unlock);
	}

	const input = bindScrollInput({
		onNewGesture() {
			if (!waitingForGesture) return;
			waitingForGesture = false;
			release();
		},
		handleDirection(direction, isNewGesture, delta) {
			if (waitingForGesture) return true;

			if (!unlock) {
				if (direction < 0 && Math.abs(window.scrollY - anchor) <= 3 && canReverse()) {
					reverse();
					return true;
				}
				// Also covers restoring the page inside this stage without a new onEnter callback.
				if (direction < 0 || window.scrollY < anchor || !canHold()) return false;
				hold(delta);
				return true;
			}

			if (reversing) {
				onReverseScroll?.(delta, isNewGesture);
				return true;
			}

			if (direction < 0) {
				if (!isNewGesture) return true;
				if (onReverse) {
					reverse();
					return true;
				}
				release();
				return false;
			}

			onScroll(delta, isNewGesture);
			return true;
		},
		getBoundary(delta) {
			const y = window.scrollY;
			if (
				delta < 0 &&
				(Math.abs(y - anchor) <= 3 || (y > anchor && y + delta <= anchor)) &&
				canReverse()
			) {
				return { position: anchor, stop: reverse };
			}
			if (delta > 0 && y <= anchor && y + delta >= anchor && canHold()) {
				return { position: anchor, stop: () => hold(delta) };
			}
		}
	});

	const trigger = ScrollTrigger.create({
		trigger: section,
		start,
		end: 'max',
		onEnter: () => {
			if (canHold()) hold(Math.max(0, window.scrollY - anchor));
		},
		onLeaveBack: () => {
			if (canReverse()) reverse();
		},
		onRefresh: (self) => {
			anchor = self.start;
			if (!unlock) return;
			cancelAnimationFrame(refreshFrame);
			refreshFrame = requestAnimationFrame(() => {
				if (unlock) alignToAnchor();
			});
		}
	});
	anchor = trigger.start;

	function reset() {
		ready = false;
		waitingForGesture = false;
		reversing = false;
		finished = window.scrollY > anchor + 3;
		onReset(finished);
		release();
		ready = true;
	}

	reset();
	experience.addEventListener('experience-reveal-start', reset);

	return {
		canContinue: () => finished && !reversing && !waitingForGesture,
		finish: () => finish(true),
		finishReverse: () => finish(false),
		destroy() {
			cancelAnimationFrame(refreshFrame);
			experience.removeEventListener('experience-reveal-start', reset);
			trigger.kill();
			input.destroy();
			release();
		}
	};
}
