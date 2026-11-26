import {
	Color,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	SRGBColorSpace,
	Vector2,
	WebGLRenderer
} from 'three';

const vertexShader = /* glsl */ `
	uniform float uFlightOffset;
	uniform float uAspect;

	varying vec3 vContourPatch;
	varying vec3 vNormal;
	varying vec3 vViewPosition;
	varying vec2 vGround;

	vec3 hill(vec2 offset, vec2 spread, float peak) {
		// Sample the nearest copy of each hill along the flight path.
		offset.y = mod(offset.y + 9.0, 18.0) - 9.0;
		vec2 slope = offset / spread;
		float height = peak * exp(-dot(slope, slope));
		vec2 gradient = -2.0 * height * slope / spread;
		return vec3(height, gradient);
	}

	void main() {
		float width = max(uAspect, 1.0);
		// Extend the ground behind the hills so its edges stay outside the camera frame.
		vec2 ground = vec2(position.x * width * 12.0, position.y + 6.0);
		// Keep the mesh around the camera while the sampled terrain passes beneath it.
		vec2 point = ground - vec2(0.0, uFlightOffset);
		float latitude = point.y * 0.34906585;
		float longitude = point.x / width;
		float fold = 3.7 * longitude + 3.0 * latitude + 0.72 * sin(2.0 * latitude);
		vec2 foldGradient = vec2(3.7 / width, (3.0 + 1.44 * cos(2.0 * latitude)) * 0.34906585);
		float crossFold = 7.0 * longitude - 4.0 * latitude;
		vec2 crossGradient = vec2(7.0 / width, -4.0 * 0.34906585);
		vec3 terrain = vec3(0.53 + 0.19 * sin(fold), 0.19 * cos(fold) * foldGradient);
		terrain += vec3(0.10 * sin(crossFold), 0.10 * cos(crossFold) * crossGradient);

		// Shorter folds add shoulders and saddles between the larger peaks.
		float twist = 3.0 * latitude - 2.0 * longitude;
		float ridgeDetail = 12.4 * longitude + 7.0 * latitude + 1.1 * sin(twist);
		vec2 ridgeGradient = vec2(
			(12.4 - 2.2 * cos(twist)) / width,
			(7.0 + 3.3 * cos(twist)) * 0.34906585
		);
		float terrace = 21.0 * longitude - 11.0 * latitude + 0.8 * sin(16.0 * longitude + 3.0 * latitude);
		float terraceBend = cos(16.0 * longitude + 3.0 * latitude);
		vec2 terraceGradient = vec2(
			(21.0 + 12.8 * terraceBend) / width,
			(-11.0 + 2.4 * terraceBend) * 0.34906585
		);
		terrain += vec3(0.040 * sin(ridgeDetail), 0.040 * cos(ridgeDetail) * ridgeGradient);
		terrain += vec3(0.015 * sin(terrace), 0.015 * cos(terrace) * terraceGradient);
		terrain += hill(point - vec2(width * 0.71, 1.3), vec2(0.78 + width * 0.18, 1.25), 1.02);
		terrain += hill(point - vec2(-width * 0.81, -0.4), vec2(0.68 + width * 0.23, 1.05), 0.85);
		terrain += hill(point - vec2(width * 0.29, -2.3), vec2(0.56 + width * 0.14, 0.77), -0.31);
		terrain += hill(point - vec2(width * 0.42, -5.6), vec2(0.73 + width * 0.17, 1.36), 0.80);
		terrain += hill(point - vec2(-width * 0.56, -8.4), vec2(0.85 + width * 0.12, 1.24), 0.92);
		terrain += hill(point - vec2(width * 0.92, -12.1), vec2(0.78 + width * 0.19, 1.40), 0.83);
		terrain += hill(point - vec2(-width * 0.66, -14.5), vec2(0.70 + width * 0.16, 0.95), 0.68);
		terrain += hill(point - vec2(-width * 0.14, -1.8), vec2(0.37 + width * 0.09, 0.43), 0.42);
		terrain += hill(point - vec2(width * 0.21, -7.2), vec2(0.48 + width * 0.08, 0.56), 0.34);
		terrain += hill(point - vec2(-width * 0.22, -12.4), vec2(0.43 + width * 0.10, 0.48), 0.43);

		vec4 viewPosition = modelViewMatrix * vec4(ground, terrain.x, 1.0);
		// Interpolate the height and slope together to keep contours curved across mesh triangles.
		vec2 halfSlope = terrain.yz * 0.5;
		vContourPatch = vec3(terrain.x - dot(halfSlope, point), halfSlope);
		vNormal = normalMatrix * vec3(-terrain.yz, 1.0);
		vViewPosition = viewPosition.xyz;
		vGround = point;
		gl_Position = projectionMatrix * viewPosition;
	}
`;

