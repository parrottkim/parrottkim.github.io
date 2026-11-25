import * as THREE from 'three';

const STAR_COUNT = 350;
const STAR_COLOR_COUNT = 4;
const MIN_STAR_SPEED = 0.08;
const MAX_STAR_SPEED = 0.22;

type Star = {
	angle: number;
	lane: number;
	depth: number;
	transitionVisible: boolean;
	speed: number;
	width: number;
	colorIndex: number;
	appearDepth: number;
	active: boolean;
};

function random(min: number, max: number) {
	return min + Math.random() * (max - min);
}

function smoothstep(start: number, end: number, value: number) {
	const t = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);

	return t * t * (3 - 2 * t);
}

function resetStar(star: Star, initial = false) {
	star.angle = random(0, Math.PI * 2);
	star.lane = random(0.28, 1.15);
	star.depth = initial ? random(0.07, 1) : 1;
	star.transitionVisible = true;
	star.speed = random(MIN_STAR_SPEED, MAX_STAR_SPEED);
	star.width = random(0.0025, 0.0065);
	star.appearDepth = random(0.68, 0.92);
	star.active = true;
}

export type TunnelMotion = 'normal' | 'entering' | 'leaving';
export type TunnelTransition = {
	zoom: number;
	tunnelProgress: number;
};

