export type ScrollDirection = 1 | -1;

const WHEEL_GESTURE_GAP = 180;

type LenisInputEvent = Event & {
	lenisStopPropagation?: boolean;
};

type ScrollInputOptions = {
	handleDirection: (direction: ScrollDirection, isNewGesture: boolean, delta: number) => boolean;
	stopAtBoundary: (delta: number) => boolean;
	isTransitioning: () => boolean;
	shouldCapture: () => boolean;
};

export function bindScrollInput({
	handleDirection,
	stopAtBoundary,
	isTransitioning,
	shouldCapture
}: ScrollInputOptions) {
	let lastWheelTime = -Infinity;
	let lastTouchY = 0;
	let touchMoved = false;

	function onWheel(event: WheelEvent) {
		if (event.defaultPrevented || event.ctrlKey || event.deltaY === 0) return;

		const now = performance.now();
		const isNewGesture = now - lastWheelTime >= WHEEL_GESTURE_GAP;
		lastWheelTime = now;

		const direction = event.deltaY > 0 ? 1 : -1;
		const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
		const delta = event.deltaY * factor;

		if (stopAtBoundary(delta) || handleDirection(direction, isNewGesture, delta)) {
			(event as LenisInputEvent).lenisStopPropagation = true;
			event.preventDefault();
		}
	}

	function onTouchStart(event: TouchEvent) {
		lastTouchY = event.touches[0]?.clientY ?? 0;
		touchMoved = false;
	}

	function onTouchMove(event: TouchEvent) {
		if (event.defaultPrevented || event.touches.length !== 1) return;

		const currentY = event.touches[0].clientY;
		const delta = lastTouchY - currentY;
		lastTouchY = currentY;

		if (Math.abs(delta) < 2) {
			if (isTransitioning()) {
				(event as LenisInputEvent).lenisStopPropagation = true;
				event.preventDefault();
			}
			return;
		}

		const isNewGesture = !touchMoved;
		touchMoved = true;
		const direction = delta > 0 ? 1 : -1;
		if (stopAtBoundary(delta) || handleDirection(direction, isNewGesture, delta)) {
			(event as LenisInputEvent).lenisStopPropagation = true;
			event.preventDefault();
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;

		const target = event.target;
		if (
			target instanceof HTMLElement &&
			target.closest('input, textarea, select, [contenteditable]')
		) {
			return;
		}

		let direction: ScrollDirection;

		if (
			event.key === 'ArrowDown' ||
			event.key === 'PageDown' ||
			(event.code === 'Space' && !event.shiftKey)
		) {
			direction = 1;
		} else if (
			event.key === 'ArrowUp' ||
			event.key === 'PageUp' ||
			event.key === 'Home' ||
			(event.code === 'Space' && event.shiftKey)
		) {
			direction = -1;
		} else {
			if (isTransitioning() && event.key === 'End') {
				event.preventDefault();
			}
			return;
		}

		const distance = event.key.startsWith('Arrow') ? 48 : window.innerHeight * 0.2;
		if (handleDirection(direction, !event.repeat, distance * direction)) {
			event.preventDefault();
		}
	}

	let capturing = false;

	function sync() {
		const next = shouldCapture();
		if (next === capturing) return;

		capturing = next;

		if (capturing) {
			window.addEventListener('wheel', onWheel, { passive: false, capture: true });
			window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
		} else {
			window.removeEventListener('wheel', onWheel, true);
			window.removeEventListener('touchmove', onTouchMove, true);
		}
	}

	window.addEventListener('scroll', sync, { passive: true });
	window.addEventListener('touchstart', onTouchStart, { passive: true });
	window.addEventListener('keydown', onKeyDown);
	sync();

	return {
		sync,
		consumeGesture() {
			lastWheelTime = performance.now();
			touchMoved = true;
		},
		destroy() {
			window.removeEventListener('scroll', sync);
			window.removeEventListener('wheel', onWheel, true);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove, true);
			window.removeEventListener('keydown', onKeyDown);
		}
	};
}
