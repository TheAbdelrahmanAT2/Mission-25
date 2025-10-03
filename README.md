# Nasa

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sync-695c0cf0/v0-nasa)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/i8wuW3EhvyN)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/sync-695c0cf0/v0-nasa](https://vercel.com/sync-695c0cf0/v0-nasa)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/i8wuW3EhvyN](https://v0.app/chat/projects/i8wuW3EhvyN)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Interactive Cupola Globe

The Cupola mission page (`/cupola`) now features an interactive 3D Earth globe powered by `globe.gl` and `three.js`.
You can rotate the planet and click on highlighted city points to load orbital observation data and imagery.

### Adding / Editing Cities

City metadata is defined in `lib/cities.ts` via the `CityInfo` interface:

```
export interface CityInfo {
	id: string;
	name: string;
	country: string;
	lat: number;
	lng: number;
	population?: number;
	description: string;
	image?: string; // path under /public
	facts?: string[];
}
```

To add a new city:
1. Place any related night-view image in `public/` (optional).
2. Append a new object to the `cities` array with correct `lat` / `lng` (decimal degrees).
3. The globe auto-loads all entries on render; no further wiring required.

### Customization Notes

* Auto-rotation speed, point size, and colors can be adjusted in `components/earth-globe.tsx`.
* Globe imagery uses public demo textures; you can swap with higher resolution Blue Marble or custom night-lights textures.
* Clicking a city centers and zooms the camera smoothly (2s transition) and advances the mission step.

### Future Enhancements (Ideas)

* Dynamic ISS ground track overlay.
* Real-time day/night terminator shading.
* Layer toggles (population heatmap, light pollution index).
* On-demand NASA Earth imagery fetch for the selected coordinates & year.

## Cesium Globe Option

An alternative high-fidelity globe using `cesium` has been integrated alongside the existing `globe.gl` implementation.
You can switch between them on the `/cupola` page using the toggle buttons ("Three" vs. "Cesium").

### Installation

`cesium` was added via pnpm and configured with an environment variable:

```
CESIUM_BASE_URL=/cesium
```

`next.config.mjs` sets this at build time. A placeholder `public/cesium/` directory exists—if you need full widget styling
or offline assets (e.g. `Assets`, `ThirdParty`, `Widgets`), copy those folders into `public/cesium`.

### Component

`components/cesium-globe.tsx` dynamically imports Cesium client-side and:
* Initializes a `Viewer` without timeline/animation widgets to keep UI minimal.
* Adds each city as a point graphic (cyan) with pick support.
* Flies the camera smoothly to a city on click and triggers `onCitySelect`.

### Notes & Optimization

* For production, you may want to import Cesium CSS: `import "cesium/Build/Cesium/Widgets/widgets.css";` (currently omitted to reduce bundle size).
* To reduce initial payload you can lazy load Cesium only when the user toggles to the Cesium mode.
* Consider enabling terrain or imagery layers via Ion tokens (requires setting `CESIUM_ION_TOKEN`).
* Destroy logic runs on unmount to free WebGL resources and prevent memory leaks.

### Potential Next Steps

* Replace point graphics with billboard icons or labels.
* Show an info overlay on hover before click.
* Implement day/night shading using Cesium's lighting controls.
* Integrate live ISS TLE and visualize orbit path.

### Recent Enhancements (Advanced)

The Cesium integration now includes:

* Lazy Loading: Cesium bundle loads only when the Cesium mode is selected, reducing initial JS for the page.
* Ion Token Support: Provide `NEXT_PUBLIC_CESIUM_ION_TOKEN` in your environment to unlock high‑quality global imagery.
* Fallback Imagery: If no Ion token is present or Ion imagery fails, an OpenStreetMap tile provider is used automatically.
* Labels & Hover Highlight: City labels appear with outlined text; hovering a point changes its color (cyan → yellow) for visual feedback.
* Render Recovery: WebGL context loss or render pipeline errors trigger a non-blocking overlay with retry controls.
* Manual Remount: A “Remount” button forces full viewer destruction + reinitialization (useful for debugging GPU issues or swapping imagery).

### Environment

Add to `.env.local` (optional):

```
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_ion_token_here
```

### Performance Tips

| Goal | Tip |
|------|-----|
| Smaller First Load | Keep Cesium lazy loaded (already configured). |
| Faster Cesium Init | Remove labels or reduce entity count. |
| Reduce Memory | Destroy viewer when switching back to Three; consider conditional unmount. |
| Higher Visual Quality | Supply Ion token and enable terrain + lighting. |
| Debug Issues | Use Remount button, watch console for `renderError` logs. |

### Future Performance Ideas

* Split dynamic import to a custom trimmed engine build.
* Use clustering or level-of-detail for very large city datasets.
* Pre-warm a Web Worker for heavy geospatial calculations.

## High-Detail Three.js Earth Model (/earth)

The `/earth` route renders an enhanced Three.js Earth with:

* Day/Night shader blending (terminator)
* Atmosphere additive glow
* Semi-transparent rotating cloud layer
* Optional bump (height) & specular maps
* Separate night lights emission map
* Starfield background
* OrbitControls (drag, scroll to zoom)
* Real ISS orbit path & live position using TLE (via `satellite.js`)
* Country border overlays (simplified GeoJSON)
* Optional country label sprites

### Textures
Place high‑resolution textures in `public/textures` using these filenames (or adjust props):

| Purpose | Prop | Suggested Filename | Source Hint |
|---------|------|--------------------|-------------|
| Day (diffuse) | `dayTextureUrl` | `earth_day.jpg` | NASA Blue Marble or Visible Earth |
| Night lights | `nightTextureUrl` | `earth_night.jpg` | NASA Earth at Night |
| City lights (optional separate) | `lightsTextureUrl` | `earth_lights.jpg` | Same as night or a processed lights layer |
| Clouds (alpha) | `cloudsTextureUrl` | `earth_clouds.png` | NASA Visible Earth composite (make transparent) |
| Specular (oceans) | `specularTextureUrl` | `earth_specular.jpg` | Derived (bright oceans, dark land) |
| Bump / Elevation | `bumpTextureUrl` | `earth_bump.jpg` | ETOPO1 / Blue Marble bump map |

If a texture is missing, the shader falls back gracefully (e.g., no bump perturbation).

#### Automatic Fallback Textures

If the referenced local textures are missing or are placeholder text files, the component attempts to load small demo assets from a CDN (Blue Marble day, night, clouds). Console warnings will appear like:

```
[EarthModel] Using fallback remote day texture. Place a real one in /public/textures/earth_day.jpg
```

Replace the placeholder files with real imagery to remove these warnings. For bump/specular/lights maps a neutral/generated fallback is used if absent.

### ISS Orbit

Default TLE lines (props `issTleLine1` / `issTleLine2`) are embedded; to update, fetch the latest ISS TLE from CelesTrak and pass new lines to the component. The path line shows ~1.5 future orbits; the marker position updates each frame using real propagation.

### Usage Example

```
<EarthModel
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
/>
```

### Performance Tips

| Topic | Suggestion |
|-------|------------|
| Texture Size | Use 4K (or 8K if GPU allows); compress with mozjpeg/webp where possible. |
| GPU Load | Reduce sphere segments (128→64) if mobile performance is poor. |
| Clouds | Lower opacity or disable to save fill-rate. |
| Atmosphere | Can disable by removing its mesh if targeting very low-end devices. |
| ISS Path | Reduce sampled minutes or step size for fewer line vertices. |

### Next Possible Enhancements
* Real-time sun position for accurate terminator (current fixed light dir).
* Ground track projection onto globe and trailing path fade.
* Dynamic cloud map (e.g., periodically fetched from an API).
* GPU-based atmosphere scattering for more realism.
* Labeling major cities or lat/lon grid toggle.
* Higher resolution political borders & hover highlight.
* Sprite label occlusion / distance fading.


