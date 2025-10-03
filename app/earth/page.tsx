"use client";
import dynamic from 'next/dynamic';

const EarthModel = dynamic(() => import('../../components/earth-model').then(m => m.EarthModel), {
  ssr: false,
  loading: () => <div className="text-cyan-300 font-mono text-sm animate-pulse">Loading 3D Earth...</div>
});

export default function EarthPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-black via-slate-900 to-black text-white flex flex-col items-center justify-center font-space-grotesk overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>
      <div className="relative w-full max-w-5xl aspect-square">
        <EarthModel
          className="rounded-full"
          dayTextureUrl="/textures/earth_day.jpg"
          nightTextureUrl="/textures/earth_night.jpg"
          cloudsTextureUrl="/textures/earth_clouds.png"
          specularTextureUrl="/textures/earth_specular.jpg"
          bumpTextureUrl="/textures/earth_bump.jpg"
          lightsTextureUrl="/textures/earth_lights.jpg"
          showISS
          showTerminator
          issTleLine1="1 25544U 98067A   25073.50000000  .00016717  00000+0  30164-3 0  9993"
          issTleLine2="2 25544  51.6433 148.1234 0007287  43.1234 102.4567 15.50123456789012"
          showCountryBorders
          showCountryLabels
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-wider text-cyan-400/70 font-mono pointer-events-none">
          Place textures in /public/textures (day, night, clouds, specular)
        </div>
      </div>
      <div className="mt-6 text-center space-y-2 relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold font-orbitron tracking-tight">EARTH MODEL</h1>
        <p className="text-cyan-300 text-sm md:text-base opacity-80">Interactive Three.js Earth (clouds + atmosphere + stars)</p>
      </div>
    </main>
  );
}
