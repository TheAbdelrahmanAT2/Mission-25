"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface EarthModelProps {
  autoRotate?: boolean;
  rotationSpeed?: number; // radians per second
  className?: string;
  // Optional custom texture paths (place in public/textures or root)
  dayTextureUrl?: string;
  nightTextureUrl?: string;
  cloudsTextureUrl?: string;
  specularTextureUrl?: string;
  bumpTextureUrl?: string; // grayscale height/bump map
  lightsTextureUrl?: string; // city lights emission (if separate from night)
  showISS?: boolean; // show simple ISS orbit path & marker
  showTerminator?: boolean; // enable shader-based day/night mix
  issTleLine1?: string; // optional override TLE line 1
  issTleLine2?: string; // optional override TLE line 2
  showCountryBorders?: boolean;
  showCountryLabels?: boolean;
  showCities?: boolean; // new: render small yellow city markers
}

/*
  A lightweight Three.js Earth model inspired by open-source examples.
  Features:
  - Textured Earth sphere (color + bump/normal style with single texture fallback)
  - Semi-transparent cloud layer
  - Atmosphere glow via additive blending shader-based mesh
  - Starfield backdrop
  - Auto-rotation
  - Responsive resize & pixel ratio handling
  - Proper cleanup to avoid memory leaks

  NOTE: Texture asset paths assume you place earth textures in /public/textures.
  You can swap with higher-res NASA Blue Marble assets if desired.
*/

