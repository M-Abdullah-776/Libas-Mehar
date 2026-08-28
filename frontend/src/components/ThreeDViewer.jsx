import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const COLOR_MAP = {
  'Camel': '#C9A55A',
  'Midnight Navy': '#1C2A39',
  'Ivory White': '#F4ECE1',
  'Slate Grey': '#5A6268',
  'Silk Ivory': '#F2E8D7',
  'Rich Cream': '#F3E5AB',
  'Sand Beige': '#E5D3B3',
  'Olive Green': '#556B2F',
  'Rust Floral': '#A0522D',
  'Oceanic Teal': '#008080',
  'Crimson Ruby': '#9E1B32',
  'Blush Pink': '#ECA1A6',
  'Lilac Lavender': '#B57EDC',
  'Golden Mustard': '#FFDB58',
  'Sky Blue': '#87CEEB',
  'Mint Green': '#98FF98',
  'Pastel Yellow': '#FDFD96',
  'Arctic White': '#FFFFFF',
  'Royal Cream': '#FFFDD0',
  'Bleached White': '#F8F9FA'
};

export default function ThreeDViewer({ colorName, productName }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Get hex color from colorName or fallback
    const matchedColor = COLOR_MAP[colorName] || colorName || '#E5D3B3';
    
    // Determine fabric feel based on color/name
    const isSilk = productName?.toLowerCase().includes('silk') || productName?.toLowerCase().includes('boski');
    const isChiffon = productName?.toLowerCase().includes('chiffon');

    // 2. Setup Scene, Camera, Renderer
    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    // Warm background gradient to match Libas Mehar's premium aesthetic
    scene.background = new THREE.Color('#FAF8F5');
    scene.fog = new THREE.FogExp2('#FAF8F5', 0.05);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 12);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (err) {
      console.warn('WebGL is not supported or context lost. Showing placeholder.');
      setHasError(true);
      setLoading(false);
      return;
    }

    // Clear container and append new canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    setLoading(false);

    // 3. Create Custom Procedural Textures
    
    // A. Bump Map for fabric thread weave
    const createBumpCanvas = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 128, 128);

      // Draw high frequency weave grid
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 128; i += 4) {
        ctx.fillRect(i, 0, 1, 128);
        ctx.fillRect(0, i, 128, 1);
      }
      ctx.fillStyle = '#444444';
      for (let i = 2; i < 128; i += 4) {
        ctx.fillRect(i, 0, 1, 128);
        ctx.fillRect(0, i, 128, 1);
      }
      return canvas;
    };

    const bumpTexture = new THREE.CanvasTexture(createBumpCanvas());
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    // Tighter repeat for silk, larger for cotton/lawn
    const repeatScale = isSilk ? 45 : 30;
    bumpTexture.repeat.set(repeatScale, repeatScale);

    // B. Albedo color canvas with soft fabric fiber noise
    const createAlbedoCanvas = (colorHex) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 256, 256);

      // Add soft linen highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const w = Math.random() * 12 + 4;
        ctx.fillRect(x, y, w, 1);
      }
      // Add subtle dark weave shading
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const h = Math.random() * 12 + 4;
        ctx.fillRect(x, y, 1, h);
      }
      return canvas;
    };

    const albedoTexture = new THREE.CanvasTexture(createAlbedoCanvas(matchedColor));
    albedoTexture.wrapS = THREE.RepeatWrapping;
    albedoTexture.wrapT = THREE.RepeatWrapping;
    albedoTexture.repeat.set(5, 5);

    // 4. Create Geometries and Materials
    
    // A. Wavy Fabric Sheet Geometry
    const fabricWidth = 4.8;
    const fabricHeight = 6.2;
    const fabricGeom = new THREE.PlaneGeometry(fabricWidth, fabricHeight, 40, 40);
    
    // Apply sine waves to make folds
    const pos = fabricGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // Beautiful drapery shape with double-curved folds
      const foldX = Math.sin(x * 1.6) * 0.45;
      const foldY = Math.cos(y * 0.8) * 0.2;
      const taper = (y + fabricHeight/2) / fabricHeight; // Folds hang more naturally towards bottom
      
      pos.setZ(i, foldX * taper + foldY);
    }
    fabricGeom.computeVertexNormals();

    // B. Fabric Material setup
    const fabricMat = new THREE.MeshPhysicalMaterial({
      map: albedoTexture,
      bumpMap: bumpTexture,
      bumpScale: isSilk ? 0.008 : 0.018,
      side: THREE.DoubleSide,
      roughness: isSilk ? 0.25 : 0.8,
      metalness: isSilk ? 0.1 : 0.02,
      clearcoat: isSilk ? 0.35 : 0.0,
      clearcoatRoughness: 0.1,
      sheen: 1.0,
      sheenColor: new THREE.Color(isSilk ? '#ffffff' : matchedColor),
      sheenRoughness: isSilk ? 0.2 : 0.65,
      transparent: isChiffon,
      opacity: isChiffon ? 0.85 : 1.0,
    });

    const fabricMesh = new THREE.Mesh(fabricGeom, fabricMat);
    fabricMesh.position.set(0, -0.4, 0);
    fabricMesh.castShadow = true;
    fabricMesh.receiveShadow = true;
    
    // Group to pivot around hanging center
    const fabricGroup = new THREE.Group();
    fabricGroup.add(fabricMesh);
    scene.add(fabricGroup);

    // C. Hanging Brass Rod (Visual Anchor)
    const rodGeom = new THREE.CylinderGeometry(0.08, 0.08, 5.6, 16);
    const rodMat = new THREE.MeshStandardMaterial({
      color: '#D4AF37', // Gold/Brass
      roughness: 0.2,
      metalness: 0.8,
    });
    const rodMesh = new THREE.Mesh(rodGeom, rodMat);
    rodMesh.rotation.z = Math.PI / 2;
    rodMesh.position.set(0, fabricHeight / 2 - 0.3, 0.1);
    rodMesh.castShadow = true;
    scene.add(rodMesh);

    // 5. Lighting Setup (Studio standard)
    const ambientLight = new THREE.AmbientLight('#FAF8F5', 1.0);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 1.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight('#C9A55A', 0.8);
    fillLight.position.set(-6, 3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight('#ffffff', 1.5, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    setLoading(false);

    // 6. Interactive Drag & Zoom Controls
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let targetZoom = 12;

    const onPointerDown = (e) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      
      // Clamp X rotation to avoid folding mesh upside down
      targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.006;
      // Clamp camera distance
      targetZoom = Math.max(6, Math.min(16, targetZoom));
    };

    const el = containerRef.current;
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    // Handle touch gestures for mobile
    let touchStartDist = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = (touchStartDist - dist) * 0.02;
        targetZoom = Math.max(6, Math.min(16, targetZoom + factor));
        touchStartDist = dist;
      }
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });

    // 7. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow wave ripple to make cloth look alive
      const fabricPosition = fabricGeom.attributes.position;
      for (let i = 0; i < fabricPosition.count; i++) {
        const x = fabricPosition.getX(i);
        const y = fabricPosition.getY(i);
        
        const foldX = Math.sin(x * 1.6 + time * 0.8) * 0.45;
        const foldY = Math.cos(y * 0.8 + time * 0.5) * 0.2;
        const taper = (y + fabricHeight/2) / fabricHeight;
        
        fabricPosition.setZ(i, foldX * taper + foldY);
      }
      fabricPosition.needsUpdate = true;
      fabricGeom.computeVertexNormals();

      // Smooth rotation dampening (easing)
      fabricGroup.rotation.y += (targetRotationY - fabricGroup.rotation.y) * 0.1;
      fabricGroup.rotation.x += (targetRotationX - fabricGroup.rotation.x) * 0.1;

      // Gentle auto-rotation on idle
      if (!isDragging) {
        targetRotationY += 0.0018;
      }

      // Smooth zoom dampening
      camera.position.z += (targetZoom - camera.position.z) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (el) {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      // Dispose Three.js objects
      fabricGeom.dispose();
      fabricMat.dispose();
      rodGeom.dispose();
      rodMat.dispose();
      bumpTexture.dispose();
      albedoTexture.dispose();
      renderer.dispose();
    };
  }, [colorName, productName]);

  if (hasError) {
    const matchedColor = COLOR_MAP[colorName] || colorName || '#E5D3B3';
    return (
      <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center border border-stone-light relative">
        <div className="text-center p-6 space-y-4">
          <div className="w-24 h-32 bg-stone-light border border-stone mx-auto shadow-luxury relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
              backgroundSize: '8px 8px',
            }} />
            <div className="w-20 h-28 border border-stone-light/45" style={{ backgroundColor: matchedColor }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brass font-bold">{colorName || 'Default fabric'}</p>
            <p className="text-[10px] text-muted mt-1 uppercase tracking-widest">3D Preview Offline (WebGL Unavailable)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#FAF8F5] select-none touch-none">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone font-semibold">Generating 3D Texture...</p>
          </div>
        </div>
      )}
      
      {/* 3D Render Canvas container */}
      <div ref={containerRef} className="w-full h-full outline-none" />

      {/* User tips */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[9px] uppercase tracking-widest text-charcoal/40 font-semibold pointer-events-none select-none">
        <span>← Drag to Rotate →</span>
        <span>Scroll to Zoom</span>
      </div>
    </div>
  );
}
