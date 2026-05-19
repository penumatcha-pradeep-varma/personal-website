import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Panel {
  group: THREE.Group;
  baseY: number;
  floatPhase: number;
  floatSpeed: number;
}

interface Stream {
  curve: THREE.CatmullRomCurve3;
  points: THREE.Points;
  geo: THREE.BufferGeometry;
  offsets: Float32Array;
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeLabel(text: string, hexColor: string, fontSize = 26): THREE.Sprite {
  const w = 512, h = 72;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.font = `bold ${fontSize}px "Courier New", monospace`;
  ctx.fillStyle = hexColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.6, 0.37, 1);
  return sp;
}

function makeSubLabel(text: string): THREE.Sprite {
  const w = 512, h = 48;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.3, 0.24, 1);
  return sp;
}

// ─── Main class ──────────────────────────────────────────────────────────────

export class WorkspaceScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private rafId = 0;
  private ro: ResizeObserver;

  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private panels: Panel[] = [];
  private streams: Stream[] = [];
  private screenLight!: THREE.PointLight;
  private sceneRoot!: THREE.Group;
  private screenBars: THREE.Mesh[] = [];
  private streamDots: Array<{ mesh: THREE.Points; t: number }> = [];

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
    this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);
    this.camera.position.set(0, 2.8, 10.5);
    this.camera.lookAt(0, -0.3, 0);

    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(canvas.parentElement ?? document.body);

    this.build();

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    this.tick();
  }

  // ─── Scene construction ──────────────────────────────────────────────────

  private build() {
    this.sceneRoot = new THREE.Group();
    this.scene.add(this.sceneRoot);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x04040e, 6));

    this.screenLight = new THREE.PointLight(0x00d4ff, 5, 7);
    this.screenLight.position.set(0, 0.3, 1.8);
    this.scene.add(this.screenLight);

    const keyLight = new THREE.PointLight(0x4488ff, 3, 14);
    keyLight.position.set(-4, 5, 4);
    this.scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x7c3aed, 2.5, 16);
    fillLight.position.set(4, 3, -3);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff6b35, 1.5, 12);
    rimLight.position.set(-5, 1, -4);
    this.scene.add(rimLight);

    // Build main elements
    const workstation = this.buildWorkstation();
    this.sceneRoot.add(workstation);

    // Panels config
    const panelDefs = [
      {
        label: 'Databricks',        sub: 'Delta Lake · Bronze/Silver/Gold',
        pos: [-4.8, 0.8, -1.8] as [number, number, number],
        rotY: 0.32,
        color: 0xff6b35, hex: '#ff6b35',
        draw: (g: THREE.Group) => this.drawDatabricks(g, 0xff6b35),
      },
      {
        label: 'LLM / AI',          sub: 'Inference · Automation',
        pos: [4.8, 0.8, -1.8] as [number, number, number],
        rotY: -0.32,
        color: 0x00d4ff, hex: '#00d4ff',
        draw: (g: THREE.Group) => this.drawLLM(g, 0x00d4ff),
      },
      {
        label: 'SRE Monitor',       sub: 'Observability · Alerting',
        pos: [-3.2, -1.6, -0.8] as [number, number, number],
        rotY: 0.22,
        color: 0x00ff88, hex: '#00ff88',
        draw: (g: THREE.Group) => this.drawSRE(g, 0x00ff88),
      },
      {
        label: 'RAG · Vector DB',   sub: 'Semantic Search · Embeddings',
        pos: [3.2, -1.6, -0.8] as [number, number, number],
        rotY: -0.22,
        color: 0x7c3aed, hex: '#7c3aed',
        draw: (g: THREE.Group) => this.drawRAG(g, 0x7c3aed),
      },
      {
        label: 'MCP · Agents',      sub: 'Agentic Workflows · Tool Use',
        pos: [-2.2, 2.8, -3.0] as [number, number, number],
        rotY: 0.15, rotX: -0.12,
        color: 0xf59e0b, hex: '#f59e0b',
        draw: (g: THREE.Group) => this.drawMCP(g, 0xf59e0b),
      },
      {
        label: 'Apache Kafka',      sub: 'Stream Processing · Real-Time',
        pos: [2.2, 2.8, -3.0] as [number, number, number],
        rotY: -0.15, rotX: -0.12,
        color: 0xef4444, hex: '#ef4444',
        draw: (g: THREE.Group) => this.drawKafka(g, 0xef4444),
      },
    ];

    const target = new THREE.Vector3(0, 0.2, 0);

    panelDefs.forEach((def) => {
      const panelGroup = this.buildPanel(def.label, def.sub, def.color, def.hex, def.draw);
      panelGroup.position.set(...def.pos);
      panelGroup.rotation.y = def.rotY ?? 0;
      panelGroup.rotation.x = def.rotX ?? 0;

      this.sceneRoot.add(panelGroup);
      this.panels.push({
        group: panelGroup,
        baseY: def.pos[1],
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.4 + Math.random() * 0.3,
      });

      // Particle stream from panel to center
      const stream = this.buildStream(
        new THREE.Vector3(...def.pos),
        target,
        def.color,
        7
      );
      this.streams.push(stream);
      this.sceneRoot.add(stream.points);
    });

    // Background star field
    this.buildStarField();
  }

  // ─── Workstation ─────────────────────────────────────────────────────────

  private buildWorkstation(): THREE.Group {
    const g = new THREE.Group();

    const darkDesk = new THREE.MeshPhongMaterial({ color: 0x0c0c1e, shininess: 90 });
    const darkMid  = new THREE.MeshPhongMaterial({ color: 0x090914, shininess: 60 });
    const black    = new THREE.MeshPhongMaterial({ color: 0x060610, shininess: 100 });
    const skin     = new THREE.MeshPhongMaterial({ color: 0xd4956a, shininess: 15 });
    const shirt    = new THREE.MeshPhongMaterial({ color: 0x1b3a6b, shininess: 30 });
    const hair     = new THREE.MeshPhongMaterial({ color: 0x120800 });
    const glowMat  = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.55 });

    // ── Desk ───────────────────────────────────────────────────
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.07, 1.9), darkDesk);
    desk.position.set(0, -1.15, 0);
    g.add(desk);

    // Desk front edge glow strip
    const edgeGlow = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.018, 0.018), glowMat);
    edgeGlow.position.set(0, -1.11, 0.95);
    g.add(edgeGlow);

    // Desk legs
    [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), darkMid);
      leg.position.set(x, -1.65, z);
      g.add(leg);
    });

    // ── MacBook Pro ────────────────────────────────────────────
    // Keyboard base (lay flat on desk)
    const kbBase = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.04, 1.25), black);
    kbBase.position.set(0, -1.09, 0.15);
    g.add(kbBase);

    // Screen lid (tilted open ~115°)
    const screen = new THREE.Group();
    screen.position.set(0, -1.07, -0.48);
    screen.rotation.x = -Math.PI * 0.65;

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.18, 0.035), black);
    lid.position.y = 0.59;
    screen.add(lid);

    // Display (emissive blue)
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(1.72, 1.05),
      new THREE.MeshBasicMaterial({ color: 0x001830 })
    );
    display.position.set(0, 0.59, 0.019);
    screen.add(display);

    // Screen pipeline visualization
    this.addScreenViz(screen);

    g.add(screen);

    // Apple logo glow on lid back
    const apple = new THREE.Mesh(
      new THREE.CircleGeometry(0.07, 8),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 })
    );
    apple.position.set(0, 0.59, -0.018);
    apple.rotation.x = Math.PI;
    screen.add(apple);

    // ── Keyboard face ──────────────────────────────────────────
    const kbFace = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.1), darkMid);
    kbFace.position.set(0, -1.065, 0.12);
    kbFace.rotation.x = -Math.PI / 2;
    g.add(kbFace);

    // Key rows (simple)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const key = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.008, 0.085),
          new THREE.MeshPhongMaterial({ color: 0x111124 })
        );
        key.position.set(-0.66 + col * 0.12, -1.06, -0.15 + row * 0.11);
        g.add(key);
      }
    }

    // ── Person (geometric, stylized) ───────────────────────────
    // Chair back
    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.0, 0.08),
      new THREE.MeshPhongMaterial({ color: 0x0e0e1a })
    );
    chairBack.position.set(0, -1.55, 1.0);
    g.add(chairBack);

    // Chair seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.07, 0.75),
      new THREE.MeshPhongMaterial({ color: 0x0e0e1a })
    );
    seat.position.set(0, -2.1, 0.7);
    g.add(seat);

    // Torso / body
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.36), shirt);
    torso.position.set(0, -1.72, 0.64);
    g.add(torso);

    // Shoulder shrug / upper arms
    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), shirt);
    lShoulder.position.set(-0.4, -1.42, 0.62);
    g.add(lShoulder);
    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), shirt);
    rShoulder.position.set(0.4, -1.42, 0.62);
    g.add(rShoulder);

    // Upper arms (reaching forward to keyboard)
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.72, 7), shirt);
    lArm.position.set(-0.52, -1.62, 0.38);
    lArm.rotation.z = 0.55;
    lArm.rotation.x = -0.52;
    g.add(lArm);

    const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.72, 7), shirt);
    rArm.position.set(0.52, -1.62, 0.38);
    rArm.rotation.z = -0.55;
    rArm.rotation.x = -0.52;
    g.add(rArm);

    // Forearms (flat on desk approaching keyboard)
    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.55, 7), shirt);
    lForearm.position.set(-0.45, -1.12, 0.08);
    lForearm.rotation.x = Math.PI / 2 - 0.15;
    lForearm.rotation.z = 0.1;
    g.add(lForearm);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.55, 7), shirt);
    rForearm.position.set(0.45, -1.12, 0.08);
    rForearm.rotation.x = Math.PI / 2 - 0.15;
    rForearm.rotation.z = -0.1;
    g.add(rForearm);

    // Hands on keyboard
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.055, 0.12), skin);
    lHand.position.set(-0.32, -1.065, -0.06);
    g.add(lHand);
    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.055, 0.12), skin);
    rHand.position.set(0.32, -1.065, -0.06);
    g.add(rHand);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.22, 8), skin);
    neck.position.set(0, -1.22, 0.6);
    g.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), skin);
    head.position.set(0, -0.97, 0.6);
    head.scale.set(1, 1.08, 0.95);
    g.add(head);

    // Hair (dark cap on top/back of head)
    const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.245, 10, 8), hair);
    hairMesh.position.set(0, -0.89, 0.55);
    hairMesh.scale.set(1.0, 0.65, 1.0);
    g.add(hairMesh);

    // Glasses (thin cylinders)
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x222244 });
    const lLens = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16), glassMat);
    lLens.position.set(-0.1, -0.97, 0.82);
    lLens.rotation.y = 0.1;
    g.add(lLens);
    const rLens = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16), glassMat);
    rLens.position.set(0.1, -0.97, 0.82);
    rLens.rotation.y = -0.1;
    g.add(rLens);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.012), glassMat);
    bridge.position.set(0, -0.97, 0.85);
    g.add(bridge);

    // Screen glow light (near monitor)
    const sLight = new THREE.PointLight(0x00d4ff, 4, 4.5);
    sLight.position.set(0, 0.1, 0.5);
    g.add(sLight);
    this.screenLight = sLight;

    return g;
  }

  // Pipeline visualization ON the MacBook screen
  private addScreenViz(screenGroup: THREE.Group) {
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.55 });

    // Pipeline nodes
    const nodes: [number, number][] = [[-0.55, 0.18], [-0.2, 0.28], [-0.2, 0.08], [0.2, 0.18], [0.55, 0.18]];
    nodes.forEach(([x, y]) => {
      const node = new THREE.Mesh(new THREE.CircleGeometry(0.038, 7), nodeMat);
      node.position.set(x, y, 0.02);
      screenGroup.add(node);
    });

    // Edges
    [[0,1],[0,2],[1,3],[2,3],[3,4]].forEach(([a, b]) => {
      const pts = [
        new THREE.Vector3(nodes[a][0], nodes[a][1], 0.02),
        new THREE.Vector3(nodes[b][0], nodes[b][1], 0.02),
      ];
      screenGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    });

    // Metric bars (bottom)
    const barMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 });
    const heights = [0.09, 0.14, 0.07, 0.16, 0.11, 0.13];
    heights.forEach((h, i) => {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.1, h), barMat);
      bar.position.set(-0.62 + i * 0.26, -0.25 + h / 2, 0.02);
      screenGroup.add(bar);
      this.screenBars.push(bar);
    });

    // Status dots
    [0x00ff66, 0x00ff66, 0xffaa00].forEach((c, i) => {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.025, 7),
        new THREE.MeshBasicMaterial({ color: c })
      );
      dot.position.set(-0.62 + i * 0.14, 0.44, 0.02);
      screenGroup.add(dot);
    });
  }

  // ─── Panel factory ────────────────────────────────────────────────────────

  private buildPanel(
    label: string,
    sub: string,
    color: number,
    hexColor: string,
    drawFn: (g: THREE.Group) => void
  ): THREE.Group {
    const g = new THREE.Group();
    const W = 2.35, H = 1.5;

    // Background
    g.add(new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ color: 0x01060f, transparent: true, opacity: 0.88, depthWrite: false })
    ));

    // Border
    g.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, 0.01)),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.65 })
    ));

    // Corner brackets (L-shaped accents)
    const cm = new THREE.MeshBasicMaterial({ color });
    const BL = 0.16;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const hb = new THREE.Mesh(new THREE.PlaneGeometry(BL, 0.018), cm);
      hb.position.set(sx * (W / 2 - BL / 2 + 0.01), sy * H / 2, 0.002);
      g.add(hb);
      const vb = new THREE.Mesh(new THREE.PlaneGeometry(0.018, BL), cm);
      vb.position.set(sx * W / 2, sy * (H / 2 - BL / 2 + 0.01), 0.002);
      g.add(vb);
    });

    // Content
    drawFn(g);

    // Label sprite above panel
    const lbl = makeLabel(label, hexColor);
    lbl.position.set(0, H / 2 + 0.27, 0);
    g.add(lbl);

    const sub2 = makeSubLabel(sub);
    sub2.position.set(0, H / 2 + 0.07, 0);
    g.add(sub2);

    return g;
  }

  // ─── Panel content drawers ─────────────────────────────────────────────────

  private drawDatabricks(g: THREE.Group, color: number) {
    const lm = (c = color, o = 0.6) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o });
    const nm = new THREE.MeshBasicMaterial({ color });

    // DAG nodes: Source → Bronze → Silver → Gold → Sink
    const nodes: [number, number][] = [[-0.78, 0.1], [-0.3, 0.32], [-0.3, -0.12], [0.2, 0.1], [0.72, 0.1]];
    const edges = [[0,1],[0,2],[1,3],[2,3],[3,4]];

    nodes.forEach(([x, y]) => {
      const n = new THREE.Mesh(new THREE.CircleGeometry(0.07, 6), nm);
      n.position.set(x, y, 0.005);
      g.add(n);
    });
    edges.forEach(([a, b]) => {
      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(nodes[a][0], nodes[a][1], 0.005),
          new THREE.Vector3(nodes[b][0], nodes[b][1], 0.005),
        ]), lm()
      ));
    });

    // Bronze/Silver/Gold dots
    [0xcd7f32, 0xc0c0c0, 0xffd700].forEach((c, i) => {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.05, 6), new THREE.MeshBasicMaterial({ color: c }));
      d.position.set(-0.28 + i * 0.5, -0.5, 0.005);
      g.add(d);
    });

    // Horizontal progress bars
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5 + i * 0.15, 0.045),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 })
      );
      bar.position.set(0.1, -0.42 - i * 0, -0.5 + i * 0.5);
      g.add(bar);
    }
  }

  private drawLLM(g: THREE.Group, color: number) {
    const lm = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22 });
    const nm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88 });

    // Neural net: 3 layers
    const layers = [[3], [5], [2]];
    const xs = [-0.65, 0.1, 0.75];
    const positions: [number, number][][] = layers.map((l, li) =>
      Array.from({ length: l[0] }, (_, ni) => [xs[li], (ni - (l[0] - 1) / 2) * 0.3] as [number, number])
    );

    positions.forEach((layer) => {
      layer.forEach(([x, y]) => {
        const n = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), nm);
        n.position.set(x, y, 0.005);
        g.add(n);
      });
    });

    positions.forEach((layer, li) => {
      if (li === positions.length - 1) return;
      layer.forEach(([x1, y1]) => {
        positions[li + 1].forEach(([x2, y2]) => {
          g.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x1, y1, 0.005),
              new THREE.Vector3(x2, y2, 0.005),
            ]), lm
          ));
        });
      });
    });

    // Token stream (flowing bars at bottom)
    [0.62, 0.42, 0.28, 0.50].forEach((w, i) => {
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(w, 0.045),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.38 })
      );
      b.position.set(-0.3, -0.38 - i * 0.07, 0.005);
      g.add(b);
    });
  }

  private drawSRE(g: THREE.Group, color: number) {
    // Heartbeat / metrics line
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const x = -0.9 + (i / 50) * 1.8;
      const mod = i % 10;
      const y = mod === 3 ? 0.32 : mod === 4 ? 0.55 : mod === 5 ? -0.2 : mod === 6 ? 0.4 : mod === 7 ? 0 : Math.sin(i * 0.4) * 0.04;
      pts.push(new THREE.Vector3(x, y, 0.005));
    }
    g.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color })
    ));

    // Baseline
    g.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.9, -0.12, 0.005), new THREE.Vector3(0.9, -0.12, 0.005),
      ]),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 })
    ));

    // Status dots
    [0x00ff66, 0x00ff66, 0x00ff66, 0xffaa00].forEach((c, i) => {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.048, 8), new THREE.MeshBasicMaterial({ color: c }));
      d.position.set(-0.55 + i * 0.42, -0.5, 0.005);
      g.add(d);
    });

    // Small bar chart at bottom right
    [0.6, 0.4, 0.8, 0.5, 0.7].forEach((h, i) => {
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, h * 0.3),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 })
      );
      bar.position.set(0.3 + i * 0.13, -0.35 + (h * 0.3) / 2, 0.005);
      g.add(bar);
    });
  }

  private drawRAG(g: THREE.Group, color: number) {
    // Vector DB stack (rings)
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.14, 0.22, 20),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 - i * 0.08 })
      );
      ring.position.set(-0.38, 0.38 - i * 0.18, 0.005);
      g.add(ring);
    }

    // Search rays
    const rm = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
    [[0.25, 0.3], [0.5, 0.1], [0.25, -0.1], [0.5, -0.28]].forEach(([tx, ty]) => {
      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.15, 0.1, 0.005),
          new THREE.Vector3(tx, ty, 0.005),
        ]), rm
      ));
    });

    // Query arrow
    g.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.9, 0.1, 0.005), new THREE.Vector3(0.12, 0.1, 0.005),
      ]),
      new THREE.LineBasicMaterial({ color, linewidth: 2 })
    ));

    // Embedding bars
    [0.55, 0.32, 0.68, 0.44, 0.6, 0.38, 0.72, 0.5].forEach((w, i) => {
      g.add(new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.25, 0.038),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.44 })
      ));
    });
  }

  private drawMCP(g: THREE.Group, color: number) {
    const nm = new THREE.MeshBasicMaterial({ color });

    // Client and server nodes
    const client = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), nm);
    client.position.set(-0.65, 0.1, 0.005);
    g.add(client);

    const server = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), nm);
    server.position.set(0.65, 0.1, 0.005);
    g.add(server);

    // Tool nodes in the middle
    [-0.18, 0.18].forEach((x) => {
      const tool = new THREE.Mesh(
        new THREE.CircleGeometry(0.07, 6),
        new THREE.MeshBasicMaterial({ color: 0x7c3aed })
      );
      tool.position.set(x, 0.1, 0.005);
      g.add(tool);
    });

    // Protocol messages
    [0.3, 0.1, -0.1, -0.3].forEach((y, i) => {
      const isRequest = i % 2 === 0;
      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(isRequest ? -0.5 : 0.5, y, 0.005),
          new THREE.Vector3(isRequest ? 0.5 : -0.5, y, 0.005),
        ]),
        new THREE.LineBasicMaterial({ color: isRequest ? color : 0x7c3aed, transparent: true, opacity: 0.65 })
      ));
    });
  }

  private drawKafka(g: THREE.Group, color: number) {
    const bm = (o: number) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o });

    // Partitions (4 rows of message blocks)
    for (let p = 0; p < 4; p++) {
      const y = 0.38 - p * 0.22;
      // Partition label bar
      g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), bm(0.28)));

      // Message blocks
      const count = 3 + (p % 2);
      for (let m = 0; m < count; m++) {
        const blk = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.09), bm(0.42 + m * 0.1));
        blk.position.set(-0.55 + m * 0.3, y, 0.005);
        g.add(blk);
      }
    }

    // Consumer arrow →
    g.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.45, 0.1, 0.005), new THREE.Vector3(0.82, 0.1, 0.005),
      ]),
      new THREE.LineBasicMaterial({ color, linewidth: 2 })
    ));

    // Consumer node
    const c = new THREE.Mesh(new THREE.CircleGeometry(0.1, 8), bm(0.85));
    c.position.set(0.82, 0.1, 0.005);
    g.add(c);
  }

  // ─── Particle stream ──────────────────────────────────────────────────────

  private buildStream(from: THREE.Vector3, to: THREE.Vector3, color: number, count: number): Stream {
    const mid = new THREE.Vector3(
      (from.x + to.x) / 2 + (Math.random() - 0.5) * 1.5,
      (from.y + to.y) / 2 + 1.8,
      (from.z + to.z) / 2 + 1.5,
    );
    const curve = new THREE.CatmullRomCurve3([from, mid, to]);

    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) offsets[i] = i / count;

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const pt = curve.getPoint(offsets[i]);
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color, size: 0.085, transparent: true, opacity: 0.75, depthWrite: false })
    );

    return { curve, points: pts, geo, offsets, count };
  }

  // ─── Background star field ────────────────────────────────────────────────

  private buildStarField() {
    const count = 240;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.035, transparent: true, opacity: 0.25, depthWrite: false })
    );
    this.scene.add(stars);
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 1.4;
    this.mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 0.9;
  };

  private onResize() {
    const el = this.canvas.parentElement;
    const w = el ? el.clientWidth : window.innerWidth;
    const h = el ? el.clientHeight : window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ─── Animation loop ───────────────────────────────────────────────────────

  private tick = () => {
    this.rafId = requestAnimationFrame(this.tick);
    const t = this.clock.getElapsedTime();

    // Mouse lerp
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;

    // Camera drift (gentle parallax)
    this.camera.position.x = this.mouse.x * 0.38;
    this.camera.position.y = 2.8 + this.mouse.y * 0.28;
    this.camera.lookAt(0, -0.3, 0);

    // Float panels
    this.panels.forEach((p) => {
      p.group.position.y = p.baseY + Math.sin(t * p.floatSpeed + p.floatPhase) * 0.09;
    });

    // Advance particle streams
    this.streams.forEach((s) => {
      const pos = s.geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < s.count; i++) {
        s.offsets[i] = (s.offsets[i] + 0.003) % 1;
        const pt = s.curve.getPoint(s.offsets[i]);
        pos.setXYZ(i, pt.x, pt.y, pt.z);
      }
      pos.needsUpdate = true;
    });

    // Pulsing screen light
    this.screenLight.intensity = 4.5 + Math.sin(t * 2.2) * 0.7;

    // Animate screen bars (live dashboard feel)
    this.screenBars.forEach((bar, i) => {
      const scale = 0.8 + Math.sin(t * 1.5 + i * 1.1) * 0.2;
      bar.scale.y = scale;
    });

    // Slow scene sway
    this.sceneRoot.rotation.y = Math.sin(t * 0.07) * 0.06;

    this.renderer.render(this.scene, this.camera);
  };

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  dispose() {
    cancelAnimationFrame(this.rafId);
    this.ro.disconnect();
    window.removeEventListener('mousemove', this.onMouseMove);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else (obj.material as THREE.Material)?.dispose();
      }
    });
    this.renderer.dispose();
  }
}