export function createTunnel(aspect: number) {
	const safeAspect = Math.max(1, aspect);

	const scene = new THREE.Scene();

	const camera = new THREE.OrthographicCamera(-safeAspect, safeAspect, 1, -1, 0.1, 10);

	camera.position.z = 1;

	const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

	// 확대 시 전체 화면을 고려한 렌더 타깃 해상도
	const targetWidth = Math.min(2560, Math.max(960, Math.ceil(window.innerWidth * pixelRatio)));

	const targetHeight = Math.max(1, Math.round(targetWidth / safeAspect));

	const target = new THREE.WebGLRenderTarget(targetWidth, targetHeight, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		depthBuffer: false,
		stencilBuffer: false
	});

	const geometry = new THREE.PlaneGeometry(1, 1);
	const material = new THREE.ShaderMaterial({
		uniforms: {
			uOpacity: { value: 1 },
			uTransitionOpacity: { value: 1 },
			uBurst: { value: 0 },
			uCenterScale: { value: 1 }
		},

		vertexShader: `
			varying vec2 vUv;
			varying vec3 vColor;
			varying vec2 vTunnelPosition;

			void main() {
				vUv = uv;
				vColor = instanceColor;

				vec4 tunnelPosition = instanceMatrix * vec4(position, 1.0);
				vTunnelPosition = tunnelPosition.xy;
				gl_Position = projectionMatrix * modelViewMatrix * tunnelPosition;
			}
		`,

		fragmentShader: `
			uniform float uOpacity;
			uniform float uTransitionOpacity;
			uniform float uBurst;
			uniform float uCenterScale;

			varying vec2 vUv;
			varying vec3 vColor;
			varying vec2 vTunnelPosition;

			void main() {
				// 별 궤적의 양 끝을 부드럽게 처리
				float tail = smoothstep(
					0.0,
					mix(0.22, 0.8, uBurst),
					vUv.x
				);

				float head = 1.0 - smoothstep(
					mix(0.82, 0.94, uBurst),
					1.0,
					vUv.x
				);

				float edge = 1.0 - smoothstep(
					0.08,
					0.5,
					abs(vUv.y - 0.5)
				);
				float centerFade = smoothstep(0.035, 0.28, length(vTunnelPosition) / uCenterScale);

				float alpha =
					head *
					tail *
					edge *
					centerFade *
					uOpacity *
					uTransitionOpacity *
					mix(1.0, 1.38, uBurst);

				if (alpha < 0.01) discard;

				gl_FragColor = vec4(vColor, min(alpha, 1.0));
			}
		`,

		transparent: true,
		depthWrite: false,
		depthTest: false,
		toneMapped: false,
		blending: THREE.AdditiveBlending
	});

	const mesh = new THREE.InstancedMesh(geometry, material, STAR_COUNT);

	mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

	mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(STAR_COUNT * 3), 3);

	mesh.frustumCulled = false;
	scene.add(mesh);

	const stars = Array.from({ length: STAR_COUNT }, () => {
		const star: Star = {
			angle: 0,
			lane: 0,
			depth: 1,
			transitionVisible: true,
			speed: 0,
			width: 0,
			colorIndex: Math.floor(Math.random() * STAR_COLOR_COUNT),
			appearDepth: 0,
			active: true
		};

		resetStar(star, true);
		return star;
	});

	const dummy = new THREE.Object3D();
	const color = new THREE.Color();

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let previousTime = performance.now();
	let currentTheme: boolean | undefined;
	let currentMotion: TunnelMotion = 'normal';

	// 기존 방사형 원근 투영
	function projectRadius(star: Star) {
		return star.lane * (1 / star.depth - 0.72) * 0.28;
	}

	function updateTheme(isDark: boolean) {
		currentTheme = isDark;

		const styles = getComputedStyle(document.documentElement);

		const readColor = (name: string, fallback: string) =>
			styles.getPropertyValue(name).trim() || fallback;

		const palette = Array.from({ length: STAR_COLOR_COUNT }, (_, index) =>
			readColor(`--hero-tunnel-star-${index + 1}`, '#ffffff')
		);

		const opacity = Number.parseFloat(styles.getPropertyValue('--hero-tunnel-opacity'));

		scene.background = new THREE.Color(readColor('--hero-tunnel-background', '#000000'));

		material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

		material.uniforms.uOpacity.value = Number.isFinite(opacity) ? opacity : 1;

		material.needsUpdate = true;

		for (let i = 0; i < stars.length; i++) {
			mesh.setColorAt(i, color.set(palette[stars[i].colorIndex]));
		}

		if (mesh.instanceColor) {
			mesh.instanceColor.needsUpdate = true;
		}
	}

	function hideStar(index: number) {
		dummy.position.set(0, 0, 0);
		dummy.scale.set(0, 0, 0);
		dummy.updateMatrix();

		mesh.setMatrixAt(index, dummy.matrix);
	}

	function updateStars(
		delta: number,
		baseSpeedMultiplier: number,
		motion: TunnelMotion,
		tunnelProgress: number,
		firstPass: number,
		burst: number
	) {
		const isEntering = motion === 'entering';
		const firstPassBoost = 1 + 1.6 * firstPass;
		const trailBlend = smoothstep(0, 0.24, tunnelProgress);
		const maxZoomTrailLength = THREE.MathUtils.lerp(0.32, 0.68, burst);
		const radiusScale = 1 + 0.48 * burst;
		const outsideLimit = 1.25 + 0.35 * burst;
		const exitProgress = isEntering
			? THREE.MathUtils.clamp((tunnelProgress - 0.72) / 0.28, 0, 1)
			: 0;
		const exitSweep = exitProgress * exitProgress;

		for (let i = 0; i < stars.length; i++) {
			const star = stars[i];

			if (isEntering && (!star.transitionVisible || !star.active)) {
				hideStar(i);
				continue;
			}

			if (!isEntering && !star.active) {
				resetStar(star, true);
			}

			const speedRatio = (star.speed - MIN_STAR_SPEED) / (MAX_STAR_SPEED - MIN_STAR_SPEED);
			const baseSpeed = star.speed * baseSpeedMultiplier;
			let speed = baseSpeed;
			if (isEntering) {
				// 빠른 별이 먼저 빠져나가고, 후반에는 느린 별의 가속 폭이 더 커진다.
				const exitSpeed = THREE.MathUtils.lerp(0.85, 1.44, speedRatio);
				speed = THREE.MathUtils.lerp(baseSpeed * firstPassBoost, exitSpeed, burst);
			}
			star.depth -= speed * delta;

			// 카메라에 가까워진 별 처리
			if (star.depth <= 0.04) {
				if (!isEntering) {
					resetStar(star);
				} else {
					star.depth = 0.04;
					star.active = false;
					hideStar(i);
					continue;
				}
			}

			// 진입 끝에는 남은 별을 꼬리까지 화면 바깥으로 밀어낸다.
			const cos = Math.cos(star.angle);
			const sin = Math.sin(star.angle);
			const edgeFactor = Math.max(Math.abs(cos), Math.abs(sin));
			const exitRadius = (outsideLimit + 0.02) / edgeFactor;
			const radius = projectRadius(star) * radiusScale + exitRadius * exitSweep;
			const x = cos * radius * safeAspect;
			const y = sin * radius;
			const outside = radius * edgeFactor > outsideLimit;

			if (outside) {
				if (!isEntering) {
					resetStar(star);
				} else {
					star.active = false;
				}

				hideStar(i);
				continue;
			}

			// 별마다 다른 깊이에서 부드럽게 등장
			// 특정 반경에 별이 모이는 현상 방지
			const appear = 1 - smoothstep(star.appearDepth - 0.12, star.appearDepth + 0.12, star.depth);

			if (appear <= 0.001) {
				star.active = true;
				hideStar(i);
				continue;
			}

			star.active = true;

			const direction = Math.atan2(y, x);

			const trailProjection = (0.15 * radiusScale) / (star.depth * star.depth);
			let length = THREE.MathUtils.clamp(baseSpeed * trailProjection, 0.028, 0.32);

			if (isEntering) {
				// 확대 중에는 빠른 별이 짧게 스치고 느린 별의 꼬리가 길게 남는다.
				const trailScale = THREE.MathUtils.lerp(1, 0.35, speedRatio);
				const averageSpeed = (MIN_STAR_SPEED + MAX_STAR_SPEED) / 2;
				const zoomLength = THREE.MathUtils.clamp(
					averageSpeed * (speed / star.speed) * trailProjection,
					0.028,
					maxZoomTrailLength
				);

				length = THREE.MathUtils.lerp(length, zoomLength * trailScale, trailBlend);
			}

			const thickness = THREE.MathUtils.clamp(star.width / star.depth, 0.005, 0.035);
			const trailLength = length * appear;
			const trailOffset = 0.38 * burst * trailLength;

			dummy.position.set(
				x - Math.cos(direction) * trailOffset,
				y - Math.sin(direction) * trailOffset,
				0
			);
			dummy.rotation.set(0, 0, direction);

			dummy.scale.set(trailLength, thickness * Math.sqrt(appear), 1);

			dummy.updateMatrix();

			mesh.setMatrixAt(i, dummy.matrix);
		}

		mesh.instanceMatrix.needsUpdate = true;
	}

	function render(
		renderer: THREE.WebGLRenderer,
		baseSpeedMultiplier: number,
		motion: TunnelMotion,
		{ zoom, tunnelProgress }: TunnelTransition
	) {
		const now = performance.now();

		const delta = Math.min((now - previousTime) / 1000, 0.05);

		previousTime = now;

		const isDark = document.documentElement.dataset.theme === 'dark';

		if (isDark !== currentTheme) {
			updateTheme(isDark);
		}

		// 진입 및 복귀 상태 전환
		if (motion !== currentMotion) {
			if (motion === 'entering') {
				for (const star of stars) {
					// 진입 시작 시 표시된 별만 유지
					star.transitionVisible = star.active && star.depth < star.appearDepth + 0.12;
				}
			} else if (motion === 'leaving') {
				for (const star of stars) {
					resetStar(star, true);
				}
			}

			currentMotion = motion;
		}

		const returnOpacity = motion === 'leaving' ? smoothstep(0.08, 0.75, 1 - zoom) : 1;
		material.uniforms.uTransitionOpacity.value = returnOpacity;

		const firstPass = smoothstep(0.08, 0.46, tunnelProgress);
		const burstProgress = smoothstep(0.52, 0.91, tunnelProgress);
		const centerGrowth = 0.4 * firstPass + 0.6 * burstProgress;
		material.uniforms.uCenterScale.value = THREE.MathUtils.lerp(1, 4.5, centerGrowth);

		const burst = motion === 'entering' ? burstProgress : 0;
		material.uniforms.uBurst.value = burst;
		updateStars(
			reducedMotion ? 0 : delta,
			baseSpeedMultiplier,
			motion,
			tunnelProgress,
			firstPass,
			burst
		);

		// 오프스크린 렌더링
		const previousTarget = renderer.getRenderTarget();

		renderer.setRenderTarget(target);
		renderer.render(scene, camera);
		renderer.setRenderTarget(previousTarget);
	}

	function dispose() {
		geometry.dispose();
		material.dispose();
		target.dispose();
	}

	updateTheme(document.documentElement.dataset.theme === 'dark');

	updateStars(0, 1, 'normal', 0, 0, 0);

	return {
		texture: target.texture,
		updateTheme,
		render,
		dispose
	};
}
