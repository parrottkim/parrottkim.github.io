import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
	bindScrollInput,
	isScrollLocked,
	lockScroll,
	scrollToImmediately
} from '#lib/scroll/scroll.ts';

/**
 * Question → Structure → Detail을 한 번의 스크롤 제스처마다 한 단계씩 진행한다.
 * Hero / Manifesto와 같은 scroll.ts의 제스처·잠금 관리자를 공유한다.
 */
export function bindPrinciples(experience: HTMLElement, section: HTMLElement, start: () => number) {
	gsap.registerPlugin(ScrollTrigger);

	const label = section.querySelector<HTMLElement>('.principles-label');
	const detailPanel = section.querySelector<HTMLElement>('.principles-details');
	const items = Array.from(section.querySelectorAll<HTMLElement>('.principles-item'));
	const details = Array.from(section.querySelectorAll<HTMLElement>('.principles-detail'));
	const segments = Array.from(section.querySelectorAll<HTMLElement>('.principles-segment'));

	if (
		!label ||
		!detailPanel ||
		!items.length ||
		details.length !== items.length ||
		segments.length !== items.length
	) {
		console.warn('[Principles] 원칙 항목, 설명, 인디케이터를 확인해주세요.');
		return { canContinue: () => true, destroy() {} };
	}

	let current = 0;
	let active = false;
	let completed = false;
	let suspendedBack = false;
	let destroyed = false;
	let ready = false;
	let anchor = Infinity;
	let reverseAnchor = Infinity;
	let refreshFrame = 0;
	let enteredFromBelow = false;
	let releaseLock: (() => void) | undefined;
	let transition: gsap.core.Timeline | undefined;
	let pendingDirection: 1 | -1 | undefined;

	const hidden = { autoAlpha: 0, y: 12 };
	const visible = { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' };
	const entrance = gsap
		.timeline({ paused: true, onComplete: playQueuedStep })
		.fromTo(label, hidden, { ...visible, duration: 0.21 }, 0)
		.fromTo(items, hidden, { ...visible, stagger: 0.115 }, 0.13)
		.fromTo(detailPanel, hidden, visible, '-=0.12')
		.fromTo(
			segments,
			{ autoAlpha: 0, x: -5 },
			{ autoAlpha: 1, x: 0, duration: 0.18, stagger: 0.045, ease: 'power2.out' },
			'-=0.12'
		);

	function playQueuedStep() {
		const direction = pendingDirection;
		pendingDirection = undefined;
		if (direction !== undefined) advance(direction);
	}

	function render(index: number, immediate = false) {
		const previous = current;
		current = index;

		items.forEach((item, i) => {
			item.classList.toggle('is-active', i === index);
			if (i === index) item.setAttribute('aria-current', 'step');
			else item.removeAttribute('aria-current');
		});
		segments.forEach((segment, i) => segment.classList.toggle('is-active', i === index));
		details.forEach((detail, i) => {
			detail.classList.toggle('is-active', i === index);
			if (i === index) detail.removeAttribute('aria-hidden');
			else detail.setAttribute('aria-hidden', 'true');
		});

		transition?.kill();
		transition = undefined;

		if (immediate || previous === index) {
			details.forEach((detail, i) => {
				gsap.set(detail, { autoAlpha: i === index ? 1 : 0, yPercent: 0, rotationX: 0 });
			});
			return;
		}

		const direction = Math.sign(index - previous);

		transition = gsap.timeline({
			onComplete: () => {
				transition = undefined;
				playQueuedStep();
			}
		});
		transition.to(
			details[previous],
			{
				autoAlpha: 0,
				yPercent: direction * -28,
				rotationX: direction * 36,
				duration: 0.14,
				ease: 'power2.in'
			},
			0
		);
		transition.fromTo(
			details[index],
			{ autoAlpha: 0, yPercent: direction * 36, rotationX: direction * -42 },
			{ autoAlpha: 1, yPercent: 0, rotationX: 0, duration: 0.21, ease: 'power3.out' },
			0.11
		);
	}

	function unlock() {
		pendingDirection = undefined;
		if (!active) return;
		active = false;
		const release = releaseLock;
		releaseLock = undefined;
		release?.();
	}

	function isExperienceVisible() {
		return Number(document.documentElement.style.getPropertyValue('--experience-reveal')) >= 0.99;
	}

	function canCapture() {
		return ready && !active && !destroyed && !isScrollLocked() && isExperienceVisible();
	}

	function alignToAnchor(fromBelow: boolean) {
		const target = (fromBelow ? reverseAnchor : anchor) + (fromBelow ? -1 : 1);
		if (Number.isFinite(target) && Math.abs(window.scrollY - target) > 0.5) {
			scrollToImmediately(target);
		}
	}

	function hold(fromBelow = false) {
		if (!canCapture() || (completed && !fromBelow) || suspendedBack) return;

		completed = false;
		enteredFromBelow = fromBelow;
		render(fromBelow ? items.length - 1 : 0, true);
		active = true;
		releaseLock = lockScroll();
		input.consumeGesture(); // 경계에 진입한 제스처는 단계 전환에 중복 사용하지 않는다.
		alignToAnchor(fromBelow);
		entrance.play();
	}

	function advance(direction: 1 | -1) {
		if (!active || destroyed) return;
		if (transition || entrance.totalProgress() < 1) {
			// 전환 중에는 가장 최근의 새 제스처를 한 번만 이어서 처리한다.
			pendingDirection = direction;
			return;
		}

		const next = current + direction;
		if (next >= 0 && next < items.length) {
			render(next);
			return;
		}

		if (direction > 0) {
			completed = true;
		} else {
			completed = false;
			suspendedBack = true;
		}
		unlock();
	}

	const input = bindScrollInput({
		handleDirection(direction, isNewGesture) {
			if (!active) return false;
			if (isNewGesture) advance(direction);
			// 구간을 벗어나는 입력은 페이지 스크롤로 이어진다.
			return active;
		},
		getBoundary(delta) {
			if (!canCapture()) return;
			const y = window.scrollY;
			if (delta > 0 && !completed && !suspendedBack && y <= anchor && y + delta >= anchor) {
				return { position: anchor, stop: () => hold() };
			}
			if (delta < 0 && completed && y >= reverseAnchor && y + delta <= reverseAnchor) {
				return { position: reverseAnchor, stop: () => hold(true) };
			}
		}
	});

	function reset() {
		transition?.kill();
		transition = undefined;
		unlock();
		suspendedBack = false;
		enteredFromBelow = false;
		completed = window.scrollY > reverseAnchor + 3;
		render(completed ? items.length - 1 : 0, true);
		entrance.pause().totalProgress(window.scrollY >= anchor ? 1 : 0, true);
	}

	function leaveExperience() {
		unlock();
		entrance.pause().totalProgress(0, true);
	}

	const trigger = ScrollTrigger.create({
		trigger: section,
		start,
		end: () => start() + Math.max(80, window.innerHeight * 0.1),
		onEnter: () => {
			entrance.play();
			hold();
		},
		onEnterBack: () => {
			entrance.play();
			if (completed) hold(true);
		},
		onUpdate: (self) => {
			if (self.isActive && self.direction > 0 && !completed && !suspendedBack) hold();
		},
		onLeaveBack: () => {
			entrance.reverse();
			if (active) unlock();
			completed = false;
			suspendedBack = false;
			render(0, true);
		},
		onRefresh: (self) => {
			anchor = self.start;
			reverseAnchor = self.end;
			if (!active) {
				if (ready) entrance.pause().totalProgress(window.scrollY >= anchor ? 1 : 0, true);
				return;
			}
			cancelAnimationFrame(refreshFrame);
			refreshFrame = requestAnimationFrame(() => {
				if (active) alignToAnchor(enteredFromBelow);
			});
		}
	});

	anchor = trigger.start;
	reverseAnchor = trigger.end;
	ready = true;
	reset();

	experience.addEventListener('experience-reveal-start', reset);
	experience.addEventListener('experience-reveal-leave', leaveExperience);

	return {
		canContinue: () => completed && !active,
		destroy() {
			destroyed = true;
			cancelAnimationFrame(refreshFrame);
			experience.removeEventListener('experience-reveal-start', reset);
			experience.removeEventListener('experience-reveal-leave', leaveExperience);
			entrance.revert();
			transition?.kill();
			items.forEach((item) => item.removeAttribute('aria-current'));
			details.forEach((detail) => detail.removeAttribute('aria-hidden'));
			unlock();
			input.destroy();
			trigger.kill();
		}
	};
}
