import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createTunnel, type TunnelMotion, type TunnelTransition } from './tunnel';

type HeroSceneOptions = {
	model: GLTF;
	canvas: HTMLDivElement;
};

type ScreenPose = {
	center: THREE.Vector3;
	normal: THREE.Vector3;
	up: THREE.Vector3;
	width: number;
	height: number;
	initialNDC: THREE.Vector3;
};

const MOBILE_VIEW_MIN_WIDTH = 360;
const MOBILE_VIEW_MAX_WIDTH = 768;
const MOBILE_VIEW_MIN_ZOOM = 0.64;

export function createHeroScene({ model, canvas }: HeroSceneOptions) {
	let disposed = false;

	const scene = new THREE.Scene();
	const macbook = model.scene.clone(true);
	const lid = macbook.getObjectByName('tops');
	const lidHinge = macbook.getObjectByName('tops_rotation');

	// 프레임 0에서 상판 하단이 하판 상단과 약 0.455mm 겹친다.
	// 약 0.5mm의 실제 간격을 확보해 sub-pixel 점선처럼 보이는 이음새를 방지한다.
	if (lid) lid.position.y += 0.00095;

	const screenSurface = macbook.getObjectByName('screen') as THREE.Mesh | undefined;
	const modelMaterials = new Set<THREE.Material>();

	macbook.traverse((object) => {
		if (!(object instanceof THREE.Mesh)) return;

		const polishMaterial = (source: THREE.Material) => {
			const material = source.clone();

			if (material instanceof THREE.MeshStandardMaterial) {
				// 원본 GLB의 emissiveStrength 2.5는 스튜디오 조명과 중복되어 표면을 띄운다.
				material.emissiveIntensity = 0;
				// 상판 앞쪽의 스캔 노멀 노이즈는 닫힌 이음새를 점선처럼 만든다.
				if (object.name === 'tops_mesh') {
					material.normalMap = null;
					material.normalScale.set(0, 0);
				} else {
					material.normalScale.multiplyScalar(0.55);
				}
				// 닫힌 상태에서 상판 안쪽 backface가 흰 반사선으로 노출되지 않게 한다.
				material.side = THREE.FrontSide;
			}

			modelMaterials.add(material);
			return material;
		};

		object.material = Array.isArray(object.material)
			? object.material.map(polishMaterial)
			: polishMaterial(object.material);
	});

	// 밝은 배경이 상·하판 사이로 비치지 않도록 실제 맥북의 검은 가스켓을 재현한다.
	const seamGeometry = new THREE.BoxGeometry(0.381, 0.0005, 0.001);
	const seamMaterial = new THREE.MeshBasicMaterial({
		color: 0x0b0c0e,
		toneMapped: false
	});
	const seam = new THREE.Mesh(seamGeometry, seamMaterial);
	seam.name = 'lid_seam_gasket';
	seam.position.set(0, 0.00434, 0.27855);
	seam.renderOrder = 1;
	lidHinge?.add(seam);

	const box = new THREE.Box3().setFromObject(macbook);
	const size = box.getSize(new THREE.Vector3());
	const center = box.getCenter(new THREE.Vector3());
	const modelSize = Math.max(size.x, size.y, size.z);

	const pivot = new THREE.Group();
	pivot.position.copy(center);
	macbook.position.sub(center);
	pivot.add(macbook);
	scene.add(pivot);

	const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100);
	camera.position.set(center.x, center.y + size.y * 0.3, center.z + modelSize * 4);
	camera.lookAt(center);
	camera.translateY(size.y * 9);

	const initialCameraPosition = camera.position.clone();
	const initialCameraQuaternion = camera.quaternion.clone();

	const lightDistance = modelSize * 2;
	const hemisphereLight = new THREE.HemisphereLight(0xf4f7ff, 0x20242b, 0.55);

	const keyLight = new THREE.RectAreaLight(0xffffff, 3.2, modelSize * 3.5, modelSize * 3.5);
	keyLight.position.set(
		center.x - lightDistance * 0.7,
		center.y + lightDistance,
		center.z + lightDistance
	);
	keyLight.lookAt(center);

	const fillLight = new THREE.RectAreaLight(0xcfe0ff, 1.35, modelSize * 3, modelSize * 3);
	fillLight.position.set(
		center.x + lightDistance,
		center.y + lightDistance * 0.35,
		center.z + lightDistance * 0.5
	);
	fillLight.lookAt(center);

	const rimLight = new THREE.RectAreaLight(0xffead8, 1.8, modelSize * 2.5, modelSize * 2.5);
	rimLight.position.set(center.x, center.y + lightDistance * 0.7, center.z - lightDistance);
	rimLight.lookAt(center);

	scene.add(hemisphereLight, keyLight, fillLight, rimLight);

	const shadowCanvas = document.createElement('canvas');
	shadowCanvas.width = 256;
	shadowCanvas.height = 256;

	const shadowContext = shadowCanvas.getContext('2d');
	if (shadowContext) {
		const gradient = shadowContext.createRadialGradient(128, 128, 8, 128, 128, 124);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0.46)');
		gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.2)');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
		shadowContext.fillStyle = gradient;
		shadowContext.fillRect(0, 0, 256, 256);
	}

	const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
	const shadowGeometry = new THREE.PlaneGeometry(modelSize * 2.2, modelSize * 1.25);
	const shadowMaterial = new THREE.MeshBasicMaterial({
		map: shadowTexture,
		transparent: true,
		opacity: 0.72,
		depthWrite: false,
		toneMapped: false
	});
	const contactShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
	contactShadow.position.set(0, box.min.y - center.y - modelSize * 0.015, 0);
	contactShadow.rotation.x = -Math.PI / 2;
	contactShadow.renderOrder = -1;
	pivot.add(contactShadow);

	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	canvas.appendChild(renderer.domElement);

	let screenMaterial: THREE.MeshBasicMaterial | undefined;
	let tunnel: ReturnType<typeof createTunnel> | undefined;

	if (screenSurface) {
		const geometry = screenSurface.geometry;
		if (!geometry.boundingBox) geometry.computeBoundingBox();

		const bounds = geometry.boundingBox;
		if (bounds) {
			const screenAspect = (bounds.max.x - bounds.min.x) / (bounds.max.z - bounds.min.z);
			tunnel = createTunnel(screenAspect);

			// GLB 화면 UV의 좌우 방향을 렌더 타깃 텍스처에서 바로잡는다.
			tunnel.texture.offset.set(1, 0);
			tunnel.texture.repeat.set(-1, 1);
			tunnel.texture.needsUpdate = true;

			screenMaterial = new THREE.MeshBasicMaterial({
				color: 0x030504,
				toneMapped: false,
				side: THREE.FrontSide
			});

			const previousMaterial = screenSurface.material;
			const previousMaterials = Array.isArray(previousMaterial)
				? previousMaterial
				: [previousMaterial];

			for (const material of previousMaterials) {
				modelMaterials.delete(material);
				material.dispose();
			}

			screenSurface.material = screenMaterial;
		}
	}

	function setScreenActive(active: boolean) {
		if (!screenMaterial || !tunnel) return;

		screenMaterial.map = active ? tunnel.texture : null;
		screenMaterial.color.set(active ? 0xffffff : 0x030504);
		screenMaterial.needsUpdate = true;
	}

	let themeObserver: MutationObserver | undefined;

	function updateTheme() {
		const isDark = document.documentElement.dataset.theme === 'dark';

		tunnel?.updateTheme(isDark);
		renderer.toneMappingExposure = isDark ? 0.82 : 1;
		hemisphereLight.intensity = isDark ? 0.18 : 0.45;
		keyLight.intensity = isDark ? 1.35 : 2.6;
		fillLight.intensity = isDark ? 0.35 : 1;
		rimLight.intensity = isDark ? 0.65 : 1.35;
		scene.environmentIntensity = isDark ? 0.3 : 0.62;
		shadowMaterial.opacity = isDark ? 0.95 : 0.6;

		for (const material of modelMaterials) {
			if (material instanceof THREE.MeshStandardMaterial) {
				material.envMapIntensity = isDark ? 0.38 : 0.72;
			}
		}
	}

	updateTheme();
	themeObserver = new MutationObserver(updateTheme);
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme']
	});

	let hdrTexture: THREE.DataTexture | undefined;

	new HDRLoader().setDataType(THREE.FloatType).load(
		'/hdri/studio_small_03_1k.hdr',
		(texture) => {
			if (disposed) {
				texture.dispose();
				return;
			}

			const data = texture.image.data as Float32Array;
			const neutralize = 0.8;

			for (let i = 0; i < data.length; i += 4) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

				data[i] = THREE.MathUtils.lerp(r, luminance, neutralize);
				data[i + 1] = THREE.MathUtils.lerp(g, luminance, neutralize);
				data[i + 2] = THREE.MathUtils.lerp(b, luminance, neutralize);
			}

			texture.needsUpdate = true;
			texture.mapping = THREE.EquirectangularReflectionMapping;
			hdrTexture = texture;
			scene.environment = texture;
			scene.environmentRotation.set(0, Math.PI, THREE.MathUtils.degToRad(15));
			updateTheme();
		},
		undefined,
		(error) => {
			console.warn('[Hero] HDRI 로딩 실패', error);
		}
	);

	const mixer = new THREE.AnimationMixer(macbook);
	const clip = model.animations.find((animation) => animation.name === 'tops_open_0_to_110');
	const action = clip ? mixer.clipAction(clip) : null;

	if (action) {
		action.setLoop(THREE.LoopOnce, 1);
		action.clampWhenFinished = true;
		action.play();
	}

	function setLidProgress(progress: number) {
		if (!action || !clip) return;

		lidProgress = THREE.MathUtils.clamp(progress, 0, 1);
		action.time = lidProgress * Math.max(0, clip.duration - 0.00001);
		mixer.update(0);
	}

	let lidProgress = 1;
	let tunnelMotion: TunnelMotion = 'normal';
	let tunnelTransition: TunnelTransition = { zoom: 0, tunnelProgress: 0 };
	let screenPose: ScreenPose | null = null;

	function measureScreenPose(): ScreenPose | null {
		if (!screenSurface) return null;

		pivot.updateMatrixWorld(true);

		const geometry = screenSurface.geometry;
		if (!geometry.boundingBox) {
			geometry.computeBoundingBox();
		}

		const bounds = geometry.boundingBox;
		if (!bounds) return null;

		const localCenter = bounds.getCenter(new THREE.Vector3());
		const screenCenter = screenSurface.localToWorld(localCenter.clone());
		const localWidth = bounds.max.x - bounds.min.x;
		const localHeight = bounds.max.z - bounds.min.z;
		const worldScale = screenSurface.getWorldScale(new THREE.Vector3());
		const width = localWidth * Math.abs(worldScale.x);
		const height = localHeight * Math.abs(worldScale.z);

		if (width <= 0 || height <= 0) return null;

		// 현재 GLB의 화면은 로컬 XZ 평면이다.
		const up = new THREE.Vector3(0, 0, 1).transformDirection(screenSurface.matrixWorld);
		const normal = new THREE.Vector3(0, -1, 0).transformDirection(screenSurface.matrixWorld);
		const toCamera = initialCameraPosition.clone().sub(screenCenter);

		if (normal.dot(toCamera) < 0) {
			normal.negate();
		}

		camera.position.copy(initialCameraPosition);
		camera.quaternion.copy(initialCameraQuaternion);
		camera.updateMatrixWorld(true);

		return {
			center: screenCenter,
			normal,
			up,
			width,
			height,
			initialNDC: screenCenter.clone().project(camera)
		};
	}

	function updateTransition(state: TunnelTransition, motion: TunnelMotion) {
		const { zoom } = state;
		tunnelTransition = state;
		tunnelMotion = motion;
		camera.position.copy(initialCameraPosition);
		camera.quaternion.copy(initialCameraQuaternion);
		camera.updateMatrixWorld(true);

		if (zoom <= 0) return;

		screenPose ??= measureScreenPose();
		if (!screenPose) return;

		const pose = screenPose;
		const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / camera.zoom;
		const heightDistance = pose.height / (2 * tanHalfFov);
		const widthDistance = pose.width / (2 * tanHalfFov * camera.aspect);
		const coverDistance =
			Math.min(
				heightDistance / (1 + Math.abs(pose.initialNDC.y)),
				widthDistance / (1 + Math.abs(pose.initialNDC.x))
			) * 0.85;
		const distance = Math.max(camera.near * 2, coverDistance);
		const targetPosition = pose.center.clone().addScaledVector(pose.normal, distance);
		const targetRotation = new THREE.Quaternion().setFromRotationMatrix(
			new THREE.Matrix4().lookAt(targetPosition, pose.center, pose.up)
		);

		camera.position.lerp(targetPosition, zoom);
		camera.quaternion.slerp(targetRotation, zoom);

		const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
		const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
		const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
		const toScreen = pose.center.clone().sub(camera.position);
		const depth = toScreen.dot(forward);

		if (depth > camera.near) {
			const offsetX = toScreen.dot(right) - depth * tanHalfFov * camera.aspect * pose.initialNDC.x;
			const offsetY = toScreen.dot(up) - depth * tanHalfFov * pose.initialNDC.y;

			camera.position.addScaledVector(right, offsetX);
			camera.position.addScaledVector(up, offsetY);
		}

		camera.updateMatrixWorld(true);
	}

	function resize() {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (!width || !height) return false;

		camera.aspect = width / height;
		camera.zoom = THREE.MathUtils.lerp(
			MOBILE_VIEW_MIN_ZOOM,
			1,
			THREE.MathUtils.smoothstep(width, MOBILE_VIEW_MIN_WIDTH, MOBILE_VIEW_MAX_WIDTH)
		);
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		screenPose = null;
		return true;
	}

	function render() {
		if (screenMaterial?.map) {
			const baseSpeedMultiplier = 0.65 + lidProgress * 0.35;
			tunnel?.render(renderer, baseSpeedMultiplier, tunnelMotion, tunnelTransition);
		}
		renderer.render(scene, camera);
	}

	function dispose() {
		disposed = true;
		themeObserver?.disconnect();
		screenMaterial?.dispose();
		tunnel?.dispose();
		for (const material of modelMaterials) material.dispose();
		seamGeometry.dispose();
		seamMaterial.dispose();
		shadowGeometry.dispose();
		shadowMaterial.dispose();
		shadowTexture.dispose();
		mixer.stopAllAction();
		hdrTexture?.dispose();
		renderer.dispose();
		renderer.domElement.remove();
	}

	setLidProgress(1);

	return {
		pivot,
		setLidProgress,
		setScreenActive,
		updateTransition,
		resize,
		render,
		dispose
	};
}
