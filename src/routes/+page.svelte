<script lang="ts">
	import { onMount } from 'svelte';
	import { loadResources, models } from '#lib/resources/index.ts';
	import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import Experience from '#lib/features/experience/Experience.svelte';
	import Hero from '#lib/features/hero/Hero.svelte';

	let macbook = $state<GLTF | undefined>(undefined);

	onMount(() => {
		const loader = document.getElementById('initial-loader');
		const progress = document.querySelector<SVGPolygonElement>('.hexagon-progress');

		if (!loader || !progress) return;

		let finished = false;

		let hideTimer: ReturnType<typeof setTimeout>;
		let removeTimer: ReturnType<typeof setTimeout>;

		progress.style.setProperty('--progress', '0');

		const timeout = setTimeout(() => {
			console.warn('[Loader] 로딩 시간 초과');
			finish();
		}, 5000);

		function advance(value: number) {
			if (finished) return;

			progress!.style.setProperty('--progress', String(value));
		}

		// 모든 리소스 처리가 끝나면 로딩 화면 종료
		function finish() {
			if (finished) return;

			finished = true;
			clearTimeout(timeout);

			hideTimer = setTimeout(() => {
				loader!.classList.add('hidden');

				removeTimer = setTimeout(() => {
					loader!.remove();
					macbook = models.macbook;
				}, 1000);
			}, 750);
		}

		async function load() {
			try {
				await loadResources(advance);
			} catch (error) {
				console.error('[Loader] 초기화 실패', error);
			} finally {
				finish();

				// 타임아웃 이후 모델 로딩이 완료된 경우
				if (!loader!.isConnected) {
					macbook = models.macbook;
				}
			}
		}

		void load();

		return () => {
			finished = true;
			clearTimeout(timeout);
			clearTimeout(hideTimer);
			clearTimeout(removeTimer);
		};
	});
</script>

<svelte:head>
	<title>김현진 | Software Engineer</title>
	<meta name="description" content="소프트웨어 엔지니어 김현진의 포트폴리오" />
</svelte:head>

<main>
	{#if macbook}
		<Hero model={macbook} />
		<Experience />
	{/if}
</main>
