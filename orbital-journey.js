/* =============================================
   ORBITAL JOURNEY — Three.js + GSAP ScrollTrigger
   Full-screen scroll-driven camera through orbital rings
   Each chapter zooms the camera toward one ring, content
   fades in as a glass panel overlay.
   ============================================= */
(function () {
  'use strict';

  const canvas = document.getElementById('journey-canvas');
  if (!canvas || typeof THREE === 'undefined' || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Renderer (full-screen, opaque background) ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020c18, 1);

  /* ── Scene & Camera ── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.z = 14;

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const keyLight = new THREE.DirectionalLight(0x9efff0, 1.8);
  keyLight.position.set(6, 6, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x0d9488, 0.8);
  fillLight.position.set(-5, -3, -4);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x2dd4bf, 1.2, 30);
  rimLight.position.set(0, 4, -3);
  scene.add(rimLight);

  /* ── Globe ── */
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const globeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 64, 64),
    new THREE.MeshStandardMaterial({
      color: 0x083344, emissive: 0x0a3040, emissiveIntensity: 0.55,
      metalness: 0.25, roughness: 0.55,
    })
  );
  globeGroup.add(globeMesh);

  globeGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.45, 22, 16),
    new THREE.MeshBasicMaterial({ color: 0x0d9488, wireframe: true, transparent: true, opacity: 0.16 })
  ));

  globeGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.75, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x0d9488, transparent: true, opacity: 0.09, side: THREE.BackSide })
  ));

  /* ── Orbital Rings — 3 at different angles and radii ── */
  const ringDefs = [
    { r: 4.5,  tube: 0.055, color: 0x0d9488, rx:  Math.PI * 0.22,  ry: 0,              rz: 0,               speed: 0.0038 },
    { r: 6.2,  tube: 0.038, color: 0x2dd4bf, rx: -Math.PI * 0.15,  ry: Math.PI * 0.35, rz:  Math.PI * 0.10,  speed: 0.0024 },
    { r: 8.0,  tube: 0.022, color: 0x5eead4, rx:  Math.PI * 0.45,  ry: Math.PI * 0.12, rz: -Math.PI * 0.28,  speed: 0.0016 },
  ];

  const rings = ringDefs.map((d) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(d.r, d.tube, 24, 200),
      new THREE.MeshStandardMaterial({
        color: d.color, emissive: d.color, emissiveIntensity: 0.65,
        metalness: 0.1, roughness: 0.3, transparent: true, opacity: 0.90,
      })
    );
    m.rotation.set(d.rx, d.ry, d.rz);
    m.userData.speed = d.speed;
    scene.add(m);
    return m;
  });

  /* Thinner accent rings counter-rotating for depth */
  const accentDefs = [
    { r: 4.52, tube: 0.012, color: 0x99f6e4, rx: Math.PI * 0.22 + 0.15, ry: 0.10,              rz: 0.08, speed: 0.0055 },
    { r: 6.22, tube: 0.009, color: 0x5eead4, rx: -Math.PI * 0.15 - 0.10, ry: Math.PI * 0.35 + 0.12, rz: 0.05, speed: 0.0032 },
  ];
  const accents = accentDefs.map((d) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(d.r, d.tube, 12, 160),
      new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.55 })
    );
    m.rotation.set(d.rx, d.ry, d.rz);
    m.userData.speed = d.speed;
    scene.add(m);
    return m;
  });

  /* Orbiting dot ring */
  const dotGroup = new THREE.Group();
  dotGroup.rotation.x = Math.PI * 0.22;
  scene.add(dotGroup);

  {
    const dg = new THREE.SphereGeometry(0.032, 6, 6);
    const dm = new THREE.MeshBasicMaterial({ color: 0x0d9488, transparent: true, opacity: 0.45 });
    for (let i = 0; i < 90; i++) {
      const a  = (i / 90) * Math.PI * 2;
      const pt = new THREE.Mesh(dg, dm);
      pt.position.set(Math.cos(a) * 5.2, 0, Math.sin(a) * 5.2);
      dotGroup.add(pt);
    }
  }

  /* Particle field — larger spread for zoom-out chapter */
  {
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = 9 + Math.random() * 26;
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pg,
      new THREE.PointsMaterial({ color: 0x5eead4, size: 0.07, transparent: true, opacity: 0.55, sizeAttenuation: true })
    ));
  }

  /* ── Camera waypoints — one per chapter (7 chapters × 100 vh each) ──
     Journey is 700 vh total → 600 vh scrollable.
     Each chapter boundary is at 1/6 of scroll progress.
     Camera moves toward/through each ring, then zooms out for contact. */
  const waypoints = [
    { x: 0,     y: 0,    z: 14,  rx: 0,      ry: 0     }, // 0  Hero      — full overview
    { x: -0.5,  y: 0.3,  z: 5.5, rx: 0.18,   ry: 0.12  }, // 1  About     — zoom toward ring 1
    { x: 3.0,   y: -1.5, z: 9.0, rx: -0.22,  ry: -0.38 }, // 2  Education — ring 1 at steep angle
    { x: -1.5,  y: 0.8,  z: 5.0, rx: 0.18,   ry: 0.32  }, // 3  Experience — zoom into ring 2
    { x: 1.5,   y: -1.8, z: 9.0, rx: -0.30,  ry: -0.20 }, // 4  Research  — ring 2 angle, ring 3 ahead
    { x: -0.5,  y: 1.5,  z: 4.0, rx: 0.42,   ry: 0.10  }, // 5  Awards    — deep into ring 3
    { x: 0,     y: 0,    z: 22,  rx: 0,      ry: 0     }, // 6  Contact   — zoom way out, all rings small
  ];

  /* State objects GSAP will tween */
  const cam = { x: 0, y: 0, z: 14 };
  const scn = { rx: 0, ry: 0 };

  /* ── ScrollTrigger camera timeline ── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#journey',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2.5,
    },
  });

  /* 6 transitions, each 1 unit long in the timeline */
  waypoints.slice(1).forEach((wp, i) => {
    tl
      .to(cam, { x: wp.x, y: wp.y, z: wp.z, ease: 'power2.inOut', duration: 1 }, i)
      .to(scn, { rx: wp.rx, ry: wp.ry,       ease: 'power2.inOut', duration: 1 }, i);
  });

  /* ── Chapter panel fade in/out ── */
  document.querySelectorAll('.chapter').forEach((ch) => {
    const panel = ch.querySelector('.ch-panel');
    if (!panel) return;

    gsap.set(panel, { opacity: 0, y: 28 });

    ScrollTrigger.create({
      trigger: ch,
      start: 'top 62%',
      end: 'bottom 38%',
      onEnter:     () => gsap.to(panel, { opacity: 1, y: 0,   duration: 0.70, ease: 'power2.out' }),
      onLeave:     () => gsap.to(panel, { opacity: 0, y: -20, duration: 0.45 }),
      onEnterBack: () => gsap.to(panel, { opacity: 1, y: 0,   duration: 0.70, ease: 'power2.out' }),
      onLeaveBack: () => gsap.to(panel, { opacity: 0, y: 20,  duration: 0.45 }),
    });
  });

  /* ── Hero text fades out as user scrolls away ── */
  const heroText = document.getElementById('hero-text');

  ScrollTrigger.create({
    trigger: '#ch-hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      const p = self.progress;
      if (heroText) gsap.set(heroText, { opacity: Math.max(0, 1 - p * 2.2), y: -p * 50 });
    },
  });

  /* ── Progress dots update ── */
  const dots = document.querySelectorAll('.j-dot');
  if (dots.length) {
    ScrollTrigger.create({
      trigger: '#journey',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const idx = Math.min(waypoints.length - 1, Math.round(self.progress * (waypoints.length - 1)));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      },
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = dot.dataset.target;
        if (target) document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ── Mouse parallax (layered on top of GSAP camera state) ── */
  let mx = 0, my = 0, cmx = 0, cmy = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.40;
    my = (e.clientY / window.innerHeight - 0.5) * 0.28;
  }, { passive: true });

  /* ── RAF — animation loop ── */
  let t = 0;

  function animate()
  {
    requestAnimationFrame(animate);
    t += 0.016;

    /* Smooth mouse lag */
    cmx += (mx - cmx) * 0.035;
    cmy += (my - cmy) * 0.035;

    /* Apply GSAP-tweened camera state + mouse offset */
    camera.position.set(cam.x + cmx * 0.6, cam.y - cmy * 0.4, cam.z);
    scene.rotation.set(scn.rx + cmy * 0.06, scn.ry + cmx * 0.06, 0);

    /* Orbital rotation */
    globeMesh.rotation.y    += 0.0020;
    globeGroup.rotation.y   += 0.0004;
    rings[0].rotation.z     += rings[0].userData.speed;
    rings[1].rotation.y     += rings[1].userData.speed;
    rings[2].rotation.x     += rings[2].userData.speed;
    accents[0].rotation.z   -= accents[0].userData.speed;
    accents[1].rotation.y   -= accents[1].userData.speed;
    dotGroup.rotation.z     += 0.0008;

    /* Emissive pulse */
    const pulse = 0.55 + 0.15 * Math.sin(t * 0.9);
    rings.forEach((r) => { r.material.emissiveIntensity = pulse; });

    renderer.render(scene, camera);
  }

  animate();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Pause on hidden tab ── */
  let rafId;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });
})();
