export interface CityInfo {
  id: string;
  name: string;
  country: string;
  lat: number; // latitude
  lng: number; // longitude
  population?: number;
  description: string;
  image?: string; // path to local image (night view etc.)
  facts?: string[];
}

export const cities: CityInfo[] = [
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    lat: 30.0444,
    lng: 31.2357,
    population: 9500000,
    description: "Capital of Egypt along the Nile Delta. Visible from space due to concentrated light patterns following the Nile.",
    image: "/egypt-cupola.jpg",
    facts: [
      "One of the largest cities in Africa.",
      "The Nile River corridor is a prominent orbital night feature.",
    ],
  },
  {
    id: "new_york",
    name: "New York City",
    country: "United States",
    lat: 40.7128,
    lng: -74.006,
    population: 8400000,
    description: "Major global finance and culture hub. Distinctive grid and harbor easily spotted from the ISS.",
    image: "/usa-night.jpg",
    facts: [
      "Known as the city that never sleeps.",
      "Harbor outlines and bridges form bright light signatures.",
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    population: 13900000,
    description: "World's largest metropolitan economy. Dense, efficient lighting networks show extensive urban planning.",
    image: "/japan-night.jpg",
    facts: [
      "Tokyo Bay area creates a bright arc.",
      "Advanced transit and energy efficiency reduce some light pollution vs scale.",
    ],
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    population: 2160000,
    description: "Historic European capital. Radial street layout and Seine River reflect distinctive light geometry.",
    image: "/france-night.jpg",
    facts: [
      "Urban planning from Haussmann era creates visible radial forms.",
      "Light intensity gradients show heritage conservation zones.",
    ],
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    lat: 52.52,
    lng: 13.405,
    population: 3800000,
    description: "Cultural and political center with mixed green corridors. Industrial and residential zones form distinct clusters.",
    image: "/germany-night.jpg",
    facts: [
      "Former East/West patterns still subtly visible at night.",
      "Extensive parks reduce central brightness patches.",
    ],
  },
  {
    id: "rio",
    name: "Rio de Janeiro",
    country: "Brazil",
    lat: -22.9068,
    lng: -43.1729,
    population: 6748000,
    description: "Coastal Brazilian city with dramatic topography. Light distribution traces mountains and shoreline arcs.",
    image: "/brazil-night.jpg",
    facts: [
      "Favelas produce irregular luminous clusters on slopes.",
      "Iconic harbor curvature highlights Guanabara Bay.",
    ],
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    population: 5312000,
    description: "Harbor city with dispersed coastal light nodes. Urban sprawl outlines natural reserves and water bodies.",
    image: "/australia-night.jpg",
    facts: [
      "Harbor Bridge and Opera House vicinity form distinct brightness core.",
      "Suburban development radiates along transit corridors.",
    ],
  },
  {
    id: "delhi",
    name: "New Delhi",
    country: "India",
    lat: 28.6139,
    lng: 77.209,
    population: 16787941,
    description: "Capital region with expanding peri-urban ring. Night imagery reveals rapid infrastructure expansion.",
    image: "/india-night.jpg",
    facts: [
      "Ring roads produce layered luminous circles.",
      "Dense core merges with satellite town clusters.",
    ],
  },
  {
    id: "shanghai",
    name: "Shanghai",
    country: "China",
    lat: 31.2304,
    lng: 121.4737,
    population: 26300000,
    description: "Global megacity at Yangtze River delta. Intense port and financial district lighting outlines coastal logistics.",
    image: "/china-night.jpg",
    facts: [
      "Pudong district vertical illumination stands out.",
      "River bends provide contrast against dark waterways.",
    ],
  },
];

export type CityClickHandler = (city: CityInfo) => void;
