/**
 * ============================================================================
 * REFINED 3D CHIBI ROBOT COMPANION (THREE.JS)
 * Features an Articulated Mechanical Neck:
 *  - Short cylindrical mechanical neck connecting torso and head
 *  - Exposed metallic silver spring-like bellows and flexible telescopic cylinder
 *  - Small circular joint connectors at top and bottom with subtle turquoise accent rings
 *  - Machined dark graphite, chrome piston & brushed silver metallic materials
 *  - Visible from both front and side angles
 *  - Natural head rotation (yaw), tilt (pitch/roll), subtle idle head-bobbing,
 *    and synchronized neck joint flex
 *  - Preserved head design, facial animations, pod torso, limb armor, and boots
 * ============================================================================
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is required for the 3D robot companion.');
    return;
  }

  // --- Design Tokens & Color Palette ---
  const PALETTE = {
    whitePlastic: 0xFFFFFF,
    whiteGloss: 0xFFFFFF,
    turquoise: 0x4FD1C5,      // Exact turquoise accent (#4FD1C5)
    turquoiseGlow: '#4FD1C5',
    darkScreen: 0x070B12,
    screenBg: '#070B12',
    silverJoint: 0xCBD5E1,
    silverSpring: 0x94A3B8,
    darkGraphite: 0x242C3D,   // Machined dark graphite alloy for neck
    graphiteRing: 0x181F2C,   // Deep graphite collar
    chrome: 0xF1F5F9,
    darkAccent: 0x1E293B
  };

  const CONFIG = {
    canvasId: 'robotCanvas',
    containerId: 'robotCanvasWrapper',
    stageId: 'aboutRobotStage',
    sectionId: 'about'
  };

  // Three.js Core
  let scene, camera, renderer;
  let canvas, container, stage, aboutSection;
  let robotRoot, torsoGroup, neckGroup, neckStem, headGroup;
  let antennaL, antennaR, robotMaterials;
  let shoulderR, upperArmR, elbowR, forearmR, handR;
  let shoulderL, upperArmL, elbowL, forearmL, handL;
  let pelvisGroup, thighL, kneeL, calfL, footL, thighR, kneeR, calfR, footR;
  let keyLight, rimLight, fillLight;

  // Eye & Face Canvas Texture
  let faceCanvas, faceCtx, faceTexture;
  let faceState = {
    expression: 'happy',  // 'happy', 'neutral', 'surprised', 'winking'
    blink: 0,             // 0: open, 1: closed
    targetBlink: 0,
    lookX: 0,
    lookY: 0,
    targetLookX: 0,
    targetLookY: 0
  };
  let lastFaceState = {
    expression: 'happy',
    blink: 0,
    lookX: 0,
    lookY: 0
  };

  // Interaction & Animation Timers
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false };
  let isSectionVisible = true;
  let isWaving = false;
  let waveTimer = 0;
  let waveDuration = 3.2;
  let nextWaveTime = 3.0; // Friendly greeting wave
  let isHappy = false;
  let clock = new THREE.Clock();
  let animationFrameId = null;
  let floatOffset = 0;
  let bounceVelocity = 0;
  let nextBounceTime = 14.0;
  let nextExpressionTime = 6.0;

  // Scroll tracking for head tilt
  let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  let scrollVelocity = 0;
  let scrollTilt = 0;

  // Base Y height for head inside neckGroup
  const HEAD_BASE_Y = 0.82;

  // --- 1. Face & Expressive LED Screen Generator (PRESERVED UNCHANGED) ---
  function initFaceScreen() {
    faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 320;
    faceCtx = faceCanvas.getContext('2d');

    faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.generateMipmaps = false;
    faceTexture.minFilter = THREE.LinearFilter;
    faceTexture.magFilter = THREE.LinearFilter;

    drawFace();
  }

  function drawFace() {
    const ctx = faceCtx;
    const w = faceCanvas.width;
    const h = faceCanvas.height;

    // Deep Obsidian Glossy Display Background (Solid, smooth sci-fi OLED)
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 280);
    bgGrad.addColorStop(0, '#0C121E');
    bgGrad.addColorStop(0.65, '#070B12');
    bgGrad.addColorStop(1, '#030509');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Eye Centers with Cursor Gaze Offset
    const eyeSpacing = 72;
    const leftX = w / 2 - eyeSpacing + faceState.lookX;
    const rightX = w / 2 + eyeSpacing + faceState.lookX;
    const eyeY = h / 2 - 12 + faceState.lookY;

    const blinkScale = Math.max(0.04, 1 - faceState.blink);

    ctx.save();
    ctx.shadowColor = PALETTE.turquoiseGlow;

    // --- Expression Renderers ---
    if (faceState.expression === 'happy' || isHappy) {
      // 1. HAPPY: Signature Glowing Curved Arches (⌒ ⌒) + Cute Smiling Mouth
      function drawHappyArch(cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, blinkScale);

        const r = 32;
        const start = Math.PI * 1.15;
        const end = Math.PI * 1.85;

        // Glow pass
        ctx.shadowBlur = 26;
        ctx.strokeStyle = 'rgba(79, 209, 197, 0.45)';
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, r * 0.4, r, start, end, false);
        ctx.stroke();

        // Primary cyan stroke
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#4FD1C5';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(0, r * 0.4, r, start, end, false);
        ctx.stroke();

        // Bright white core
        ctx.shadowBlur = 6;
        ctx.strokeStyle = '#E6FFFA';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, r * 0.4, r, start, end, false);
        ctx.stroke();

        ctx.restore();
      }

      drawHappyArch(leftX, eyeY);
      drawHappyArch(rightX, eyeY);

      // Cute Animated Smile Mouth (︶)
      ctx.save();
      ctx.translate(w / 2 + faceState.lookX * 0.4, eyeY + 56);
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#4FD1C5';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -8, 18, Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.stroke();
      ctx.restore();

    } else if (faceState.expression === 'neutral') {
      // 2. NEUTRAL: Vertical Rounded LED Capsule Pills (| |)
      function drawCapsuleEye(cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, blinkScale);

        const pillW = 26;
        const pillH = 48;

        ctx.shadowBlur = 24;
        ctx.fillStyle = 'rgba(79, 209, 197, 0.4)';
        ctx.beginPath();
        ctx.roundRect(-pillW / 2 - 3, -pillH / 2 - 3, pillW + 6, pillH + 6, 14);
        ctx.fill();

        ctx.shadowBlur = 14;
        ctx.fillStyle = '#4FD1C5';
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 12);
        ctx.fill();

        ctx.shadowBlur = 6;
        ctx.fillStyle = '#E6FFFA';
        ctx.beginPath();
        ctx.roundRect(-pillW / 2 + 3, -pillH / 2 + 3, pillW - 6, pillH - 6, 8);
        ctx.fill();

        ctx.restore();
      }

      drawCapsuleEye(leftX, eyeY);
      drawCapsuleEye(rightX, eyeY);

      // Subtle Neutral Mouth Line
      ctx.save();
      ctx.translate(w / 2 + faceState.lookX * 0.4, eyeY + 52);
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#4FD1C5';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      ctx.restore();

    } else if (faceState.expression === 'surprised') {
      // 3. SURPRISED: Glowing Round Circles (O O) + Open Mouth (o)
      function drawCircleEye(cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, blinkScale);

        ctx.shadowBlur = 24;
        ctx.fillStyle = '#4FD1C5';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.fillStyle = '#E6FFFA';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      drawCircleEye(leftX, eyeY);
      drawCircleEye(rightX, eyeY);

      // Surprised 'o' mouth
      ctx.save();
      ctx.translate(w / 2 + faceState.lookX * 0.4, eyeY + 54);
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#4FD1C5';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

    } else if (faceState.expression === 'winking') {
      // 4. WINKING: Left eye open, right eye cute wink (^)
      ctx.save();
      ctx.translate(leftX, eyeY);
      ctx.scale(1, blinkScale);
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#4FD1C5';
      ctx.beginPath();
      ctx.roundRect(-13, -24, 26, 48, 12);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(rightX, eyeY);
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#4FD1C5';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-18, 8);
      ctx.lineTo(0, -10);
      ctx.lineTo(18, 8);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(w / 2, eyeY + 54);
      ctx.strokeStyle = '#4FD1C5';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -7, 16, Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    if (faceTexture) {
      faceTexture.needsUpdate = true;
    }
  }

  // --- 2. Materials Factory ---
  function createMaterials() {
    return {
      whitePlastic: new THREE.MeshStandardMaterial({
        color: PALETTE.whitePlastic,
        roughness: 0.16,
        metalness: 0.04,
        name: 'whitePlastic'
      }),
      whiteGloss: new THREE.MeshStandardMaterial({
        color: PALETTE.whiteGloss,
        roughness: 0.10,
        metalness: 0.05,
        name: 'whiteGloss'
      }),
      turquoiseAccent: new THREE.MeshStandardMaterial({
        color: PALETTE.turquoise,
        roughness: 0.20,
        metalness: 0.28,
        emissive: PALETTE.turquoise,
        emissiveIntensity: 0.35,
        name: 'turquoiseAccent'
      }),
      turquoiseGlow: new THREE.MeshBasicMaterial({
        color: PALETTE.turquoise,
        name: 'turquoiseGlow'
      }),
      silverJoint: new THREE.MeshStandardMaterial({
        color: PALETTE.silverJoint,
        roughness: 0.20,
        metalness: 0.94,
        name: 'silverJoint'
      }),
      brushedSilver: new THREE.MeshStandardMaterial({
        color: PALETTE.silverJoint,
        roughness: 0.18,
        metalness: 0.95,
        name: 'brushedSilver'
      }),
      silverSpring: new THREE.MeshStandardMaterial({
        color: PALETTE.silverSpring,
        roughness: 0.26,
        metalness: 0.90,
        name: 'silverSpring'
      }),
      darkGraphite: new THREE.MeshStandardMaterial({
        color: PALETTE.darkGraphite,
        roughness: 0.32,
        metalness: 0.85,
        name: 'darkGraphite'
      }),
      graphiteRing: new THREE.MeshStandardMaterial({
        color: PALETTE.graphiteRing,
        roughness: 0.24,
        metalness: 0.82,
        name: 'graphiteRing'
      }),
      screenDisplay: new THREE.MeshBasicMaterial({
        map: faceTexture,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
        depthWrite: false,
        name: 'screenDisplay'
      }),
      bezelDark: new THREE.MeshStandardMaterial({
        color: 0x0A0F1A,
        roughness: 0.25,
        metalness: 0.82,
        name: 'bezelDark'
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: PALETTE.chrome,
        roughness: 0.08,
        metalness: 0.98,
        name: 'chrome'
      }),
      antennaTip: new THREE.MeshStandardMaterial({
        color: PALETTE.turquoise,
        roughness: 0.15,
        metalness: 0.20,
        emissive: PALETTE.turquoise,
        emissiveIntensity: 0.55,
        name: 'antennaTip'
      })
    };
  }

  // --- 3. Geometry Helpers (Organic Curves, Capsules & Springs) ---
  function createRoundedBox(width, height, depth, radius, smoothness) {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const radiusMinusEps = radius - eps;
    const w = width / 2 - radius;
    const h = height / 2 - radius;

    shape.absarc(w, h, radiusMinusEps, 0, Math.PI / 2, false);
    shape.absarc(-w, h, radiusMinusEps, Math.PI / 2, Math.PI, false);
    shape.absarc(-w, -h, radiusMinusEps, Math.PI, Math.PI * 3 / 2, false);
    shape.absarc(w, -h, radiusMinusEps, Math.PI * 3 / 2, Math.PI * 2, false);

    const extrudeSettings = {
      depth: depth - radius * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radiusMinusEps,
      bevelThickness: radius,
      curveSegments: smoothness * 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }

  // Lathe-based Smooth Capsule
  function createCapsuleGeo(radius, cylinderHeight, segs) {
    const pts = [];
    const segments = segs || 22;
    const halfH = cylinderHeight / 2;

    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI / 2) * (i / 8);
      pts.push(new THREE.Vector2(radius * Math.sin(a), -halfH - radius * Math.cos(a)));
    }
    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI / 2) * (i / 8);
      pts.push(new THREE.Vector2(radius * Math.cos(a), halfH + radius * Math.sin(a)));
    }
    pts.push(new THREE.Vector2(0, halfH + radius));

    return new THREE.LatheGeometry(pts, segments);
  }

  // Lathe-based Smooth Tapered Capsule
  function createTaperedCapsuleGeo(rTop, rBottom, cylinderHeight, segs) {
    const pts = [];
    const segments = segs || 22;
    const halfH = cylinderHeight / 2;

    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI / 2) * (i / 8);
      pts.push(new THREE.Vector2(rBottom * Math.sin(a), -halfH - rBottom * Math.cos(a)));
    }
    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI / 2) * (i / 8);
      pts.push(new THREE.Vector2(rTop * Math.cos(a), halfH + rTop * Math.sin(a)));
    }
    pts.push(new THREE.Vector2(0, halfH + rTop));

    return new THREE.LatheGeometry(pts, segments);
  }

  // Exposed Metallic Silver Spring Joint
  function createSpringJoint(height, radius, coils, mats) {
    const jointGroup = new THREE.Group();
    const coilStep = height / coils;
    const tubeRadius = Math.min(0.035, radius * 0.28);

    for (let i = 0; i < coils; i++) {
      const ringGeo = new THREE.TorusGeometry(radius, tubeRadius, 12, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, mats.silverJoint);
      ring.position.y = (i - coils / 2 + 0.5) * coilStep;
      jointGroup.add(ring);
    }

    const coreGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, height * 0.96, 20);
    const core = new THREE.Mesh(coreGeo, mats.silverSpring);
    jointGroup.add(core);

    return jointGroup;
  }

  // --- 4. Refined Robot Assembly (With Visible Articulated Neck) ---
  function buildRobot(mats) {
    robotRoot = new THREE.Group();
    robotRoot.name = 'ChibiRobotRoot';

    // ==========================================
    // A. Pelvis & Waist Pod (Smooth Rounded Chassis)
    // ==========================================
    pelvisGroup = new THREE.Group();
    pelvisGroup.position.y = -0.44;

    const pelvisGeo = createCapsuleGeo(0.27, 0.30, 22);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, mats.whitePlastic);
    pelvisMesh.rotation.z = Math.PI / 2;
    pelvisMesh.scale.set(0.74, 1.20, 0.80);
    pelvisMesh.castShadow = true;
    pelvisGroup.add(pelvisMesh);

    // Exposed Silver Waist Spring Joint
    const waistJoint = createSpringJoint(0.24, 0.20, 3, mats);
    waistJoint.position.y = 0.18;
    pelvisGroup.add(waistJoint);

    robotRoot.add(pelvisGroup);

    // ==========================================
    // B. Legs: Rounded Armor Shells & Futuristic Boots
    // ==========================================
    function createChibiLeg(isLeft) {
      const legGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      legGroup.position.set(sign * 0.40, -0.48, 0.02);

      // 1. Hip Spring Joint
      const hipSpring = createSpringJoint(0.21, 0.15, 2, mats);
      legGroup.add(hipSpring);

      // 2. Thigh
      const thighGroup = new THREE.Group();
      thighGroup.position.y = -0.11;

      const thighGeo = createCapsuleGeo(0.175, 0.30, 24);
      const thighMesh = new THREE.Mesh(thighGeo, mats.whiteGloss);
      thighMesh.position.y = -0.16;
      thighMesh.scale.set(1.02, 1.0, 1.06);
      thighMesh.castShadow = true;
      thighGroup.add(thighMesh);

      legGroup.add(thighGroup);

      // 3. Knee Spring Joint
      const kneeGroup = new THREE.Group();
      kneeGroup.position.y = -0.46;

      const kneeSpring = createSpringJoint(0.18, 0.13, 3, mats);
      kneeGroup.add(kneeSpring);

      const kneeDiscGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.038, 20);
      kneeDiscGeo.rotateZ(Math.PI / 2);
      const kneeDisc = new THREE.Mesh(kneeDiscGeo, mats.silverJoint);
      kneeDisc.position.set(sign * 0.15, 0, 0);
      kneeGroup.add(kneeDisc);

      // 4. Shin / Calf
      const calfGroup = new THREE.Group();
      calfGroup.position.y = -0.06;

      const calfGeo = createTaperedCapsuleGeo(0.14, 0.175, 0.28, 24);
      const calfMesh = new THREE.Mesh(calfGeo, mats.whiteGloss);
      calfMesh.position.set(0, -0.17, 0.02);
      calfMesh.castShadow = true;
      calfGroup.add(calfMesh);

      kneeGroup.add(calfGroup);
      legGroup.add(kneeGroup);

      // 5. Ankle Spring Joint
      const ankleGroup = new THREE.Group();
      ankleGroup.position.y = -0.38;
      const ankleSpring = createSpringJoint(0.13, 0.11, 2, mats);
      ankleGroup.add(ankleSpring);

      // 6. Futuristic Chibi Boot
      const bootGroup = new THREE.Group();
      bootGroup.position.y = -0.09;

      const toeGeo = new THREE.SphereGeometry(0.195, 22, 18);
      toeGeo.scale(1.05, 0.74, 1.36);
      const toe = new THREE.Mesh(toeGeo, mats.whiteGloss);
      toe.position.set(0, -0.06, 0.09);
      toe.castShadow = true;
      bootGroup.add(toe);

      const collarGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.11, 20);
      const collar = new THREE.Mesh(collarGeo, mats.whitePlastic);
      collar.position.set(0, 0.02, -0.02);
      bootGroup.add(collar);

      const ankleDiscGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.038, 20);
      ankleDiscGeo.rotateZ(Math.PI / 2);
      const ankleDisc = new THREE.Mesh(ankleDiscGeo, mats.silverJoint);
      ankleDisc.position.set(sign * 0.20, 0.01, 0.01);
      bootGroup.add(ankleDisc);

      const rivetGeo = new THREE.SphereGeometry(0.038, 12, 12);
      rivetGeo.scale(0.5, 1, 1);
      const rivet = new THREE.Mesh(rivetGeo, mats.chrome);
      rivet.position.set(sign * 0.228, 0.01, 0.01);
      bootGroup.add(rivet);

      const soleRingGeo = new THREE.TorusGeometry(0.20, 0.026, 12, 24);
      soleRingGeo.rotateX(Math.PI / 2);
      soleRingGeo.scale(0.96, 1.32, 1.0);
      const soleRing = new THREE.Mesh(soleRingGeo, mats.turquoiseAccent);
      soleRing.position.set(0, -0.15, 0.09);
      bootGroup.add(soleRing);

      const treadGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.032, 22);
      treadGeo.scale(0.95, 1.0, 1.35);
      const tread = new THREE.Mesh(treadGeo, mats.bezelDark);
      tread.position.set(0, -0.17, 0.09);
      bootGroup.add(tread);

      ankleGroup.add(bootGroup);
      calfGroup.add(ankleGroup);

      return { root: legGroup, thigh: thighGroup, knee: kneeGroup, boot: bootGroup };
    }

    const leftLeg = createChibiLeg(true);
    const rightLeg = createChibiLeg(false);
    robotRoot.add(leftLeg.root);
    robotRoot.add(rightLeg.root);

    // ==========================================
    // C. Torso: Smooth Curved, Tapered Pod Shell
    // ==========================================
    torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.16;

    const torsoCurve = new THREE.SplineCurve([
      new THREE.Vector2(0, -0.48),
      new THREE.Vector2(0.28, -0.46),
      new THREE.Vector2(0.39, -0.24),
      new THREE.Vector2(0.47, 0.06),
      new THREE.Vector2(0.44, 0.32),
      new THREE.Vector2(0.28, 0.48),
      new THREE.Vector2(0, 0.49)
    ]);
    const torsoPts = torsoCurve.getPoints(28);
    const torsoGeo = new THREE.LatheGeometry(torsoPts, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, mats.whiteGloss);
    torsoMesh.scale.set(1.24, 1.0, 0.90);
    torsoMesh.castShadow = true;
    torsoGroup.add(torsoMesh);

    // Turquoise Inverted Triangular Chest Detail (#4FD1C5)
    const chestShape = new THREE.Shape();
    chestShape.moveTo(-0.18, 0.14);
    chestShape.lineTo(0.18, 0.14);
    chestShape.lineTo(0, -0.16);
    chestShape.closePath();

    const chestExtrude = new THREE.ExtrudeGeometry(chestShape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSize: 0.018,
      bevelThickness: 0.018,
      bevelSegments: 2
    });
    chestExtrude.center();
    const chestEmblem = new THREE.Mesh(chestExtrude, mats.turquoiseAccent);
    chestEmblem.position.set(0, 0.10, 0.41);
    chestEmblem.rotation.x = -0.08;
    torsoGroup.add(chestEmblem);

    // Glowing Cyan Core Dot on Chest Detail
    const coreDotGeo = new THREE.SphereGeometry(0.046, 16, 16);
    const coreDot = new THREE.Mesh(coreDotGeo, mats.turquoiseGlow);
    coreDot.position.set(0, 0.10, 0.45);
    torsoGroup.add(coreDot);

    // Smooth Curved Backpack Housing on Back
    const packGeo = createCapsuleGeo(0.25, 0.34, 20);
    const packMesh = new THREE.Mesh(packGeo, mats.whitePlastic);
    packMesh.rotation.z = Math.PI / 2;
    packMesh.scale.set(0.70, 1.10, 0.62);
    packMesh.position.set(0, 0.08, -0.38);
    torsoGroup.add(packMesh);

    // Dual Silver Circular Exhaust/Sensor Vents on Backpack
    const ventGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.045, 18);
    ventGeo.rotateX(Math.PI / 2);
    const ventL = new THREE.Mesh(ventGeo, mats.silverJoint);
    ventL.position.set(-0.18, 0.08, -0.49);
    torsoGroup.add(ventL);
    const ventR = ventL.clone();
    ventR.position.x = 0.18;
    torsoGroup.add(ventR);

    // ==========================================
    // D. Clearly Visible Articulated Mechanical Neck
    // ==========================================
    // Placed precisely atop the upper torso shell
    neckGroup = new THREE.Group();
    neckGroup.position.y = 0.48;

    // 1. Bottom Circular Joint Connector (Mounting Flange on Torso)
    const baseFlangeGeo = new THREE.CylinderGeometry(0.27, 0.29, 0.05, 24);
    const baseFlange = new THREE.Mesh(baseFlangeGeo, mats.darkGraphite);
    baseFlange.position.y = 0.025;
    neckGroup.add(baseFlange);

    const baseCollarGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.04, 24);
    const baseCollar = new THREE.Mesh(baseCollarGeo, mats.graphiteRing);
    baseCollar.position.y = 0.048;
    neckGroup.add(baseCollar);

    // Subtle Turquoise Accent Ring at Bottom Connector
    const baseTurquoiseGeo = new THREE.TorusGeometry(0.25, 0.018, 12, 28);
    baseTurquoiseGeo.rotateX(Math.PI / 2);
    const baseTurquoise = new THREE.Mesh(baseTurquoiseGeo, mats.turquoiseAccent);
    baseTurquoise.position.y = 0.048;
    neckGroup.add(baseTurquoise);

    // 4 Miniature Silver Hex Connector Bolts
    for (let b = 0; b < 4; b++) {
      const angle = (b * Math.PI) / 2 + Math.PI / 4;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.015, 8), mats.chrome);
      bolt.position.set(Math.cos(angle) * 0.25, 0.048, Math.sin(angle) * 0.25);
      neckGroup.add(bolt);
    }

    // 2. Articulated Mechanical Neck Stem (Telescopic Sleeve & Bellows Coils)
    neckStem = new THREE.Group();
    neckStem.position.y = 0.05;

    // Dark graphite telescopic hydraulic sleeve
    const outerSleeveGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.15, 20);
    const outerSleeve = new THREE.Mesh(outerSleeveGeo, mats.darkGraphite);
    outerSleeve.position.y = 0.075;
    neckStem.add(outerSleeve);

    // Shiny polished chrome inner sliding piston
    const innerPistonGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.18, 20);
    const innerPiston = new THREE.Mesh(innerPistonGeo, mats.chrome);
    innerPiston.position.y = 0.15;
    neckStem.add(innerPiston);

    // 3 Exposed Metallic Brushed Silver Spring-like Segments (Bellows Rings)
    const springRadii = [0.18, 0.175, 0.170];
    for (let s = 0; s < 3; s++) {
      const springRingGeo = new THREE.TorusGeometry(springRadii[s], 0.026, 12, 24);
      springRingGeo.rotateX(Math.PI / 2);
      const springRing = new THREE.Mesh(springRingGeo, mats.brushedSilver);
      springRing.position.y = 0.065 + s * 0.065;
      neckStem.add(springRing);
    }

    // Subtle Turquoise Accent Ring in Mid-Neck
    const midTurquoiseGeo = new THREE.TorusGeometry(0.15, 0.016, 12, 24);
    midTurquoiseGeo.rotateX(Math.PI / 2);
    const midTurquoise = new THREE.Mesh(midTurquoiseGeo, mats.turquoiseAccent);
    midTurquoise.position.y = 0.135;
    neckStem.add(midTurquoise);

    // Side micro-hydraulic stabilizer struts (visible mechanical details from sides)
    function createSideStrut(isLeft) {
      const strutGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      strutGroup.position.set(sign * 0.175, 0.11, 0);

      const strutBody = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10), mats.darkGraphite);
      strutGroup.add(strutBody);

      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.12, 10), mats.chrome);
      rod.position.y = 0.04;
      strutGroup.add(rod);

      const pivotTop = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), mats.brushedSilver);
      pivotTop.position.y = 0.09;
      strutGroup.add(pivotTop);

      const pivotBottom = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), mats.brushedSilver);
      pivotBottom.position.y = -0.08;
      strutGroup.add(pivotBottom);

      return strutGroup;
    }
    neckStem.add(createSideStrut(true));
    neckStem.add(createSideStrut(false));

    // 3. Top Circular Joint Connector (Mounting Collar on Under-Head)
    const topCollarGroup = new THREE.Group();
    topCollarGroup.position.y = 0.25;

    // Brushed silver spherical gimbal pivot ball
    const gimbalBallGeo = new THREE.SphereGeometry(0.135, 18, 18);
    const gimbalBall = new THREE.Mesh(gimbalBallGeo, mats.brushedSilver);
    topCollarGroup.add(gimbalBall);

    // Dark graphite socket flange
    const topSocketGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.05, 24);
    const topSocket = new THREE.Mesh(topSocketGeo, mats.darkGraphite);
    topSocket.position.y = 0.025;
    topCollarGroup.add(topSocket);

    // Subtle Turquoise Accent Ring at Top Connector
    const topTurquoiseGeo = new THREE.TorusGeometry(0.23, 0.018, 12, 28);
    topTurquoiseGeo.rotateX(Math.PI / 2);
    const topTurquoise = new THREE.Mesh(topTurquoiseGeo, mats.turquoiseAccent);
    topTurquoise.position.y = 0.040;
    topCollarGroup.add(topTurquoise);

    // Top head mounting plate
    const topPlateGeo = new THREE.CylinderGeometry(0.28, 0.26, 0.032, 24);
    const topPlate = new THREE.Mesh(topPlateGeo, mats.graphiteRing);
    topPlate.position.y = 0.055;
    topCollarGroup.add(topPlate);

    neckStem.add(topCollarGroup);
    neckGroup.add(neckStem);

    // ==========================================
    // E. Monitor Head (Articulated atop Neck)
    // ==========================================
    headGroup = new THREE.Group();
    headGroup.position.y = HEAD_BASE_Y; // Resting cleanly atop the top neck connector

    const headW = 1.28;
    const headH = 0.96;
    const headD = 0.92;
    const headBevel = 0.19;

    // Outer white casing
    const helmetGeo = createRoundedBox(headW, headH, headD, headBevel, 4);
    const helmetMesh = new THREE.Mesh(helmetGeo, mats.whiteGloss);
    helmetMesh.castShadow = true;
    headGroup.add(helmetMesh);

    // Recessed dark bezel frame
    const bezelGeo = createRoundedBox(1.05, 0.74, 0.07, 0.11, 3);
    const bezelMesh = new THREE.Mesh(bezelGeo, mats.bezelDark);
    bezelMesh.position.set(0, 0, 0.42);
    headGroup.add(bezelMesh);

    // Front OLED Display with Animated Cyan LED Eyes & Mouth
    // Positioned cleanly with polygonOffset and depthWrite: false to eliminate Z-fighting
    const screenGeo = new THREE.PlaneGeometry(0.97, 0.66);
    const screenMesh = new THREE.Mesh(screenGeo, mats.screenDisplay);
    screenMesh.position.set(0, 0, 0.468);
    headGroup.add(screenMesh);

    // Headphone Ears with Turquoise Accent and Integrated Vertical Antennas (Matching attached image)
    function createHeadphoneEar(isLeft) {
      const earGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      earGroup.position.set(sign * (headW / 2 + 0.01), 0, 0);

      // 1. Connection Collar to Helmet
      const collarGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.04, 20);
      collarGeo.rotateZ(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, mats.whitePlastic);
      collar.position.x = sign * 0.02;
      earGroup.add(collar);

      // 2. White Headphone Ear Cup Body
      const cupWidth = 0.12;
      const cupHeight = 0.38;
      const cupDepth = 0.28;
      const cupGeo = createRoundedBox(cupWidth, cupHeight, cupDepth, 0.05, 3);
      const cupMesh = new THREE.Mesh(cupGeo, mats.whiteGloss);
      cupMesh.position.x = sign * (0.04 + cupWidth / 2);
      cupMesh.castShadow = true;
      earGroup.add(cupMesh);

      // 3. Turquoise Horizontal Accent Block / Cushion (Wrapping across center of ear cup)
      const accentWidth = 0.15;
      const accentHeight = 0.14;
      const accentDepth = 0.26;
      const accentGeo = createRoundedBox(accentWidth, accentHeight, accentDepth, 0.03, 2);
      const accentMesh = new THREE.Mesh(accentGeo, mats.turquoiseAccent);
      accentMesh.position.x = sign * (0.04 + accentWidth / 2 + 0.002);
      accentMesh.castShadow = true;
      earGroup.add(accentMesh);

      // 4. White Antenna Stalk (Extends straight up out of top of ear cup)
      const antennaRoot = new THREE.Group();
      antennaRoot.position.set(sign * (0.04 + cupWidth / 2), cupHeight / 2 - 0.01, 0);
      antennaRoot.rotation.z = sign * -0.06;
      antennaRoot.rotation.x = -0.02;

      // Small antenna socket mount
      const socketGeo = new THREE.CylinderGeometry(0.028, 0.034, 0.025, 16);
      const socket = new THREE.Mesh(socketGeo, mats.whitePlastic);
      socket.position.y = 0.012;
      antennaRoot.add(socket);

      // White antenna bar with rounded top cap
      const stalkHeight = 0.44;
      const stalkGeo = createRoundedBox(0.044, stalkHeight, 0.050, 0.018, 2);
      const stalkMesh = new THREE.Mesh(stalkGeo, mats.whiteGloss);
      stalkMesh.position.y = stalkHeight / 2 + 0.02;
      stalkMesh.castShadow = true;
      antennaRoot.add(stalkMesh);

      earGroup.add(antennaRoot);

      return { root: earGroup, antenna: antennaRoot };
    }

    const earL = createHeadphoneEar(true);
    const earR = createHeadphoneEar(false);
    antennaL = earL.antenna;
    antennaR = earR.antenna;
    headGroup.add(earL.root);
    headGroup.add(earR.root);

    // Top Center Turquoise Crest Badge (Matching reference image)
    const crestGeo = createRoundedBox(0.34, 0.09, 0.25, 0.03, 2);
    const crest = new THREE.Mesh(crestGeo, mats.turquoiseAccent);
    crest.position.set(0, headH / 2 + 0.035, 0);
    headGroup.add(crest);

    neckGroup.add(headGroup);
    torsoGroup.add(neckGroup);

    // ==========================================
    // F. Articulated Arms & Hands
    // ==========================================
    function createChibiArm(isRight) {
      const armGroup = new THREE.Group();
      const sign = isRight ? 1 : -1;
      armGroup.position.set(sign * 0.65, 0.28, 0);

      // 1. Shoulder Spring Joint
      const shoulderSpring = createSpringJoint(0.18, 0.13, 2, mats);
      armGroup.add(shoulderSpring);

      const pauldronGeo = new THREE.SphereGeometry(0.20, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const pauldron = new THREE.Mesh(pauldronGeo, mats.whiteGloss);
      pauldron.position.set(sign * 0.045, 0.045, 0);
      pauldron.rotation.z = sign * -0.4;
      armGroup.add(pauldron);

      // 2. Upper Arm
      const upperArm = new THREE.Group();
      upperArm.position.set(sign * 0.09, -0.07, 0);

      const upperArmGeo = createCapsuleGeo(0.125, 0.22, 20);
      const upperArmMesh = new THREE.Mesh(upperArmGeo, mats.whiteGloss);
      upperArmMesh.position.y = -0.13;
      upperArmMesh.castShadow = true;
      upperArm.add(upperArmMesh);

      // 3. Elbow Spring Joint
      const elbow = new THREE.Group();
      elbow.position.y = -0.33;

      const elbowSpring = createSpringJoint(0.15, 0.11, 3, mats);
      elbow.add(elbowSpring);

      const elbowCapGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.033, 18);
      elbowCapGeo.rotateZ(Math.PI / 2);
      const elbowCap = new THREE.Mesh(elbowCapGeo, mats.silverJoint);
      elbowCap.position.x = sign * 0.11;
      elbow.add(elbowCap);

      // 4. Forearm with Turquoise Accent Band
      const forearm = new THREE.Group();
      forearm.position.y = -0.04;

      const forearmGeo = createTaperedCapsuleGeo(0.11, 0.135, 0.24, 20);
      const forearmMesh = new THREE.Mesh(forearmGeo, mats.whiteGloss);
      forearmMesh.position.y = -0.14;
      forearmMesh.castShadow = true;
      forearm.add(forearmMesh);

      const wristBandGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.048, 20);
      const wristBand = new THREE.Mesh(wristBandGeo, mats.turquoiseAccent);
      wristBand.position.y = -0.27;
      forearm.add(wristBand);

      // 5. Exposed Metallic Wrist Joint (Swivel collar + silver spring bellows)
      const wristGroup = new THREE.Group();
      wristGroup.position.y = -0.30;

      const wristCollarGeo = new THREE.CylinderGeometry(0.095, 0.105, 0.03, 18);
      const wristCollar = new THREE.Mesh(wristCollarGeo, mats.silverJoint);
      wristGroup.add(wristCollar);

      const wristSpring = createSpringJoint(0.08, 0.075, 2, mats);
      wristSpring.position.y = -0.04;
      wristGroup.add(wristSpring);

      forearm.add(wristGroup);

      // 6. Sculpted Articulated Robotic Hand
      const hand = new THREE.Group();
      hand.position.y = -0.075;
      wristGroup.add(hand);

      // A. Main Palm Pod (Curved ergonomic chassis with dorsal shell)
      const palmChassisGeo = createRoundedBox(0.125, 0.115, 0.065, 0.024, 2);
      const palmChassis = new THREE.Mesh(palmChassisGeo, mats.whiteGloss);
      palmChassis.position.set(0, -0.05, 0);
      palmChassis.castShadow = true;
      hand.add(palmChassis);

      // B. Inner Palm Grip Pad (Machined brushed silver insert)
      const gripGeo = new THREE.BoxGeometry(0.095, 0.075, 0.012);
      const gripMesh = new THREE.Mesh(gripGeo, mats.silverJoint);
      gripMesh.position.set(0, -0.052, 0.028);
      hand.add(gripMesh);

      // C. Glowing Cyan Palm Sensor/Repulsor Node (Signature sci-fi detail)
      const palmDotGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.008, 16);
      palmDotGeo.rotateX(Math.PI / 2);
      const palmDot = new THREE.Mesh(palmDotGeo, mats.turquoiseAccent);
      palmDot.position.set(0, -0.052, 0.035);
      hand.add(palmDot);

      const palmCoreGeo = new THREE.SphereGeometry(0.010, 10, 10);
      const palmCore = new THREE.Mesh(palmCoreGeo, mats.turquoiseGlow);
      palmCore.position.set(0, -0.052, 0.039);
      hand.add(palmCore);

      // D. Realistic Articulated Robotic Fingers with Cascading Phalanxes & Joints
      function createArticulatedFinger(fx, fy, fz, len, spreadZ, curlX, twistY, isThumb) {
        const fingerBase = new THREE.Group();
        fingerBase.position.set(fx, fy, fz);
        fingerBase.rotation.set(curlX * 0.45, twistY || 0, spreadZ);

        // 1. Base Metacarpal / Knuckle Ball Joint
        const baseR = isThumb ? 0.023 : 0.020;
        const k1Geo = new THREE.SphereGeometry(baseR, 12, 10);
        const k1 = new THREE.Mesh(k1Geo, mats.silverJoint);
        fingerBase.add(k1);

        // Knuckle collar ring
        const kRingGeo = new THREE.TorusGeometry(baseR * 0.95, 0.005, 8, 16);
        kRingGeo.rotateX(Math.PI / 2);
        const kRing = new THREE.Mesh(kRingGeo, mats.chrome);
        fingerBase.add(kRing);

        // 2. Proximal Phalanx (Base segment)
        const seg1Len = len * 0.48;
        const p1R = isThumb ? 0.020 : 0.017;
        const p1Geo = createCapsuleGeo(p1R, seg1Len, 12);
        const p1 = new THREE.Mesh(p1Geo, mats.whiteGloss);
        p1.position.y = -seg1Len * 0.5;
        p1.castShadow = true;
        fingerBase.add(p1);

        // 3. Interphalangeal Hinge Joint (Middle Joint)
        const midJoint = new THREE.Group();
        midJoint.position.y = -seg1Len;
        midJoint.rotation.x = curlX * 0.55; // Secondary natural curvature

        const midR = isThumb ? 0.018 : 0.015;
        const k2Geo = new THREE.SphereGeometry(midR, 10, 10);
        const k2 = new THREE.Mesh(k2Geo, mats.silverJoint);
        midJoint.add(k2);

        // 4. Distal Phalanx (Fingertip segment)
        const seg2Len = len * 0.44;
        const p2R = isThumb ? 0.018 : 0.015;
        const p2Geo = createTaperedCapsuleGeo(p2R * 0.85, p2R, seg2Len, 12);
        const p2 = new THREE.Mesh(p2Geo, mats.whiteGloss);
        p2.position.y = -seg2Len * 0.5;
        p2.castShadow = true;
        midJoint.add(p2);

        // Fingertip cyan sensor pad
        const padGeo = new THREE.SphereGeometry(p2R * 0.6, 8, 8);
        const pad = new THREE.Mesh(padGeo, mats.turquoiseAccent);
        pad.position.set(0, -seg2Len * 0.65, p2R * 0.45);
        midJoint.add(pad);

        fingerBase.add(midJoint);
        return fingerBase;
      }

      if (!isRight) {
        // --- Outer Left Hand (Friendly, relaxed waving gesture with palm facing forward) ---
        // Wrist rotation: Palm angled towards camera with natural welcoming pitch
        hand.rotation.set(-0.24, -0.42, 0.16);

        // Opposable Thumb (Inside edge towards body)
        hand.add(createArticulatedFinger(0.048, -0.025, 0.020, 0.150, 0.42, -0.18, 0.28, true));
        // Index Finger
        hand.add(createArticulatedFinger(0.020, -0.054, 0.005, 0.165, 0.12, -0.14, 0.08, false));
        // Middle Finger (Tallest)
        hand.add(createArticulatedFinger(-0.008, -0.058, 0.002, 0.180, -0.04, -0.10, 0.02, false));
        // Pinky Finger (Outer edge)
        hand.add(createArticulatedFinger(-0.038, -0.050, -0.002, 0.145, -0.24, -0.20, -0.08, false));
      } else {
        // --- Inner Right Hand (Naturally resting near the waist with gently curved fingers) ---
        // Wrist rotation: Angled inward toward body/waist contour
        hand.rotation.set(0.35, 0.38, -0.22);

        // Opposable Thumb (Resting smoothly along waist front)
        hand.add(createArticulatedFinger(-0.048, -0.025, 0.020, 0.150, -0.35, 0.28, -0.24, true));
        // Index Finger (Gently curved around waist contour)
        hand.add(createArticulatedFinger(-0.020, -0.054, 0.005, 0.165, -0.10, 0.50, -0.06, false));
        // Middle Finger (Gracefully curled)
        hand.add(createArticulatedFinger(0.008, -0.058, 0.002, 0.180, 0.03, 0.54, 0.02, false));
        // Pinky Finger (Curled naturally)
        hand.add(createArticulatedFinger(0.038, -0.050, -0.002, 0.145, 0.18, 0.62, 0.08, false));
      }

      elbow.add(forearm);
      upperArm.add(elbow);
      armGroup.add(upperArm);

      return { root: armGroup, upper: upperArm, elbow: elbow, forearm: forearm, hand: hand };
    }

    const rightArm = createChibiArm(true);
    const leftArm = createChibiArm(false);

    shoulderR = rightArm.root;
    upperArmR = rightArm.upper;
    elbowR = rightArm.elbow;
    forearmR = rightArm.forearm;
    handR = rightArm.hand;

    shoulderL = leftArm.root;
    upperArmL = leftArm.upper;
    elbowL = leftArm.elbow;
    forearmL = leftArm.forearm;
    handL = leftArm.hand;

    torsoGroup.add(shoulderR);
    torsoGroup.add(shoulderL);

    // Initial friendly greeting wave pose for outer left arm
    shoulderL.rotation.z = -0.38;
    shoulderL.rotation.x = -0.14;
    shoulderL.rotation.y = 0.12;
    upperArmL.rotation.y = -0.22;
    elbowL.rotation.z = 2.24;
    elbowL.rotation.y = -0.32;
    elbowL.rotation.x = 0.12;
    forearmL.rotation.z = 0.16;
    forearmL.rotation.y = -0.28;

    // Confident, relaxed resting pose for inner right arm alongside the waist
    shoulderR.rotation.z = 0.36;
    shoulderR.rotation.x = 0.08;
    shoulderR.rotation.y = -0.10;
    upperArmR.rotation.y = 0.16;
    elbowR.rotation.z = -0.82;
    elbowR.rotation.x = 0.16;
    elbowR.rotation.y = 0.22;
    forearmR.rotation.z = -0.18;
    forearmR.rotation.y = 0.32;

    robotRoot.add(torsoGroup);

    return robotRoot;
  }

  // --- 5. Studio Lighting with Soft Cyan Rim & Key ---
  function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x1E293B, 1.45);
    scene.add(ambientLight);

    keyLight = new THREE.DirectionalLight(0xF8FAFC, 2.5);
    keyLight.position.set(3.5, 4.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    rimLight = new THREE.DirectionalLight(0x4FD1C5, 3.2);
    rimLight.position.set(-3.8, 2.5, -3.2);
    scene.add(rimLight);

    fillLight = new THREE.DirectionalLight(0x94A3B8, 0.95);
    fillLight.position.set(1.5, -1.0, 3.0);
    scene.add(fillLight);
  }

  // --- 6. Resize Handler ---
  function onWindowResize() {
    if (!container || !renderer || !camera) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 540;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // --- 7. Mouse, Hover & Scroll Interactive Events ---
  function setupEvents() {
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY;
      scrollVelocity = deltaY * 0.0035;
      lastScrollY = currentY;
    }, { passive: true });

    if (stage) {
      stage.addEventListener('mouseenter', () => {
        mouse.isHovered = true;
        faceState.expression = 'happy';
        drawFace();
      });

      stage.addEventListener('mouseleave', () => {
        mouse.isHovered = false;
      });

      stage.addEventListener('click', () => {
        triggerClickGreeting();
      });
    }

    window.addEventListener('resize', onWindowResize);

    if ('IntersectionObserver' in window && aboutSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isSectionVisible = entry.isIntersecting;
          if (isSectionVisible) {
            triggerWave();
            if (!animationFrameId) {
              clock.start();
              animate();
            }
          }
        });
      }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });

      observer.observe(aboutSection);
    } else {
      isSectionVisible = true;
    }
  }

  // --- 8. Interactive Action Triggers ---
  function triggerWave() {
    isWaving = true;
    waveTimer = 0;
    waveDuration = 3.2;
  }

  function triggerClickGreeting() {
    isHappy = true;
    bounceVelocity = 0.11;
    triggerWave();

    faceState.expression = 'happy';
    faceState.blink = 0;
    drawFace();

    setTimeout(() => {
      faceState.expression = 'winking';
      drawFace();
    }, 1100);

    setTimeout(() => {
      faceState.expression = 'happy';
      isHappy = false;
      drawFace();
    }, 2800);
  }

  // --- 9. Animation Loop with Articulated Neck Physics ---
  function animate() {
    if (!isSectionVisible) {
      animationFrameId = null;
      return;
    }

    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Mouse Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    // 2. Scroll-responsive Head Tilt Physics
    scrollVelocity *= 0.92;
    const targetScrollTilt = Math.max(-0.25, Math.min(0.25, scrollVelocity));
    scrollTilt = THREE.MathUtils.lerp(scrollTilt, targetScrollTilt, 0.08);

    // 3. Anti-Gravity Floating Physics
    const floatBob = Math.sin(elapsedTime * 2.1) * 0.075;
    const floatSway = Math.sin(elapsedTime * 1.5) * 0.015;

    // Occasional happy bounce
    nextBounceTime -= delta;
    if (nextBounceTime <= 0 && bounceVelocity === 0 && floatOffset === 0) {
      bounceVelocity = 0.092;
      nextBounceTime = 15.0 + Math.random() * 5.0;
      if (faceState.expression === 'neutral') {
        faceState.expression = 'happy';
        drawFace();
      }
    }

    if (bounceVelocity !== 0 || floatOffset > 0) {
      floatOffset += bounceVelocity;
      bounceVelocity -= 0.58 * delta;
      if (floatOffset <= 0) {
        floatOffset = 0;
        bounceVelocity = 0;
      }
    }

    if (robotRoot) {
      robotRoot.position.y = -0.06 + floatBob + floatOffset;
      robotRoot.rotation.z = floatSway;
      robotRoot.rotation.y = THREE.MathUtils.lerp(robotRoot.rotation.y, mouse.x * 0.18, 0.05);
    }

    // 4. Torso Breathing
    const breath = Math.sin(elapsedTime * 2.2);
    if (torsoGroup) {
      torsoGroup.position.y = 0.16 + breath * 0.016;
      torsoGroup.rotation.x = breath * 0.010;
    }

    // 5. Articulated Head & Mechanical Neck Movement
    if (headGroup) {
      // Idle head-bobbing: subtle, lively mechanical pulsation
      const headBob = Math.sin(elapsedTime * 2.8) * 0.014;
      headGroup.position.y = HEAD_BASE_Y + headBob;

      // Cursor tracking & interactive tilts:
      // Yaw (rotate left & right)
      let targetHeadY = mouse.x * 0.44;
      // Pitch (slight forward & backward tilting)
      let targetHeadX = -mouse.y * 0.28;
      // Roll (side tilting)
      let targetHeadZ = 0;

      if (mouse.isHovered) {
        targetHeadZ = 0.14;
        targetHeadX -= 0.06;
      }

      targetHeadZ += scrollTilt * 0.8;
      targetHeadX += Math.abs(scrollTilt) * 0.5;

      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadY, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadX, 0.08);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetHeadZ, 0.08);

      // Neck joint articulation: moves naturally in coordinated sync with the head
      if (neckStem) {
        neckStem.rotation.y = THREE.MathUtils.lerp(neckStem.rotation.y, targetHeadY * 0.45, 0.08);
        neckStem.rotation.x = THREE.MathUtils.lerp(neckStem.rotation.x, targetHeadX * 0.40, 0.08);
        neckStem.rotation.z = THREE.MathUtils.lerp(neckStem.rotation.z, targetHeadZ * 0.35, 0.08);

        // Telescopic spring compression/expansion during idle head-bobbing
        neckStem.scale.y = 1.0 + (headBob / 0.28);
      }

      // Subtle idle antenna sway on headphone ears
      if (antennaL && antennaR) {
        antennaL.rotation.z = -0.06 + Math.sin(elapsedTime * 3.0) * 0.015;
        antennaR.rotation.z = 0.06 - Math.sin(elapsedTime * 3.0 + 0.8) * 0.015;
        antennaL.rotation.x = -0.02 + Math.cos(elapsedTime * 2.6) * 0.012;
        antennaR.rotation.x = -0.02 + Math.cos(elapsedTime * 2.6 + 0.5) * 0.012;
      }
    }

    // 6. LED Eyes Following Cursor & Periodic Blinking (Optimized & Non-Fluctuating)
    faceState.targetLookX = mouse.x * 20;
    faceState.targetLookY = -mouse.y * 12;
    faceState.lookX += (faceState.targetLookX - faceState.lookX) * 0.08;
    faceState.lookY += (faceState.targetLookY - faceState.lookY) * 0.08;

    const blinkCycle = elapsedTime % 4.5;
    let currentBlink = 0;
    if (blinkCycle < 0.14) {
      currentBlink = Math.sin((blinkCycle / 0.14) * Math.PI);
    }
    faceState.blink = currentBlink;

    // Only re-draw face when visually needed (prevents texture thrashing and screen fluctuation)
    const lookDiff = Math.hypot(faceState.lookX - lastFaceState.lookX, faceState.lookY - lastFaceState.lookY);
    const blinkDiff = Math.abs(faceState.blink - lastFaceState.blink);
    const exprChanged = faceState.expression !== lastFaceState.expression;

    if (lookDiff > 1.2 || blinkDiff > 0.04 || exprChanged) {
      lastFaceState.lookX = faceState.lookX;
      lastFaceState.lookY = faceState.lookY;
      lastFaceState.blink = faceState.blink;
      lastFaceState.expression = faceState.expression;
      drawFace();
    }

    // 7. Expressive Greeting Wave (Outer Left Arm)
    if (isWaving && shoulderL && elbowL && forearmL && handL) {
      waveTimer += delta;
      const waveFreq = 6.2;
      const waveSin = Math.sin(waveTimer * waveFreq);
      const waveCos = Math.cos(waveTimer * waveFreq);

      shoulderL.rotation.z = THREE.MathUtils.lerp(shoulderL.rotation.z, -0.40, 0.12);
      shoulderL.rotation.x = THREE.MathUtils.lerp(shoulderL.rotation.x, -0.14, 0.12);
      upperArmL.rotation.y = THREE.MathUtils.lerp(upperArmL.rotation.y, -0.22, 0.12);

      elbowL.rotation.z = 2.24 + waveSin * 0.18;
      elbowL.rotation.y = -0.32 + waveCos * 0.10;
      forearmL.rotation.z = 0.16 + waveSin * 0.12;
      handL.rotation.z = 0.16 + waveSin * 0.22;
      handL.rotation.x = -0.24 + waveCos * 0.08;

      if (waveTimer >= waveDuration) {
        isWaving = false;
      }
    } else if (shoulderL && elbowL && forearmL && handL) {
      shoulderL.rotation.z = THREE.MathUtils.lerp(shoulderL.rotation.z, -0.38 + breath * 0.015, 0.08);
      shoulderL.rotation.x = THREE.MathUtils.lerp(shoulderL.rotation.x, -0.14 + breath * 0.010, 0.08);
      upperArmL.rotation.y = THREE.MathUtils.lerp(upperArmL.rotation.y, -0.22, 0.08);
      elbowL.rotation.z = THREE.MathUtils.lerp(elbowL.rotation.z, 2.24 + breath * 0.03, 0.08);
      elbowL.rotation.y = THREE.MathUtils.lerp(elbowL.rotation.y, -0.32, 0.08);
      forearmL.rotation.z = THREE.MathUtils.lerp(forearmL.rotation.z, 0.16, 0.08);
      handL.rotation.z = THREE.MathUtils.lerp(handL.rotation.z, 0.16, 0.08);
      handL.rotation.x = THREE.MathUtils.lerp(handL.rotation.x, -0.24, 0.08);

      nextWaveTime -= delta;
      if (nextWaveTime <= 0) {
        triggerWave();
        nextWaveTime = 22.0;
      }
    }

    // 8. Right Arm Confident Waist Rest with Natural Breathing
    if (shoulderR && elbowR && forearmR) {
      shoulderR.rotation.z = THREE.MathUtils.lerp(shoulderR.rotation.z, 0.36 + breath * 0.012, 0.08);
      shoulderR.rotation.x = THREE.MathUtils.lerp(shoulderR.rotation.x, 0.08 + breath * 0.008, 0.08);
      elbowR.rotation.z = THREE.MathUtils.lerp(elbowR.rotation.z, -0.82 + breath * 0.015, 0.08);
      forearmR.rotation.z = THREE.MathUtils.lerp(forearmR.rotation.z, -0.18, 0.08);
    }

    renderer.render(scene, camera);
  }

  // --- 10. Initialization ---
  function init() {
    canvas = document.getElementById(CONFIG.canvasId);
    container = document.getElementById(CONFIG.containerId);
    stage = document.getElementById(CONFIG.stageId);
    aboutSection = document.getElementById(CONFIG.sectionId);

    if (!canvas || !container) {
      console.warn('Robot canvas elements not found.');
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 540;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    scene = new THREE.Scene();

    // Camera (Framed with full body visible without clipping)
    camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 50);
    camera.position.set(0, 0.08, 5.30);
    camera.lookAt(0, 0.04, 0);

    // Build Character
    initFaceScreen();
    const materials = createMaterials();
    robotMaterials = materials;
    const robot = buildRobot(materials);
    robot.scale.set(0.66, 0.66, 0.66);
    robot.position.set(0, -0.02, 0);
    scene.add(robot);

    setupLighting();
    setupEvents();

    clock.start();
    isSectionVisible = true;
    renderer.render(scene, camera);
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
