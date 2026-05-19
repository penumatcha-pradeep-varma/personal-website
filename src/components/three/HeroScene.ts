import * as THREE from 'three';

interface ShapeConfig {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotationSpeed: [number, number];
  floatOffset: number;
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private groups: THREE.Group[] = [];
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private rafId = 0;
  private ro: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement) {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(canvas.parentElement ?? document.body);

    this.buildScene();

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });

    this.tick();
  }

  private buildScene() {
    // Lighting
    this.scene.add(new THREE.AmbientLight(0x0a0a20, 4));

    const cyanLight = new THREE.PointLight(0x00d4ff, 10, 18);
    cyanLight.position.set(3, 3, 4);
    this.scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x7c3aed, 7, 14);
    purpleLight.position.set(-3, -2, 3);
    this.scene.add(purpleLight);

    const backLight = new THREE.PointLight(0x00d4ff, 3, 20);
    backLight.position.set(0, -4, -2);
    this.scene.add(backLight);

    // Shape configs
    const shapes: ShapeConfig[] = [
      {
        geometry: new THREE.IcosahedronGeometry(1.35, 1),
        position: [0, 0, 0],
        rotationSpeed: [0.16, 0.11],
        floatOffset: 0,
      },
      {
        geometry: new THREE.OctahedronGeometry(0.6, 0),
        position: [2.9, 0.7, -2.5],
        rotationSpeed: [-0.2, 0.14],
        floatOffset: 1.2,
      },
      {
        geometry: new THREE.TetrahedronGeometry(0.55, 0),
        position: [-2.7, -0.5, -1.5],
        rotationSpeed: [0.24, -0.17],
        floatOffset: 2.4,
      },
      {
        geometry: new THREE.IcosahedronGeometry(0.38, 0),
        position: [1.9, -1.9, -1],
        rotationSpeed: [-0.14, 0.22],
        floatOffset: 0.8,
      },
      {
        geometry: new THREE.OctahedronGeometry(0.32, 0),
        position: [-1.6, 1.8, -0.5],
        rotationSpeed: [0.28, -0.1],
        floatOffset: 3.6,
      },
    ];

    shapes.forEach(({ geometry, position, rotationSpeed, floatOffset }) => {
      const group = new THREE.Group();

      // Solid mesh
      const solid = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({
          color: 0x040410,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.04,
          shininess: 140,
          transparent: true,
          opacity: 0.88,
        })
      );
      group.add(solid);

      // Wireframe overlay
      const wire = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: 0x00d4ff,
          wireframe: true,
          transparent: true,
          opacity: 0.22,
        })
      );
      group.add(wire);

      group.position.set(...position);
      group.userData = { rotationSpeed, floatOffset, baseY: position[1] };

      this.scene.add(group);
      this.groups.push(group);
    });
  }

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 1.8;
    this.mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 1.4;
  };

  private onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    this.mouse.tx = (t.clientX / window.innerWidth - 0.5) * 1.2;
    this.mouse.ty = -(t.clientY / window.innerHeight - 0.5) * 1.0;
  };

  private onResize() {
    const el = this.canvas.parentElement;
    const w = el ? el.clientWidth : window.innerWidth;
    const h = el ? el.clientHeight : window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private tick = () => {
    this.rafId = requestAnimationFrame(this.tick);
    const t = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

    // Camera parallax
    this.camera.position.x = this.mouse.x * 0.35;
    this.camera.position.y = this.mouse.y * 0.28;
    this.camera.lookAt(0, 0, 0);

    // Animate shapes
    this.groups.forEach((group) => {
      const { rotationSpeed, floatOffset, baseY } = group.userData as {
        rotationSpeed: [number, number];
        floatOffset: number;
        baseY: number;
      };
      group.rotation.x = t * rotationSpeed[0];
      group.rotation.y = t * rotationSpeed[1];
      group.position.y = baseY + Math.sin(t * 0.55 + floatOffset) * 0.12;
    });

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.rafId);
    this.ro.disconnect();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    this.groups.forEach((group) => {
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            (child.material as THREE.Material).dispose();
          }
        }
      });
    });
    this.renderer.dispose();
  }
}
