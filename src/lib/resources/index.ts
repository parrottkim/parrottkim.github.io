import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

export const models: Record<string, GLTF> = {};

async function loadFont(font: string, text: string): Promise<void> {
	const faces = await document.fonts.load(font, text);

	if (!faces.length || faces.some((face) => face.status !== 'loaded')) {
		throw new Error(`Font loading failed: ${font}`);
	}
}

async function loadModel(name: string, path: string, loader: GLTFLoader): Promise<void> {
	models[name] = await loader.loadAsync(path);
}

export async function loadResources(onProgress: (progress: number) => void): Promise<void> {
	const draco = new DRACOLoader();
	const loader = new GLTFLoader();

	loader.setDRACOLoader(draco);

	const resources = [
		loadFont('400 16px "Pretendard Variable"', '안녕하세요'),
		loadFont('600 16px "Geist"', 'Portfolio'),
		loadFont('400 16px "Geist Mono"', '2026'),
		loadModel('iphone', '/models/iphone.glb', loader),
		loadModel('macbook', '/models/macbook.glb?v=original-002', loader)
	];

	let completed = 0;

	const results = await Promise.allSettled(
		resources.map((request) =>
			request.finally(() => {
				onProgress(++completed / resources.length);
			})
		)
	);

	for (const result of results) {
		if (result.status === 'rejected') {
			console.error('[Resources] 로딩 실패', result.reason);
		}
	}

	draco.dispose();
}