const fragmentShader = /* glsl */ `
	precision highp float;

	uniform float uReveal;
	uniform float uReflection;
	uniform float uTime;
	uniform float uFlightOffset;
	uniform vec2 uResolution;
	uniform vec3 uBase;
	uniform vec3 uSurface;
	uniform vec3 uAccent;
	uniform vec3 uForeground;

	varying vec3 vContourPatch;
	varying vec3 vNormal;
	varying vec3 vViewPosition;
	varying vec2 vGround;

	float strokeIntegral(float level, float halfWidth) {
		float offset = level + halfWidth;
		float width = halfWidth * 2.0;
		return floor(offset) * width + min(fract(offset), width);
	}

	float filteredStroke(float level, float footprint, float halfWidth) {
		// Average the repeating stroke across a pixel instead of sampling its center.
		float radius = max(footprint * 0.5, 0.0005);
		float end = strokeIntegral(level + radius, halfWidth);
		float start = strokeIntegral(level - radius, halfWidth);
		return clamp((end - start) / (2.0 * radius), 0.0, 1.0);
	}

	vec2 projectSurveyPlane() {
		// Intersect the camera ray with a horizontal plane independent of the terrain mesh.
		vec3 ray = vViewPosition * mat3(viewMatrix);
		float distanceToPlane = (0.5 - cameraPosition.y) / ray.y;
		vec3 intersection = cameraPosition + ray * distanceToPlane;
		return vec2(intersection.x, -intersection.z - uFlightOffset);
	}

	void main() {
		float elevation = vContourPatch.x + dot(vContourPatch.yz, vGround);
		float level = elevation * 20.0;
		vec2 slope = vec2(dFdx(level), dFdy(level));
		float footprint = abs(slope.x) + abs(slope.y);
		float gradient = length(slope);

		float majorLevel = level / 4.0;
		float majorFootprint = footprint / 4.0;
		float majorClarity = 1.0 - smoothstep(0.36, 0.83, majorFootprint);
		float minorClarity = 1.0 - smoothstep(0.24, 0.64, footprint);
		float minorLine = filteredStroke(level, footprint, clamp(gradient * 0.50, 0.009, 0.12));
		float majorLine = filteredStroke(majorLevel, majorFootprint, clamp(gradient * 0.19, 0.008, 0.16));
		float line = max(minorLine * minorClarity * 0.55, majorLine * majorClarity);
		float majorDistance = abs(fract(majorLevel + 0.5) - 0.5);
		float halo = (1.0 - smoothstep(0.0, clamp(gradient * 0.68, 0.025, 0.30), majorDistance)) * majorClarity;

		vec2 surveyPlane = projectSurveyPlane();
		vec2 map = surveyPlane * 0.5;
		vec2 gridDistance = abs(fract(map + 0.5) - 0.5);
		vec2 gridWidth = max(fwidth(map), vec2(0.001));
		vec2 gridLine = 1.0 - smoothstep(gridWidth * 0.06, gridWidth * 0.72, gridDistance);
		float grid = max(gridLine.x, gridLine.y);

		vec2 samples = surveyPlane * 6.0;
		vec2 cell = floor(samples);
		cell.y = mod(cell.y, 108.0);
		float scatter = step(0.57, fract(dot(cell, vec2(0.671, 0.413))));
		float sampleSize = length(fwidth(samples));
		float surveyPoint = (1.0 - smoothstep(0.045, 0.16, length(fract(samples) - 0.5)));
		surveyPoint *= scatter * (1.0 - smoothstep(0.10, 0.25, sampleSize));

		vec3 normal = normalize(vNormal);
		vec3 light = normalize(vec3(-0.64, 0.70, 0.36));
		vec3 halfway = normalize(light + normalize(-vViewPosition));
		float diffuse = max(dot(normal, light), 0.0);
		float specular = pow(max(dot(normal, halfway), 0.0), 14.0);

		vec2 screen = gl_FragCoord.xy / uResolution;
		float edge = screen.y + 0.048 * sin(screen.x * 7.5);
		float surveyFront = mix(-0.23, 1.23, uReveal) - edge;
		float distanceToFront = surveyFront - 0.033 * sin(elevation * 6.0);
		float revealed = smoothstep(-0.055, 0.15, distanceToFront);
		float frontLight = 1.0 - smoothstep(0.02, 0.20, abs(distanceToFront));

		float sweep = mix(-0.32, 1.32, uReflection);
		float drift = mix(-0.32, 1.32, fract(uTime * 0.16));
		float diagonal = screen.y + (screen.x - 0.5) * 0.22;
		float glint = 1.0 - smoothstep(0.0, 0.15, abs(diagonal - sweep));
		float shimmer = 1.0 - smoothstep(0.0, 0.21, abs(diagonal - drift));

		float dark = 1.0 - step(0.36, dot(uBase, vec3(0.2126, 0.7152, 0.0722)));
		float lightTravel = 0.25 * specular + 0.32 * frontLight + 0.20 * glint + 0.14 * shimmer;
		float elevationLight = smoothstep(0.18, 1.30, elevation);
		float energy = clamp(0.27 + 0.27 * diffuse + 0.22 * elevationLight + lightTravel, 0.0, 1.0);
		float shading = mix(0.13 - 0.10 * diffuse, 0.025 + 0.10 * diffuse, dark);
		vec3 surface = mix(uSurface, uAccent, shading);
		vec3 ink = mix(uAccent, uForeground, dark * lightTravel * 0.49);
		surface = mix(surface, ink, halo * energy * mix(0.09, 0.22, dark));
		vec3 color = mix(uBase, mix(surface, ink, line * energy), revealed);
		float survey = grid * mix(0.07, 0.10, dark) + surveyPoint * mix(0.045, 0.07, dark);
		color = mix(color, uAccent, survey * smoothstep(-0.055, 0.15, surveyFront));

		gl_FragColor = vec4(color, 1.0);
		#include <colorspace_fragment>
	}
`;

