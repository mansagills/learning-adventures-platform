import * as THREE from 'three';

/**
 * (Shared copy for new low-poly games; Kingdom Builders keeps its own.)
 *
 * Render a model's head and shoulders to a picture once (for the talk card),
 * using a small temporary renderer that is thrown away afterwards.
 */
export function portrait(model: THREE.Object3D, opts: { height?: number; distance?: number; size?: number; yaw?: number } = {}): string {
  const size = opts.size ?? 160;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(size, size, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x8a6440, 2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(1.5, 2, 3);
  scene.add(key);
  const holder = new THREE.Group();
  holder.add(model);
  holder.rotation.y = opts.yaw ?? 0.35;
  scene.add(holder);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const h = opts.height ?? 1.1;
  cam.position.set(0, h + 0.05, opts.distance ?? 1.9);
  cam.lookAt(0, h - 0.05, 0);
  renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL('image/png');
  renderer.dispose();
  renderer.forceContextLoss();
  return url;
}
