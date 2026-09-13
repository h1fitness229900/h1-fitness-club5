const canvas = document.getElementById('dumbbell');
const fallback = document.getElementById('visual-fallback');
const motionButton = document.getElementById('motion');
const motionHint = document.getElementById('motion-hint');

if (canvas) {
	(async () => {
		try {
			const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');
			const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
			renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
			camera.position.set(0, 0.7, 7.5);
			const dumbbell = new THREE.Group();
			scene.add(dumbbell);

			const metal = new THREE.MeshStandardMaterial({ color: 0xe9e5dc, metalness: .8, roughness: .22 });
			const black = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: .65, roughness: .3 });
			const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, 3.9, 32), metal);
			shaft.rotation.z = Math.PI / 2;
			dumbbell.add(shaft);

			[-1.65, 1.65].forEach(x => {
				const stack = new THREE.Group();
				stack.position.x = x;
				[-.33, -.11, .11, .33].forEach((y, index) => {
					const radius = .63 - index * .065;
					const plate = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .18, 32), index % 2 ? metal : black);
					plate.rotation.z = Math.PI / 2;
					plate.position.y = y;
					stack.add(plate);
				});
				dumbbell.add(stack);
			});

			scene.add(new THREE.HemisphereLight(0xffffff, 0x252525, 2.2));
			const keyLight = new THREE.DirectionalLight(0xffffff, 3);
			keyLight.position.set(-4, 5, 6);
			scene.add(keyLight);

			let paused = false;
			let dragging = false;
			let lastX = 0;
			let rotation = 0;

			const resize = () => {
				const bounds = canvas.getBoundingClientRect();
				renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
				camera.aspect = bounds.width / Math.max(1, bounds.height);
				camera.updateProjectionMatrix();
			};
			const stopDragging = () => { dragging = false; };
			canvas.addEventListener('pointerdown', event => {
				dragging = true;
				lastX = event.clientX;
				canvas.setPointerCapture?.(event.pointerId);
			});
			canvas.addEventListener('pointermove', event => {
				if (!dragging) return;
				rotation += (event.clientX - lastX) * .012;
				lastX = event.clientX;
			});
			canvas.addEventListener('pointerup', stopDragging);
			canvas.addEventListener('pointercancel', stopDragging);
			motionButton?.addEventListener('click', () => {
				paused = !paused;
				motionButton.textContent = paused ? '▶' : 'Ⅱ';
				motionButton.setAttribute('aria-label', paused ? 'Resume dumbbell rotation' : 'Pause dumbbell rotation');
				if (motionHint) motionHint.textContent = paused ? 'ROTATION PAUSED' : 'DRAG TO ROTATE';
			});
			addEventListener('resize', resize);
			resize();

			const render = () => {
				requestAnimationFrame(render);
				if (!paused && !dragging) rotation += .006;
				dumbbell.rotation.y += (rotation - dumbbell.rotation.y) * .09;
				dumbbell.rotation.z = Math.sin(dumbbell.rotation.y) * .08;
				renderer.render(scene, camera);
			};
			render();
		} catch {
			canvas.hidden = true;
			if (fallback) fallback.hidden = false;
		}
	})();
}