export function bindManifestoTexture(canvas: HTMLCanvasElement, section: HTMLElement) {
	let renderer: WebGLRenderer;

	try {
		renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: false,
			powerPreference: 'high-performance'
		});
	} catch {
		return {
			setRevealProgress(progress: number) {
				canvas.style.setProperty('--manifesto-reveal', `${progress * 100}%`);
			},
			setReflectionProgress() {},
			destroy() {
				canvas.style.removeProperty('--manifesto-reveal');
			}
		};
	}

	renderer.outputColorSpace = SRGBColorSpace;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

	const uniforms = {
		uReveal: { value: 0 },
		uReflection: { value: 0 },
		uTime: { value: 0 },
		uFlightOffset: { value: 0 },
		uAspect: { value: 1 },
		uResolution: { value: new Vector2(1, 1) },
		uBase: { value: new Color() },
		uSurface: { value: new Color() },
		uAccent: { value: new Color() },
		uForeground: { value: new Color() }
	};
	const material = new ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms
	});
	const geometry = new PlaneGeometry(1, 20, 288, 152);
	const mesh = new Mesh(geometry, material);
	const scene = new Scene();
	const camera = new PerspectiveCamera(36, 1, 0.1, 30);

	mesh.rotation.x = -Math.PI / 2;
	mesh.frustumCulled = false;
	scene.add(mesh);
	camera.position.set(0, 4.05, 3.55);
	camera.lookAt(0, 0.26, 0);

	function syncColors() {
		const palette = getComputedStyle(section);
		uniforms.uBase.value.set(palette.getPropertyValue('--background').trim());
		uniforms.uSurface.value.set(palette.getPropertyValue('--surface').trim());
		uniforms.uAccent.value.set(palette.getPropertyValue('--accent').trim());
		uniforms.uForeground.value.set(palette.getPropertyValue('--foreground').trim());
	}

	function resize() {
		const width = Math.max(1, canvas.clientWidth);
		const height = Math.max(1, canvas.clientHeight);
		renderer.setSize(width, height, false);
		renderer.getDrawingBufferSize(uniforms.uResolution.value);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		uniforms.uAspect.value = camera.aspect;
	}

	function render() {
		renderer.render(scene, camera);
	}

	let frame = 0;
	let lastRender: number | undefined;
	let inView = false;

	function animate(now: number) {
		const elapsed = now - (lastRender ?? now);
		if (lastRender === undefined || elapsed >= 15) {
			uniforms.uTime.value += Math.min(elapsed, 100) / 1000;
			uniforms.uFlightOffset.value = (uniforms.uTime.value * 0.68) % 18;
			lastRender = now;
			render();
		}
		frame = requestAnimationFrame(animate);
	}

	function syncAnimation() {
		if (uniforms.uReveal.value > 0 && inView && !document.hidden) {
			if (!frame) frame = requestAnimationFrame(animate);
		} else {
			cancelAnimationFrame(frame);
			frame = 0;
			lastRender = undefined;
		}
	}

	const resizeObserver = new ResizeObserver(() => {
		resize();
		render();
	});
	const intersectionObserver = new IntersectionObserver(([entry]) => {
		inView = entry.isIntersecting;
		syncAnimation();
	});
	const themeObserver = new MutationObserver(() => {
		syncColors();
		render();
	});
	syncColors();
	resize();
	render();
	canvas.setAttribute('data-webgl', '');
	resizeObserver.observe(canvas);
	intersectionObserver.observe(section);
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme']
	});
	document.addEventListener('visibilitychange', syncAnimation);

	return {
		setRevealProgress(progress: number) {
			if (progress === uniforms.uReveal.value) return;
			uniforms.uReveal.value = progress;
			syncAnimation();
			if (!frame) render();
		},
		setReflectionProgress(progress: number) {
			if (progress === uniforms.uReflection.value) return;
			uniforms.uReflection.value = progress;
			if (!frame) render();
		},
		destroy() {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			themeObserver.disconnect();
			document.removeEventListener('visibilitychange', syncAnimation);
			canvas.removeAttribute('data-webgl');
			renderer.clear();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		}
	};
}