export const EarthModel: React.FC<EarthModelProps> = ({
  autoRotate = true,
  rotationSpeed = 0.12,
  className,
  dayTextureUrl = '/placeholder.jpg',
  nightTextureUrl,
  cloudsTextureUrl,
  specularTextureUrl,
  bumpTextureUrl,
  lightsTextureUrl,
  showISS = true,
  showTerminator = true,
  issTleLine1 = '1 25544U 98067A   25073.50000000  .00016717  00000+0  30164-3 0  9993',
  issTleLine2 = '2 25544  51.6433 148.1234 0007287  43.1234 102.4567 15.50123456789012',
  showCountryBorders = true,
  showCountryLabels = true,
  showCities = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();
  const controlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [countryData, setCountryData] = useState<any | null>(null);
  const [labelsReady, setLabelsReady] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const countryGroupRef = useRef<THREE.Group | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

  // Scene
  const scene = new THREE.Scene();
  scene.background = null;
  sceneRef.current = scene;

    // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 4000);
    camera.position.set(0, 0, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 1.6);
    directional.position.set(5, 3, 5);
    scene.add(directional);

    // Texture loader
    const loader = new THREE.TextureLoader();
  const texturePromises: Promise<THREE.Texture | null>[] = [];
    const loadTex = (url?: string) => url ? new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(url, tex => { tex.colorSpace = THREE.SRGBColorSpace; resolve(tex); }, undefined, () => resolve(null as any));
    }) : Promise.resolve(null);
    texturePromises.push(loadTex(dayTextureUrl));
    texturePromises.push(loadTex(nightTextureUrl));
    texturePromises.push(loadTex(cloudsTextureUrl));
  texturePromises.push(loadTex(specularTextureUrl));
  texturePromises.push(loadTex(bumpTextureUrl));
  texturePromises.push(loadTex(lightsTextureUrl));

    let earthMesh: THREE.Mesh | null = null;
    let cloudsMesh: THREE.Mesh | null = null;
    let atmosphereMesh: THREE.Mesh | null = null;
    let issMarker: THREE.Mesh | null = null;
    let issOrbit: THREE.Line | null = null;

    Promise.all(texturePromises).then(async ([dayTex, nightTex, cloudsTex, specTex, bumpTex, lightsTex]) => {
      // Fallback logic: if critical day/night textures missing (or invalid), fetch remote demo assets
      if (!dayTex) {
        try {
          dayTex = await new Promise<THREE.Texture>((res) => {
            loader.load('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; res(t); });
          });
          console.warn('[EarthModel] Using fallback remote day texture. Place a real one in /public/textures/earth_day.jpg');
        } catch {}
      }
      if (!nightTex) {
        try {
          nightTex = await new Promise<THREE.Texture>((res) => {
            loader.load('//unpkg.com/three-globe/example/img/earth-night.jpg', t => { t.colorSpace = THREE.SRGBColorSpace; res(t); });
          });
          console.warn('[EarthModel] Using fallback remote night texture. Place /public/textures/earth_night.jpg');
        } catch {}
      }
      // Secondary fallbacks
      if (!cloudsTex) {
        try {
          cloudsTex = await new Promise<THREE.Texture>((res) => {
            loader.load('//unpkg.com/three-globe/example/img/earth-clouds.png', t => { t.colorSpace = THREE.SRGBColorSpace; res(t); });
          });
          console.warn('[EarthModel] Using fallback remote clouds texture. Place /public/textures/earth_clouds.png');
        } catch {}
      }
      if (!specTex) {
        // Use day texture as weak stand-in for spec map
        specTex = dayTex || null;
        if (specTex) console.warn('[EarthModel] Using day texture as specular fallback. Provide /public/textures/earth_specular.jpg for improved highlights.');
      }
      if (!bumpTex) {
        // Generate a flat neutral bump via small white data texture
        const size = 4; const data = new Uint8Array(size * size * 3); data.fill(128);
        const dt = new THREE.DataTexture(data, size, size, THREE.RGBFormat); dt.needsUpdate = true; bumpTex = dt as any;
        console.warn('[EarthModel] Using generated neutral bump fallback. Provide /public/textures/earth_bump.jpg for surface relief.');
      }
      if (!lightsTex) {
        // fallback to night or day
        lightsTex = nightTex || dayTex || null;
        if (lightsTex) console.warn('[EarthModel] Using existing night/day texture as lights emission fallback. Provide /public/textures/earth_lights.jpg for sharper city lights.');
      }
      // Earth geometry
      const earthGeometry = new THREE.SphereGeometry(2, 128, 128);
      let earthMaterial: THREE.Material;
      if (showTerminator && dayTex && nightTex) {
        earthMaterial = new THREE.ShaderMaterial({
          uniforms: {
            dayMap: { value: dayTex },
            nightMap: { value: nightTex },
            lightDirection: { value: new THREE.Vector3(5,3,5).normalize() },
            specMap: { value: specTex },
            bumpMap: { value: bumpTex },
            lightsMap: { value: lightsTex || nightTex },
            bumpScale: { value: 0.15 },
          },
          vertexShader: `
            varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos; 
            void main(){
              vUv = uv; vNormal = normalize(normalMatrix * normal);
              vec4 worldPos = modelMatrix * vec4(position,1.0); vWorldPos = worldPos.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos; 
            uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D lightsMap; uniform vec3 lightDirection; uniform sampler2D specMap; uniform sampler2D bumpMap; uniform float bumpScale;
            
            // Simple bump perturbation using derivative of height map
            vec3 perturbNormal(vec2 uv, vec3 normal){
              float h1 = texture2D(bumpMap, uv + vec2( 0.001, 0.0)).r;
              float h2 = texture2D(bumpMap, uv + vec2(-0.001, 0.0)).r;
              float h3 = texture2D(bumpMap, uv + vec2(0.0,  0.001)).r;
              float h4 = texture2D(bumpMap, uv + vec2(0.0, -0.001)).r;
              vec3 grad = normalize(vec3(h2 - h1, h4 - h3, 0.002));
              vec3 n = normal + grad * bumpScale;
              return normalize(n);
            }
            void main(){
              vec3 n = normalize(vNormal);
              #ifdef GL_OES_standard_derivatives
              if (bumpMap != sampler2D(0)) {
                n = perturbNormal(vUv, n);
              }
              #endif
              float diffuse = max(dot(n, normalize(lightDirection)), 0.0);
              vec3 dayColor = texture2D(dayMap, vUv).rgb;
              vec3 nightColor = texture2D(nightMap, vUv).rgb * 1.2;
              vec3 lightsColor = texture2D(lightsMap, vUv).rgb * 2.2; // brighten emission
              float mixVal = smoothstep(-0.15, 0.25, diffuse);
              vec3 base = mix(nightColor + lightsColor * (1.0 - mixVal), dayColor, mixVal);
              float spec = 0.0;
              if (diffuse > 0.0) {
                vec3 viewDir = normalize(-vWorldPos);
                vec3 halfDir = normalize(viewDir + normalize(lightDirection));
                spec = pow(max(dot(n, halfDir), 0.0), 40.0);
              }
              // Subtle rim light at terminator for definition
              float rim = pow(1.0 - max(dot(n, normalize(lightDirection)),0.0), 3.0);
              vec3 color = base + spec*0.3 + rim*0.08;
              gl_FragColor = vec4(color, 1.0);
            }
          `,
        });
      } else {
        earthMaterial = new THREE.MeshPhongMaterial({ map: dayTex || undefined, specular: 0x222222, shininess: 15 });
      }
      earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
      scene.add(earthMesh);

      // Clouds
      if (cloudsTex) {
        const cloudsGeometry = new THREE.SphereGeometry(2.03, 96, 96);
        const cloudsMaterial = new THREE.MeshLambertMaterial({ map: cloudsTex, transparent: true, opacity: 0.4, depthWrite: false });
        cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        scene.add(cloudsMesh);
      }

      // Atmosphere
      const atmosphereGeometry = new THREE.SphereGeometry(2.2, 96, 96);
      const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vNormal; void main(){ float intensity = pow(0.7 - dot(vNormal, vec3(0.0,0.0,1.0)), 2.0); gl_FragColor = vec4(0.15,0.5,1.0,1.0)*intensity; }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
      });
      atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.add(atmosphereMesh);

      // Realistic ISS orbit path using satellite.js if enabled
      if (showISS) {
        (async () => {
          try {
            const sat = await import('satellite.js');
            const satrec = sat.twoline2satrec(issTleLine1, issTleLine2);
            const earthRadiusKm = 6371; // Earth's mean radius
            const sceneEarthRadius = 2; // scene units scale factor
            // Generate future orbit points over ~1.5 orbits (~90 * 1.5 = 135 mins) in 2-min steps
            const minutesAhead = 135;
            const stepMinutes = 2;
            const orbitVecs: THREE.Vector3[] = [];
            const now = new Date();
            for (let m=0; m<=minutesAhead; m+=stepMinutes) {
              const time = new Date(now.getTime() + m * 60000);
              const j = sat.jday(time.getUTCFullYear(), time.getUTCMonth()+1, time.getUTCDate(), time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
              const gmst = sat.gstime(j);
              const positionAndVelocity = sat.propagate(satrec, time.getUTCFullYear(), time.getUTCMonth()+1, time.getUTCDate(), time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
              const positionEci = positionAndVelocity.position;
              if (!positionEci) continue;
              const positionGd = sat.eciToGeodetic(positionEci, gmst);
              const lat = positionGd.latitude; const lon = positionGd.longitude; const height = positionGd.height; // rad, rad, km
              const r = (earthRadiusKm + height) / earthRadiusKm * sceneEarthRadius;
              const x = r * Math.cos(lat) * Math.cos(lon);
              const y = r * Math.sin(lat);
              const z = r * Math.cos(lat) * Math.sin(lon);
              orbitVecs.push(new THREE.Vector3(x, y, z));
            }
            if (orbitVecs.length > 1) {
              const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitVecs);
              const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.7 });
              issOrbit = new THREE.Line(orbitGeometry, orbitMaterial);
              scene.add(issOrbit);
            }
            const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            issMarker = new THREE.Mesh(markerGeometry, markerMaterial);
            scene.add(issMarker);

            // Update marker using real-time propagation each frame
            const updateMarker = () => {
              if (!issMarker) return;
              const now2 = new Date();
              const j2 = sat.jday(now2.getUTCFullYear(), now2.getUTCMonth()+1, now2.getUTCDate(), now2.getUTCHours(), now2.getUTCMinutes(), now2.getUTCSeconds());
              const gmst2 = sat.gstime(j2);
              const pv = sat.propagate(satrec, now2.getUTCFullYear(), now2.getUTCMonth()+1, now2.getUTCDate(), now2.getUTCFullYear() ? now2.getUTCHours() : now2.getUTCHours(), now2.getUTCMinutes(), now2.getUTCSeconds());
              const eci = pv.position; if (!eci) return;
              const gd = sat.eciToGeodetic(eci, gmst2);
              const lat2 = gd.latitude; const lon2 = gd.longitude; const h2 = gd.height;
              const r2 = (earthRadiusKm + h2) / earthRadiusKm * sceneEarthRadius;
              const x2 = r2 * Math.cos(lat2) * Math.cos(lon2);
              const y2 = r2 * Math.sin(lat2);
              const z2 = r2 * Math.cos(lat2) * Math.sin(lon2);
              issMarker.position.set(x2, y2, z2);
            };
            // Attach updater to renderer loop via a simple hook
            const prevRender = renderer.render.bind(renderer);
            renderer.render = (sc: any, cam: any) => { updateMarker(); prevRender(sc, cam); };
          } catch (err) {
            console.warn('ISS orbit (satellite.js) failed, falling back to none', err);
          }
        })();
      }

      setLoading(false);
    });

    // Load GeoJSON for borders if enabled
    if (showCountryBorders || showCountryLabels) {
      fetch('/data/world_countries.geojson')
        .then(r => r.json())
        .then(json => setCountryData(json))
        .catch(()=>{});
    }

    // Clouds layer
    // Starfield (points)
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 90 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x88bbff, size: 0.6, sizeAttenuation: true });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    const start = performance.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (performance.now() - start) / 1000;
      if (autoRotate && earthMesh) {
        earthMesh.rotation.y = elapsed * rotationSpeed;
        if (cloudsMesh) cloudsMesh.rotation.y = elapsed * rotationSpeed * 1.25;
      }
      // animate ISS marker along orbit
      if (issMarker && issOrbit) {
        const t = (elapsed * 0.03) % 1; // slow progression
        const posAttr = (issOrbit.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
        const count = posAttr.count;
        const idx = Math.floor(t * (count -1));
        const nx = posAttr.getX(idx); const ny = posAttr.getY(idx); const nz = posAttr.getZ(idx);
        issMarker.position.set(nx, ny, nz);
      }
      renderer.render(scene, camera);
    };
    animate();

    // OrbitControls (lazy load to reduce bundle) - only in browser
    (async () => {
      try {
        const mod = await import('three/examples/jsm/controls/OrbitControls.js');
        const Controls = (mod as any).OrbitControls;
        controlsRef.current = new Controls(camera, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.minDistance = 3;
        controlsRef.current.maxDistance = 12;
        controlsRef.current.enablePan = false;
        controlsRef.current.autoRotate = false; // we do manual rotate
      } catch {}
    })();

    return () => {
      cancelAnimationFrame(frameRef.current || 0);
      window.removeEventListener('resize', handleResize);
      // Clean up geometries & materials
      [earthMesh, cloudsMesh, atmosphereMesh, stars, issMarker, issOrbit, countryGroupRef.current].forEach(obj => {
        if (!obj) return;
        scene.remove(obj);
        const anyObj: any = obj as any;
        if (anyObj.geometry) anyObj.geometry.dispose();
        if (anyObj.material) {
          if (Array.isArray(anyObj.material)) anyObj.material.forEach((mm: any) => mm.dispose()); else anyObj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (controlsRef.current && controlsRef.current.dispose) controlsRef.current.dispose();
    };
  }, [autoRotate, rotationSpeed, dayTextureUrl, nightTextureUrl, cloudsTextureUrl, specularTextureUrl, showISS, showTerminator, showCountryBorders, showCountryLabels]);

  // City markers (enhanced visibility: larger sphere + additive glow sprite + gentle pulse)
  useEffect(() => {
    if (!showCities) return;
    if (!sceneRef.current) return;
    // dynamic import to avoid circular if cities large
    let disposed = false;
    (async () => {
      try {
        const mod = await import('@/lib/cities');
        if (disposed) return;
        const { cities } = mod as any;
        if (!Array.isArray(cities)) return;
        if (cityGroupRef.current) { sceneRef.current!.remove(cityGroupRef.current); cityGroupRef.current = null; }
        const group = new THREE.Group();
        const radius = 2.02; // just above surface
        const geometry = new THREE.SphereGeometry(0.075, 20, 20); // slightly larger
        const material = new THREE.MeshBasicMaterial({ color: 0xffe066 }); // brighter warm yellow

        // Precreate a small radial gradient canvas texture for glow
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = glowCanvas.height = 128;
        const gctx = glowCanvas.getContext('2d');
        if (gctx) {
          const grad = gctx.createRadialGradient(64,64,4, 64,64,64);
          grad.addColorStop(0, 'rgba(255,230,102,0.9)');
          grad.addColorStop(0.25, 'rgba(255,200,40,0.5)');
          grad.addColorStop(1, 'rgba(255,180,0,0)');
          gctx.fillStyle = grad;
          gctx.fillRect(0,0,128,128);
        }
        const glowTex = new THREE.CanvasTexture(glowCanvas); glowTex.colorSpace = THREE.SRGBColorSpace;
        const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

        cities.forEach((c: any) => {
          const lat = c.lat; const lon = c.lng;
          if (typeof lat !== 'number' || typeof lon !== 'number') return;
          const φ = THREE.MathUtils.degToRad(lat);
          const λ = THREE.MathUtils.degToRad(lon);
          const x = radius * Math.cos(φ) * Math.cos(λ);
          const y = radius * Math.sin(φ);
            const z = radius * Math.cos(φ) * Math.sin(λ);
          const markerGroup = new THREE.Group();
          // Core sphere
          const sphere = new THREE.Mesh(geometry, material.clone());
          sphere.position.set(0,0,0);
          markerGroup.add(sphere);
          // Glow sprite
          const sprite = new THREE.Sprite(glowMat.clone());
          sprite.scale.set(0.35,0.35,0.35);
          markerGroup.add(sprite);
          markerGroup.position.set(x,y,z);
          group.add(markerGroup);
        });
        cityGroupRef.current = group;
        sceneRef.current!.add(group);

        // Pulse animation (scale markers subtly)
        const start = performance.now();
        const animatePulse = () => {
          if (!cityGroupRef.current) return;
          const t = (performance.now() - start) / 1000;
          const scale = 1 + Math.sin(t * 2.2) * 0.15; // gentle pulse
          cityGroupRef.current.children.forEach(ch => { ch.scale.set(scale, scale, scale); });
          requestAnimationFrame(animatePulse);
        };
        animatePulse();
      } catch {}
    })();
    return () => {
      disposed = true;
      if (cityGroupRef.current) {
        cityGroupRef.current.children.forEach(ch => {
          const anyCh: any = ch;
          if (anyCh.geometry) anyCh.geometry.dispose();
        });
        if (cityGroupRef.current.parent) cityGroupRef.current.parent.remove(cityGroupRef.current);
        cityGroupRef.current = null;
      }
    };
  }, [showCities]);

  // Draw country borders & labels once geojson + scene ready
  useEffect(() => {
    if (!countryData || typeof window === 'undefined') return;
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
  if (countryGroupRef.current) { scene.remove(countryGroupRef.current); countryGroupRef.current = null; }
    const group = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00c8ff, linewidth: 1, transparent: true, opacity: 0.6 });
    const radius = 2.001; // just above surface
    const addPolygon = (coords: number[][]) => {
      const pts: THREE.Vector3[] = [];
      coords.forEach(([lon, lat]) => {
        const φ = THREE.MathUtils.degToRad(lat);
        const λ = THREE.MathUtils.degToRad(lon);
        const x = radius * Math.cos(φ) * Math.cos(λ);
        const y = radius * Math.sin(φ);
        const z = radius * Math.cos(φ) * Math.sin(λ);
        pts.push(new THREE.Vector3(x, y, z));
      });
      if (pts.length < 2) return;
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.LineLoop(geo, lineMaterial);
      group.add(line);
    };
    (countryData.features || []).forEach((f: any) => {
      const geom = f.geometry;
      if (!geom) return;
      if (geom.type === 'Polygon') {
        geom.coordinates.forEach((ring: number[][]) => addPolygon(ring));
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly: number[][][]) => poly.forEach(ring => addPolygon(ring)));
      }
    });
    countryGroupRef.current = group;
    scene.add(group);
    setLabelsReady(true);
    return () => {
      if (countryGroupRef.current) {
        scene.remove(countryGroupRef.current);
        countryGroupRef.current.children.forEach(ch => {
          const anyCh: any = ch;
          if (anyCh.geometry) anyCh.geometry.dispose();
        });
        countryGroupRef.current = null;
      }
    };
  }, [countryData, showCountryBorders, showCountryLabels]);

  // Country labels (very lightweight Canvas textures) once borders loaded
  useEffect(() => {
    if (!labelsReady || !showCountryLabels) return;
    if (!sceneRef.current || !countryData || !countryGroupRef.current) return;
    const scene = sceneRef.current;
    const group = countryGroupRef.current;
    const added: THREE.Sprite[] = [];
    const radius = 2.08;
    const features = (countryData.features || []).slice(0, 120); // safety cap
    features.forEach((f: any) => {
      const name = f.properties?.name || f.id || '—';
      // Compute rough centroid by averaging first polygon ring
      let pts: number[][] = [];
      if (f.geometry?.type === 'Polygon') pts = f.geometry.coordinates[0] || [];
      else if (f.geometry?.type === 'MultiPolygon') pts = f.geometry.coordinates[0]?.[0] || [];
      if (pts.length < 3) return;
      let sx=0, sy=0; pts.forEach(p=>{ sx += p[0]; sy += p[1]; });
      const lon = sx/pts.length; const lat = sy/pts.length;
      const φ = THREE.MathUtils.degToRad(lat); const λ = THREE.MathUtils.degToRad(lon);
      const x = radius * Math.cos(φ) * Math.cos(λ);
      const y = radius * Math.sin(φ);
      const z = radius * Math.cos(φ) * Math.sin(λ);
      // Canvas label
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const fontSize = 48; canvas.width = name.length * fontSize * 0.6; canvas.height = fontSize * 1.4;
      ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,canvas.width, canvas.height);
      ctx.font = `${fontSize}px Arial`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 8; ctx.lineJoin = 'round';
      ctx.strokeText(name, canvas.width/2, canvas.height/2);
      ctx.fillStyle = '#e6faff';
      ctx.fillText(name, canvas.width/2, canvas.height/2);
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      const scale = 0.4 + Math.min(1.0, 12 / Math.sqrt(name.length+2));
      sprite.scale.set(scale, scale * canvas.height / canvas.width, 1);
      sprite.position.set(x, y, z);
      group.add(sprite); added.push(sprite);
    });
    return () => { added.forEach(sp => { if (sp.material) (sp.material as any).dispose(); if (sp.material.map) (sp.material.map as any).dispose(); }); };
  }, [labelsReady, showCountryLabels, countryData]);

  return (
    <div ref={mountRef} className={"relative w-full h-full flex items-center justify-center " + (className || '')}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-cyan-300 font-mono text-xs tracking-widest bg-black/20">
          LOADING EARTH...
        </div>
      )}
    </div>
  );
};

export default EarthModel;
