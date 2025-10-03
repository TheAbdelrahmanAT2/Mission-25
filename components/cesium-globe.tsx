"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { CityInfo, CityClickHandler } from '@/lib/cities';
import { cities } from '@/lib/cities';

// Lightweight Cesium integration that avoids SSR. Requires cesium dependency.
// Assumes CESIUM_BASE_URL env points to /cesium (we could optionally copy Cesium assets there in a build step).

interface CesiumGlobeProps {
  onCitySelect?: CityClickHandler;
  height?: number;
  width?: number;
  remountSignal?: number; // change this to force a full re-init
}

export const CesiumGlobe: React.FC<CesiumGlobeProps> = ({ onCitySelect, height = 520, width = 520, remountSignal }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === 'undefined') return;
      if (viewerRef.current) return; // avoid duplicate unless remountSignal triggered cleanup earlier
      try {
        const Cesium = await import('cesium');
        const { Viewer, Cartesian3, Color, ScreenSpaceEventType, ScreenSpaceEventHandler, UrlTemplateImageryProvider, Ion, createWorldImagery } = Cesium as any;

        const ionToken = (process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '').trim();
        if (ionToken) {
          try { Ion.defaultAccessToken = ionToken; } catch {}
        }

        // Start with an OSM imagery provider to reduce reliance on Ion subtleties
        let imageryProvider: any;
        if (ionToken && createWorldImagery) {
          try {
            imageryProvider = createWorldImagery({ style: 'AERIAL_WITH_LABELS' });
          } catch (e) {
            console.warn('Ion imagery failed, falling back to OSM', e);
          }
        }
        if (!imageryProvider) {
          imageryProvider = new UrlTemplateImageryProvider({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            credit: '© OpenStreetMap contributors',
            maximumLevel: 18,
          });
        }

        const viewer = new Viewer(containerRef.current, {
          animation: false,
            timeline: false,
            fullscreenButton: false,
            geocoder: false,
            baseLayerPicker: false,
            homeButton: false,
            infoBox: false,
            navigationHelpButton: false,
            sceneModePicker: false,
            selectionIndicator: false,
            creditContainer: document.createElement('div'),
            imageryProvider,
            requestRenderMode: true,
            maximumRenderTimeChange: 60,
        });
        viewerRef.current = viewer;

        // Defensive: disable depth test against terrain to reduce some GPU driver pitfalls
        try { viewer.scene.globe.depthTestAgainstTerrain = false; } catch {}

        // Track if recovery attempted
        let recoveryTried = false;
        const attemptRecovery = () => {
          if (recoveryTried) return; recoveryTried = true;
          try {
            // Simple strategy: request a render and if still failing, show overlay
            viewer.scene.requestRender();
          } catch (e) {
            console.warn('Recovery render failed', e);
          }
          if (!viewer || viewer.isDestroyed?.()) return;
          setTimeout(() => {
            try { viewer.scene.requestRender(); } catch {}
          }, 200);
        };

        // Global render error handler with re-initialization fallback
        viewer.scene.renderError.addEventListener((err: any) => {
          console.error('Cesium scene renderError', err);
          attemptRecovery();
          // If after recovery we still get errors, surface UI
          setInitError('Render pipeline failure');
        });

        // Handle WebGL context lost (some drivers emit renderError before this)
        const canvas: any = viewer.scene.canvas;
        if (canvas) {
          canvas.addEventListener('webglcontextlost', (e: any) => {
            console.warn('WebGL context lost, preventing default and marking error');
            try { e.preventDefault(); } catch {}
            setInitError('WebGL context lost');
          }, false);
          canvas.addEventListener('webglcontextrestored', () => {
            console.info('WebGL context restored, requesting render');
            try { viewer.scene.requestRender(); } catch {}
          }, false);
        }

        // If WebGL crashes, attempt one soft re-init (skip if already cancelled)
        let reinitAttempted = false;
        const softReinit = async () => {
          if (reinitAttempted || cancelled) return;
          reinitAttempted = true;
          try {
            viewer.render();
          } catch (e) {
            console.warn('Soft re-render failed after error', e);
          }
        };

        // Add city point entities
        cities.forEach((city: CityInfo) => {
          try {
            viewer.entities.add({
              position: Cartesian3.fromDegrees(city.lng, city.lat),
              name: city.name,
              description: city.description,
              point: {
                pixelSize: 9,
                color: Color.CYAN.withAlpha(0.85),
                outlineColor: Color.WHITE,
                outlineWidth: 1.2,
              },
              label: {
                text: city.name,
                font: '14px sans-serif',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -18),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                showBackground: true,
                backgroundColor: Color.fromBytes(5, 33, 52, 180),
                scale: 0.9,
              },
              properties: { __cityData: city },
            });
          } catch (e) {
            console.warn('Failed adding city entity', city.name, e);
          }
        });

        // Camera initial flight
        try {
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(10, 20, 20000000),
            duration: 2.2,
          });
        } catch {}

        const eHandler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        handlerRef.current = eHandler;
        let lastHoverId: any = null;
        // Hover (MOUSE_MOVE) highlight
        const HIGHLIGHT_COLOR = Color.YELLOW.withAlpha(0.95);
        const NORMAL_COLOR = Color.CYAN.withAlpha(0.85);
        eHandler.setInputAction((movement: any) => {
          let picked: any = null;
          try { picked = viewer.scene.pick(movement.endPosition); } catch {}
          if (picked && picked.id && picked.id.properties?.__cityData) {
            if (lastHoverId && lastHoverId !== picked.id) {
              try { lastHoverId.point.color = NORMAL_COLOR; } catch {}
            }
            lastHoverId = picked.id;
            try { picked.id.point.color = HIGHLIGHT_COLOR; } catch {}
          } else if (lastHoverId) {
            try { lastHoverId.point.color = NORMAL_COLOR; } catch {}
            lastHoverId = null;
          }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        // Click
        eHandler.setInputAction((movement: any) => {
          let picked: any = null;
          try { picked = viewer.scene.pick(movement.position); } catch (e) {
            console.warn('Pick failed', e);
            return;
          }
          if (picked && picked.id && picked.id.properties && picked.id.properties.__cityData) {
            const c = picked.id.properties.__cityData as CityInfo;
            onCitySelect?.(c);
            try {
              viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(c.lng, c.lat, 1500000),
                duration: 1.4,
              });
            } catch (e) { console.warn('Camera flyTo failed', e); }
          }
  }, ScreenSpaceEventType.LEFT_CLICK);

        if (cancelled) viewer.destroy();
      } catch (err: any) {
        console.error('Cesium initialization failed', err);
        setInitError(err?.message || 'Initialization failed');
      }
    })();
    return () => {
      cancelled = true;
      try {
        handlerRef.current?.destroy?.();
      } catch {}
      handlerRef.current = null;
      try {
        viewerRef.current?.destroy?.();
      } catch {}
      viewerRef.current = null;
    };
  }, [onCitySelect, remountSignal]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative" style={{ height, width }}>
        <div
          ref={containerRef}
          style={{ height: '100%', width: '100%' }}
          className="rounded-full overflow-hidden shadow-lg border border-cyan-700/40 bg-black"
        />
        {initError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 text-red-300 text-xs font-mono p-5 text-center">
            <div className="font-orbitron text-sm text-red-400 tracking-wide">CESIUM RENDER ISSUE</div>
            <div className="max-w-[220px] break-words">{initError}</div>
            <div className="text-[10px] text-red-400/70">A fallback OSM imagery layer was used.</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setInitError(null);
                  viewerRef.current = null; // allow parent key remount strategy if added later
                }}
                className="px-3 py-1 rounded-md bg-red-600/80 hover:bg-red-500 text-white text-[11px]"
              >Dismiss</button>
              <button
                onClick={() => {
                  setInitError(null);
                  try { viewerRef.current?.scene?.requestRender(); } catch {}
                }}
                className="px-3 py-1 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px]"
              >Retry Render</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CesiumGlobe;
