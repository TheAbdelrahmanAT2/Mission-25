"use client";

import React, { useEffect, useRef, useState } from "react";
import type { CityInfo, CityClickHandler } from "@/lib/cities";
import { cities } from "@/lib/cities";

// We'll dynamically import the globe.gl factory at runtime inside useEffect

export interface EarthGlobeProps {
  onCitySelect?: CityClickHandler;
  height?: number; // explicit height (px). If omitted and fill=true, uses 100% of parent.
  width?: number;  // explicit width (px). If omitted, 100% of parent.
  fill?: boolean;  // when true, ignore height/width numbers and stretch to parent.
}

interface GlobeCityDatum {
  lat: number;
  lng: number;
  city: CityInfo;
  size?: number;
  color?: string;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({ onCitySelect, height = 600, width, fill = false }) => {
  // Holds the globe.gl instance
  const globeRef = useRef<any>(null);
  // Outer wrapper (sized by parent styles)
  const containerRef = useRef<HTMLDivElement>(null);
  // Dedicated inner mount target for globe.gl to reduce React reconciliation collisions
  const mountRef = useRef<HTMLDivElement>(null);
  // Track the canvas element created by globe.gl so we can safely verify it before any cleanup (we avoid manual removal)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [points, setPoints] = useState<GlobeCityDatum[]>([]);

  useEffect(() => {
    setPoints(
      cities.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        city: c,
        // size retained for potential future scaling but we now render flat tiny dots
        size: 0.15,
        color: "#ffd54a", // warm yellow
      }))
    );
  }, []);

  useEffect(() => {
    if (!points.length) return;
    let cancelled = false;
    (async () => {
      if (globeRef.current || typeof window === "undefined") return;
      try {
        const { default: globeFactory } = await import("globe.gl");
        if (cancelled) return;
        const mountEl = mountRef.current;
        if (!mountEl) return;
        // Guard against duplicate init (Fast Refresh) using a data flag
        if (mountEl.dataset.initialized === "true") return;
        mountEl.dataset.initialized = "true";

        // Defer to next animation frame to ensure element is fully in DOM
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (cancelled) return;
        const instance = globeFactory()(mountEl);
        globeRef.current = instance;
        // Attempt to capture the created canvas (first canvas child)
        canvasRef.current = mountEl.querySelector("canvas");
        instance
          .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
          .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
          .backgroundColor("rgba(0,0,0,0)")
          // Set an initial camera with slightly more altitude to avoid right edge clipping
          .pointOfView({ lat: 0, lng: 0, altitude: 3.35 }, 0)
          .pointsData(points)
          // Dot style: very small flat dots close to surface
          .pointAltitude(() => 0.012)
          .pointColor("color")
          .pointRadius(0.42)
          .pointResolution(16)
          .pointLabel((d: any) => d.city?.name || '')
          .pointsTransitionDuration(0);
        // Disable previous hover enlargement for pure dot look
        // Helper: recenter on resize or container mount to ensure globe is visually centered
        const fitGlobe = () => {
          try { instance.pointOfView({ lat: 5, lng: 5, altitude: 3.0 }); } catch {}
        };
        // Slight delayed recenter for layout shifts
        setTimeout(fitGlobe, 1200);
        // Smoothly ease to a slightly closer attractive view after a short delay
        setTimeout(() => {
          if (!cancelled && globeRef.current === instance) {
            try { instance.pointOfView({ lat: 12, lng: 12, altitude: 2.75 }, 1600); } catch {}
          }
        }, 600);
        instance.onPointClick((d: GlobeCityDatum) => {
          if (onCitySelect) onCitySelect(d.city);
          instance.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.4 }, 2000);
        });
        const controls = instance.controls?.();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.6;
        }
        setIsReady(true);
      } catch (e) {
        if (!cancelled) console.error("Failed to initialize globe", e);
      }
    })();
    return () => {
      cancelled = true;
      // Only dispose controls; do NOT manually remove DOM nodes to avoid NotFoundError with Fast Refresh.
      const instance = globeRef.current;
      try {
        const controls = instance?.controls?.();
        if (controls && typeof controls.dispose === "function") controls.dispose();
      } catch {}
      globeRef.current = null;
    };
  }, [points, onCitySelect]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!globeRef.current || !containerRef.current) return;
      // globe.gl automatically fits canvas to container size
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const style: React.CSSProperties = fill
    ? { height: '100%', width: '100%' }
    : { height, width: width ? width : '100%' };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none flex items-center justify-center"
      style={style}
    >
      <div ref={mountRef} className="absolute inset-0 flex items-center justify-center" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center text-cyan-300 font-orbitron text-sm tracking-wider">
          INITIALIZING GLOBE...
        </div>
      )}
    </div>
  );
};

export default EarthGlobe;
