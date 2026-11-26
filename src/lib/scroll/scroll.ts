import Lenis, { type VirtualScrollData } from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type ScrollInputOptions = {
	handleDirection: (direction: 1 | -1, isNewGesture: boolean, delta: number) => boolean;
	getBoundary: (delta: number) => ScrollBoundary | undefined;
	onNewGesture?: () => void;
};

type ScrollBoundary = { position: number; stop: () => void };

const WHEEL_GESTURE_GAP = 180;
const inputs = new Set<ScrollInputOptions & { lastWheelTime: number; touchMoved: boolean }>();
let active: Lenis | null = null;
let locks = 0;
let touchWasConsumed = false;

export function bindScrollInput(options: ScrollInputOptions) {
	const input = { ...options, lastWheelTime: -Infinity, touchMoved: false };
	inputs.add(input);

	return {
		consumeGesture() {
			input.lastWheelTime = performance.now();
			input.touchMoved = true;
		},
		destroy: () => inputs.delete(input)
	};
}

function dispatchScroll(delta: number, source: 'wheel' | 'touch' | 'keyboard', repeat = false) {
	const direction = delta > 0 ? 1 : -1;
	const now = performance.now();

	const handlers: { input: ScrollInputOptions; isNewGesture: boolean }[] = [];
	for (const input of inputs) {
		let isNewGesture = !repeat;
		if (source === 'wheel') {
			isNewGesture = now - input.lastWheelTime >= WHEEL_GESTURE_GAP;
			input.lastWheelTime = now;
		} else if (source === 'touch') {
			isNewGesture = !input.touchMoved;
			input.touchMoved = true;
		}

		handlers.push({ input, isNewGesture });
	}

	// Release completed stages before deciding which boundary the new gesture reaches.
	for (const { input, isNewGesture } of handlers) {
		if (isNewGesture) input.onNewGesture?.();
	}

	if (source !== 'keyboard') {
		let closest: ScrollBoundary | undefined;
		for (const { input } of handlers) {
			const candidate = input.getBoundary(delta);
			if (!candidate) continue;

			if (
				!closest ||
				(direction > 0
					? candidate.position < closest.position
					: candidate.position >= closest.position)
			) {
				closest = candidate;
			}
		}
		if (closest) {
			closest.stop();
			return true;
		}
	}
	for (const { input, isNewGesture } of handlers) {
		if (input.handleDirection(direction, isNewGesture, delta)) return true;
	}

	return false;
}

function handleVirtualScroll({ deltaX, deltaY, event }: VirtualScrollData) {
	if (event.type === 'touchstart') {
		touchWasConsumed = false;
		for (const input of inputs) input.touchMoved = false;
		return (event as TouchEvent).touches.length === 1;
	}

	// A drag claimed by a stage must not turn into Lenis momentum when the finger lifts.
	if (event.type === 'touchend') return !touchWasConsumed && !isScrollLocked();
	if (event.type !== 'wheel' && event.type !== 'touchmove') return true;
	if (event.defaultPrevented || (event as WheelEvent).ctrlKey) return false;
	const touch = event.type === 'touchmove';
	if (touch && (event as TouchEvent).touches.length !== 1) return false;
	if (touch && Math.abs(deltaX) > Math.abs(deltaY)) {
		touchWasConsumed = true;
		return false;
	}
	if (deltaY === 0) return false;
	if (touch && !event.cancelable && !isScrollLocked()) {
		// Safari can already own this gesture. Let ScrollTrigger observe the native movement.
		touchWasConsumed = true;
		return false;
	}

	if (
		!dispatchScroll(deltaY, touch ? 'touch' : 'wheel') &&
		!isScrollLocked() &&
		(!touch || event.cancelable)
	) {
		return true;
	}
	if (touch) touchWasConsumed = true;
	if (event.cancelable) event.preventDefault();
	return false;
}

function handleScrollKey(event: KeyboardEvent) {
	if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
	const target = event.target;
	if (
		target instanceof HTMLElement &&
		(target.isContentEditable || target.closest('input, textarea, select'))
	) {
		return;
	}

	let direction: 1 | -1;
	switch (event.key) {
		case 'ArrowDown':
		case 'PageDown':
			direction = 1;
			break;
		case 'ArrowUp':
		case 'PageUp':
		case 'Home':
			direction = -1;
			break;
		case 'End':
			if (!event.repeat) {
				for (const input of inputs) input.onNewGesture?.();
			}
			if (isScrollLocked()) event.preventDefault();
			return;
		default:
			if (
				event.code !== 'Space' ||
				(target instanceof HTMLElement && target.closest('button, a, summary, [role="button"]'))
			)
				return;
			direction = event.shiftKey ? -1 : 1;
	}

	const distance = event.key.startsWith('Arrow') ? 48 : window.innerHeight * 0.2;
	if (dispatchScroll(distance * direction, 'keyboard', event.repeat) || isScrollLocked()) {
		event.preventDefault();
	}
}

export function initializeScroll() {
	gsap.registerPlugin(ScrollTrigger);
	ScrollTrigger.config({ ignoreMobileResize: true });
	const sortTriggers = () => ScrollTrigger.sort();
	ScrollTrigger.addEventListener('refresh', sortTriggers);
	const lenis = new Lenis({
		syncTouch: true,
		anchors: true,
		stopInertiaOnNavigate: true,
		virtualScroll: handleVirtualScroll
	});
	active = lenis;
	if (isScrollLocked()) lenis.stop();

	lenis.on('scroll', ScrollTrigger.update);
	const tick = (time: number) => lenis.raf(time * 1000);
	gsap.ticker.add(tick);
	gsap.ticker.lagSmoothing(0);
	window.addEventListener('keydown', handleScrollKey);

	return () => {
		ScrollTrigger.removeEventListener('refresh', sortTriggers);
		window.removeEventListener('keydown', handleScrollKey);
		gsap.ticker.remove(tick);
		lenis.destroy();
		if (active === lenis) active = null;
	};
}

export function lockScroll() {
	locks += 1;
	if (locks === 1) active?.stop();
	let released = false;

	return () => {
		if (released) return;
		released = true;
		locks -= 1;
		if (!isScrollLocked()) active?.start();
	};
}

export function isScrollLocked() {
	return locks > 0;
}

export function scrollToImmediately(top: number) {
	active?.scrollTo(top, { immediate: true, force: true });
}
