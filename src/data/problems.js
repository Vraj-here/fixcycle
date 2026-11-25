/**
 * Predefined smartphone repair problem options and Pune, Maharashtra pickup area presets.
 * Estimated prices are illustrative prototype values until confirmed after shop inspection.
 */

export const REPAIR_PROBLEMS = [
  {
    id: 'broken_screen',
    label: 'Broken or damaged screen',
    shortLabel: 'Screen Repair',
    description: 'Cracked glass, dead touch areas, lines or flickering display',
    basePriceMin: 1600,
    basePriceMax: 3200,
    baseHours: 3,
  },
  {
    id: 'battery_drain',
    label: 'Battery draining quickly',
    shortLabel: 'Battery Replacement',
    description: 'Fast battery drop, overheating, swollen battery or poor backup',
    basePriceMin: 900,
    basePriceMax: 1600,
    baseHours: 2,
  },
  {
    id: 'not_charging',
    label: 'Phone not charging',
    shortLabel: 'Charging Issue',
    description: 'No charging icon, intermittent charging or very slow charge',
    basePriceMin: 700,
    basePriceMax: 1400,
    baseHours: 2.5,
  },
  {
    id: 'charging_port',
    label: 'Charging port damaged',
    shortLabel: 'Charging Port',
    description: 'Loose USB-C / Lightning port or bent connector pins',
    basePriceMin: 650,
    basePriceMax: 1300,
    baseHours: 2,
  },
  {
    id: 'camera_issue',
    label: 'Camera not working',
    shortLabel: 'Camera Repair',
    description: 'Blurry lens, black camera screen, cracked camera glass or focus failure',
    basePriceMin: 1100,
    basePriceMax: 2400,
    baseHours: 3.5,
  },
  {
    id: 'speaker_problem',
    label: 'Speaker problem',
    shortLabel: 'Speaker Repair',
    description: 'No sound, muffled audio or crackling loudspeaker / earpiece',
    basePriceMin: 600,
    basePriceMax: 1200,
    baseHours: 2,
  },
  {
    id: 'mic_problem',
    label: 'Microphone problem',
    shortLabel: 'Microphone Repair',
    description: 'Callers cannot hear you or voice recordings are silent/distorted',
    basePriceMin: 550,
    basePriceMax: 1100,
    baseHours: 2,
  },
  {
    id: 'power_button',
    label: 'Power button problem',
    shortLabel: 'Power Button',
    description: 'Stuck, unresponsive or broken power / volume button strip',
    basePriceMin: 500,
    basePriceMax: 1000,
    baseHours: 2,
  },
  {
    id: 'water_damage',
    label: 'Water damage',
    shortLabel: 'Water Damage',
    description: 'Liquid spill or submersion requiring internal cleaning and inspection',
    basePriceMin: 1200,
    basePriceMax: 2800,
    baseHours: 6,
  },
  {
    id: 'software_issue',
    label: 'Software issue',
    shortLabel: 'Software Fix',
    description: 'Boot loop, OS crash, freezing apps or update failure',
    basePriceMin: 400,
    basePriceMax: 900,
    baseHours: 1.5,
  },
  {
    id: 'not_turning_on',
    label: 'Phone not turning on',
    shortLabel: 'No Power Diagnostic',
    description: 'Completely dead device requiring board/power IC diagnosis',
    basePriceMin: 1000,
    basePriceMax: 2600,
    baseHours: 5,
  },
  {
    id: 'other_issue',
    label: 'Other issue',
    shortLabel: 'General Diagnostic',
    description: 'Network, sensors, back glass or any other custom issue',
    basePriceMin: 600,
    basePriceMax: 1500,
    baseHours: 3,
  },
];

export const PICKUP_TIME_SLOTS = [
  '10:00 AM – 11:30 AM',
  '11:30 AM – 01:00 PM',
  '02:00 PM – 03:30 PM',
  '03:30 PM – 05:00 PM',
  '05:00 PM – 06:30 PM',
  '06:30 PM – 08:00 PM',
];

/**
 * Default map center: Pune, Maharashtra, India
 */
export const PUNE_CENTER = [18.5204, 73.8567];

/**
 * Pune, Maharashtra pickup neighborhoods for interactive map discovery & simulation.
 */
export const DEMO_LOCATIONS = [
  {
    id: 'fc_road',
    label: 'FC Road / Shivajinagar, Pune, Maharashtra',
    shortArea: 'FC Road / Shivajinagar',
    coords: [18.5236, 73.8412],
  },
  {
    id: 'kothrud',
    label: 'Kothrud, Karve Road Area, Pune, Maharashtra',
    shortArea: 'Kothrud',
    coords: [18.5074, 73.8077],
  },
  {
    id: 'koregaon_park',
    label: 'Koregaon Park / Kalyani Nagar, Pune, Maharashtra',
    shortArea: 'Koregaon Park',
    coords: [18.5362, 73.8939],
  },
  {
    id: 'baner',
    label: 'Baner / Balewadi High Street, Pune, Maharashtra',
    shortArea: 'Baner',
    coords: [18.5590, 73.7868],
  },
  {
    id: 'viman_nagar',
    label: 'Viman Nagar, Pune, Maharashtra',
    shortArea: 'Viman Nagar',
    coords: [18.5679, 73.9143],
  },
  {
    id: 'hinjewadi',
    label: 'Hinjewadi Phase 1, Pune, Maharashtra',
    shortArea: 'Hinjewadi',
    coords: [18.5913, 73.7389],
  },
  {
    id: 'hadapsar',
    label: 'Hadapsar / Magarpatta, Pune, Maharashtra',
    shortArea: 'Hadapsar',
    coords: [18.5089, 73.9259],
  },
  {
    id: 'wakad',
    label: 'Wakad / PCMC, Pune, Maharashtra',
    shortArea: 'Wakad',
    coords: [18.5987, 73.7610],
  },
];

export function getProblemById(problemId) {
  return REPAIR_PROBLEMS.find((p) => p.id === problemId) || null;
}
