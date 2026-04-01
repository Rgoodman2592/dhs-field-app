export interface Product {
  id: string;
  name: string;
  tier?: 'premium' | 'mid' | 'budget';
  cost: number;
  cat: string;
  labor: number;
  desc: string;
  desc36?: string;
  desc48?: string;
}

// ═══ EXIT DEVICES ═══
const exitDevices: Product[] = [
  { id: 'vondup99eo', name: 'Von Duprin 99EO', tier: 'premium', cost: 1084.90, cat: 'Exit Devices', labor: 1.5,
    desc: 'Grade 1, Heavy-Duty, Grooved Case, Rim Exit Device. Furnished in a {finish} Finish.',
    desc36: 'Grade 1, Heavy-Duty, Grooved Case, Rim Exit Device. 36". Furnished in a {finish} Finish.',
    desc48: 'Grade 1, Heavy-Duty, Grooved Case, Rim Exit Device. 48". Furnished in a {finish} Finish.' },
  { id: 'falcon25reo', name: 'Falcon 25-R-EO', tier: 'budget', cost: 485, cat: 'Exit Devices', labor: 1.5,
    desc: 'Grade 1, Rim Exit Device. Furnished in a {finish} Finish.',
    desc36: 'Grade 1, Rim Exit Device. 36". Furnished in a {finish} Finish.',
    desc48: 'Grade 1, Rim Exit Device. 48". Furnished in a {finish} Finish.' },
  { id: 'arrows1250', name: 'Arrow S1250', tier: 'budget', cost: 395, cat: 'Exit Devices', labor: 1.5,
    desc: 'Grade 1, Rim Exit Device. Furnished in a {finish} Finish.',
    desc36: 'Grade 1, Rim Exit Device. 36". Furnished in a {finish} Finish.',
    desc48: 'Grade 1, Rim Exit Device. 48". Furnished in a {finish} Finish.' },
];

const exitTrims: Product[] = [
  { id: 'vondup996l', name: 'Von Duprin 996L', tier: 'premium', cost: 451.73, cat: 'Exit Devices', labor: 0.5,
    desc: 'Grade 1, 06 Lever Trim For Rim/Vertical Rod Exit Devices. Furnished in a {finish} Finish.' },
];

// ═══ DOOR CLOSERS ═══
const closers: Product[] = [
  { id: 'lcn4040xp', name: 'LCN 4040XP', tier: 'premium', cost: 595.78, cat: 'Door Closers', labor: 1,
    desc: 'LCN 4040XP Grade 1 Surface Door Closer, Hold Open Arm, Push or Pull Side Mounting, 120 Degree Swing, Adjustable Size 1-6, Plastic Cover. Furnished in Painted Aluminum/689.' },
  { id: 'lcn4041', name: 'LCN 4041', tier: 'mid', cost: 431.78, cat: 'Door Closers', labor: 1,
    desc: 'LCN 4041 ADA Approved Heavy-Duty Surface Mounted Door Closer. Furnished in Painted Aluminum.' },
  { id: 'lcn1461', name: 'LCN 1461', tier: 'mid', cost: 285, cat: 'Door Closers', labor: 1,
    desc: 'LCN 1461 ADA Approved Medium-Duty Surface Mounted Door Closer. Furnished in Painted Aluminum.' },
  { id: 'arrowdcn516', name: 'Arrow DCN516', tier: 'budget', cost: 165, cat: 'Door Closers', labor: 1,
    desc: 'Heavy Duty Surface Door Closer, Hold Open Arm, Parallel Bracket, Full Plastic Cover, Adjustable Spring Size 1-6, Grade 1, Painted Aluminum/689.' },
  { id: 'arrowdcn314', name: 'Arrow DCN314', tier: 'budget', cost: 125, cat: 'Door Closers', labor: 1,
    desc: 'Surface Door Closer, Less Cover, Regular/Parallel Arm (Tri-Pack), Adjustable Spring 1-4, Grade 1, Painted Aluminum/689.' },
];

// ═══ COMMERCIAL LOCKS ═══
const locks: Product[] = [
  { id: 'schnd80pd', name: 'Schlage ND80PD', tier: 'premium', cost: 578.25, cat: 'Commercial Locks', labor: 0.75,
    desc: 'ADA Approved, Grade 1, Storeroom Function Cylindrical Lever, Schlage C Keyway, 2-3/4" Backset. Furnished in a {finish} Finish With 2 Keys.' },
  { id: 'schalx80pd', name: 'Schlage ALX80PD', tier: 'mid', cost: 285, cat: 'Commercial Locks', labor: 0.75,
    desc: 'ADA Approved, Grade 2, Storeroom Function Cylindrical Lever, Schlage C Keyway, 2-3/4" Backset. Furnished in a {finish} Finish With 2 Keys.' },
  { id: 'arrowrl02', name: 'Arrow RL02', tier: 'budget', cost: 145, cat: 'Commercial Locks', labor: 0.75,
    desc: 'Grade 2, Storeroom Function Cylindrical Lever, 2-3/4" Backset. Furnished in a {finish} Finish With 2 Keys.' },
];

// ═══ HINGES ═══
const hinges: Product[] = [
  { id: 'ives5bb1hw', name: 'Ives 5BB1HW (Heavy)', tier: 'premium', cost: 85.50, cat: 'Hinges', labor: 0.25,
    desc: '4.5" X 4.5", Non-Removable Pin, Heavy Weight, Ball Bearing Hinges. Furnished in {finish} as Box of Three.' },
  { id: 'ives5bb1', name: 'Ives 5BB1 (Standard)', tier: 'mid', cost: 45.50, cat: 'Hinges', labor: 0.25,
    desc: '4.5" X 4.5", Non-Removable Pin, Ball Bearing Hinges. Furnished in {finish} as Box of Three.' },
  { id: 'stanleyfbb179', name: 'Stanley FBB179', tier: 'budget', cost: 35, cat: 'Hinges', labor: 0.25,
    desc: '4.5" X 4.5", Non-Removable Pin, Ball Bearing Hinges. Furnished in {finish}.' },
];

// ═══ FRAMES ═══
const frames: Product[] = [
  { id: 'weld6070mas', name: 'Custom Welded 6070 Masonry', tier: 'premium', cost: 850, cat: 'Frames & Doors', labor: 3,
    desc: 'Custom-Fabricated, 16 Gauge, {size}, Welded, Hollow Metal Masonry Frame, {throat} Jamb Depth. Furnished in a Grey Prime Coat Finish. Prepped To Receive {preps}.' },
  { id: 'weld3070mas', name: 'Custom Welded 3070 Masonry', tier: 'premium', cost: 475, cat: 'Frames & Doors', labor: 2,
    desc: 'Custom-Fabricated, 16 Gauge, {size}, Welded, Hollow Metal Masonry Frame, {throat} Jamb Depth. Furnished in a Grey Prime Coat Finish. Prepped To Receive {preps}.' },
  { id: 'kd3070dw', name: '16ga KD Drywall 3070', tier: 'mid', cost: 225, cat: 'Frames & Doors', labor: 1.5,
    desc: '16 Gauge, {size}, Knockdown, Drywall, Hollow Metal Frame, {throat} Jamb Width. Furnished in a Grey Prime Coat Finish. Prepped To Receive {preps}.' },
  { id: 'kd6070dw', name: '16ga KD Drywall 6070', tier: 'mid', cost: 385, cat: 'Frames & Doors', labor: 2,
    desc: '16 Gauge, {size}, Knockdown, Drywall, Hollow Metal Frame, {throat} Jamb Width. Furnished in a Grey Prime Coat Finish. Prepped To Receive {preps}.' },
];

// ═══ DOORS ═══
const doors: Product[] = [
  { id: 'hm3070', name: '18ga Flush HM Door 3070', tier: 'mid', cost: 285, cat: 'Frames & Doors', labor: 0,
    desc: '3070, 1-3/4", Thick, 18 Gauge, Galvannealed, Flush, Polystyrene Core Hollow Metal Door - Includes: {lockprep} Lock Prep and 4.5" Ball Bearing Hinge Preps.' },
  { id: 'hm6070', name: '18ga Flush HM Door Pair', tier: 'mid', cost: 520, cat: 'Frames & Doors', labor: 0,
    desc: '6070, 1-3/4", Thick, 18 Gauge, Galvannealed, Flush, Polystyrene Core Pair of Hollow Metal Doors - Active Leaf Includes: {lockprep} Lock Prep. Inactive Leaf Includes: ASA Strike and Flush Bolt Preps. Both Doors Prepped With 4.5" Ball Bearing Hinge Locations.' },
];

// ═══ WEATHERSTRIP ═══
const weatherstrip: Product[] = [
  { id: 'brush36', name: 'Bottom Brush 36"', cost: 45, cat: 'Door Accessories', labor: 0.25,
    desc: '36" Bottom Brush Weatherstripping with Rain Diverter. Furnished in a Clear Anodized Aluminum Finish.' },
  { id: 'brush48', name: 'Bottom Brush 48"', cost: 55, cat: 'Door Accessories', labor: 0.25,
    desc: '48" Bottom Brush Weatherstripping with Rain Diverter. Furnished in a Clear Anodized Aluminum Finish.' },
  { id: 'smoke', name: 'Pemko S88BL20 Smoke Seal', cost: 28, cat: 'Door Accessories', labor: 0.15,
    desc: 'Pemko S88BL20 Adhesive Backed Gasketing. Furnished in a Black Vinyl Finish. *** AS REQUIRED PER NFPA 80 FIRE CODE***' },
  { id: 'perim3070', name: 'Perimeter Seal Kit 3070', cost: 65, cat: 'Door Accessories', labor: 0.25,
    desc: "3'0\" x 7'0\" Perimeter Weatherstripping Kit. Furnished in a Clear Anodized Aluminum Finish." },
  { id: 'perim6070', name: 'Perimeter Seal Kit 6070', cost: 85, cat: 'Door Accessories', labor: 0.3,
    desc: "6'0\" x 7'0\" Perimeter Weatherstripping Kit. Furnished in a Clear Anodized Aluminum Finish." },
];

// ═══ THRESHOLDS ═══
const thresholds: Product[] = [
  { id: 'thresh36', name: 'ADA Saddle 36"', cost: 55, cat: 'Door Accessories', labor: 0.25,
    desc: 'ADA Approved 1/2" x 5" x 36" Saddle Threshold. Furnished in a Milled Aluminum Finish.' },
  { id: 'thresh72', name: 'ADA Saddle 72"', cost: 95, cat: 'Door Accessories', labor: 0.3,
    desc: 'ADA Approved 1/2" x 5" x 72" Saddle Threshold. Furnished in a Milled Aluminum Finish.' },
];

// ═══ ELECTRIC STRIKES ═══
const strikes: Product[] = [
  { id: 'hes9600', name: 'HES 9600', cost: 361.68, cat: 'Electric Strikes', labor: 1.5,
    desc: 'HES 9600 12/24VDC Electric Strike. Furnished in a {finish} Finish.' },
  { id: 'hes9400', name: 'HES 9400', cost: 285, cat: 'Electric Strikes', labor: 1.5,
    desc: 'HES 9400 Slim-Line Surface Mounted Electric Strike. Furnished in a {finish} Finish.' },
];

// ═══ MAGLOCKS ═══
const maglocks: Product[] = [
  { id: 'sdc1511', name: 'SDC 1511', cost: 269.80, cat: 'Maglocks', labor: 2,
    desc: 'SDC 1511 1650lb Electromagnetic Lock, Single Door. Furnished in a {finish} Finish.' },
];

// ═══ CYLINDERS ═══
const cylinders: Product[] = [
  { id: 'mortcyl', name: 'Mortise Cylinder SCH C', cost: 35, cat: 'Cylinders', labor: 0.15,
    desc: '1-1/4" Mortise Cylinder, Schlage C Keyway. Furnished in a {finish} Finish. Includes 2 Keys.' },
  { id: 'rimcyl', name: 'Rim Cylinder SCH C', cost: 42, cat: 'Cylinders', labor: 0.15,
    desc: 'Rim Cylinder, Schlage C Keyway. Furnished in a {finish} Finish. Includes 2 Keys.' },
  { id: 'sfic', name: 'SFIC Core Q Keyway', cost: 28, cat: 'Cylinders', labor: 0.1,
    desc: 'Small Format Interchangeable Core Cylinder. Q Keyway. Furnished in a US26D Finish.' },
];

// ═══ MISC / ACCESSORIES ═══
const misc: Product[] = [
  { id: 'flushbolt', name: 'Auto Flush Bolt Set', cost: 125, cat: 'Door Accessories', labor: 0.5,
    desc: '12" Top and Bottom Automatic Flush Bolt Set. For Metal Doors. Furnished in US32D Finish.' },
  { id: 'astragal', name: 'Steel Astragal 84"', cost: 65, cat: 'Door Accessories', labor: 0.25,
    desc: 'Steel Astragal. Furnished in Steel Prime Coat - 84".' },
  { id: 'coord', name: 'Door Coordinator', cost: 85, cat: 'Door Accessories', labor: 0.25,
    desc: 'Door Coordinator, 7" Gravity Arm. Furnished in US26D.' },
  { id: 'miscmat', name: 'Misc Installation Materials', cost: 45, cat: 'Door Accessories', labor: 0,
    desc: 'Miscellaneous Installation Materials Required For Installation (Caulk, Anchors, Etc.)' },
  { id: 'silencer', name: 'Door Silencers', cost: 8, cat: 'Door Accessories', labor: 0.05,
    desc: 'Door Silencers. Furnished in Grey.' },
  { id: 'wallstop', name: 'Wall Stop', cost: 12, cat: 'Door Accessories', labor: 0.1,
    desc: 'Concave Wall Stop. Furnished in a {finish} Finish.' },
  { id: 'kick', name: 'Kick Plate 8x34', cost: 45, cat: 'Door Accessories', labor: 0.25,
    desc: 'K1050 8" x 34" CSK BEV Kickplate. Furnished in a US32D Stainless Steel Finish.' },
];

// ═══ PDK ACCESS CONTROL ═══
const pdk: Product[] = [
  { id: 'pdk-cn', name: 'PDK Cloud Node + 1-Door Controller', cost: 950, cat: 'Access Control', labor: 4,
    desc: 'ProDataKey Cloud Node (PDK-RED-RCNE) — Cloud Access Control Panel With Built-In Single IO Door Controller. Includes Initial Site Setup and Programming.' },
  { id: 'pdk-r1', name: 'PDK Red 1 Single-Door Controller', cost: 500, cat: 'Access Control', labor: 2,
    desc: 'ProDataKey Red 1 (PDK-RED-R1) Single-Door Controller. Wired to Cloud Node.' },
  { id: 'pdk-r2', name: 'PDK Red 2 Two-Door Controller', cost: 900, cat: 'Access Control', labor: 3,
    desc: 'ProDataKey Red 2 (PDK-R2) Two-Door Controller. Wired to Cloud Node.' },
  { id: 'pdk-r4', name: 'PDK Red 4 Four-Door Controller', cost: 710, cat: 'Access Control', labor: 4,
    desc: 'ProDataKey Red 4 (PDK-R4) Four-Door Controller. Wired to Cloud Node.' },
  { id: 'pdk-r8', name: 'PDK Red 8 Eight-Door Controller', cost: 1400, cat: 'Access Control', labor: 6,
    desc: 'ProDataKey Red 8 (PDK-R8) Eight-Door Controller With Ethernet Connectivity. Wired to Cloud Node.' },
  { id: 'pdk-reader-bt', name: 'PDK Touch IO Bluetooth Reader', cost: 353, cat: 'Access Control', labor: 1,
    desc: 'ProDataKey Touch IO (PDK-RDRBT) Bluetooth + 125KHz Proximity Card Reader. Mobile Credential Capable.' },
  { id: 'pdk-reader-hs', name: 'PDK Red High-Security Reader', cost: 250, cat: 'Access Control', labor: 1,
    desc: 'ProDataKey Red High-Security Mullion Reader (PDK-RED-RMP). DESFire EV2 + OSDP + 125KHz Prox + Mobile Access.' },
  { id: 'pdk-reader-std', name: 'PDK Standard Reader', cost: 134, cat: 'Access Control', labor: 0.75,
    desc: 'ProDataKey Standard Single-Gang Reader (PDK-RDRG). 125KHz Proximity.' },
  { id: 'pdk-rex', name: 'PDK Request-to-Exit Sensor', cost: 85, cat: 'Access Control', labor: 0.5,
    desc: 'High Performance Passive Infrared Request-to-Exit Sensor (REXHP). Ceiling or Wall Mount.' },
  { id: 'pdk-cards', name: 'PDK Credential Cards (25-pack)', cost: 84, cat: 'Access Control', labor: 0,
    desc: 'ProDataKey 125KHz Proximity Credential Cards. Pack of 25.' },
  { id: 'pdk-psu', name: 'Access Control Power Supply', cost: 120, cat: 'Access Control', labor: 1,
    desc: '12VDC / 24VDC Power Supply for Access Control Hardware. Includes Battery Backup.' },
  { id: 'pdk-poe', name: 'PDK PoE++ Module Kit', cost: 107, cat: 'Access Control', labor: 0.25,
    desc: 'ProDataKey PoE++ Module Kit (PDK-RMPOE). Plug-and-Play Power Over Ethernet.' },
];

// ═══ TURING CAMERAS ═══
const turing: Product[] = [
  { id: 'tur-bullet-8mp', name: 'Turing 8MP Active Deterrence Bullet', cost: 350, cat: 'Cameras', labor: 1.5,
    desc: 'Turing AI 8MP Active Deterrence Bullet Camera (TP-MBAD8M28). AI-Powered People/Vehicle Detection. IP67 Outdoor Rated.' },
  { id: 'tur-bullet-4mp', name: 'Turing 4MP IR Outdoor Bullet', cost: 224, cat: 'Cameras', labor: 1.5,
    desc: 'Turing AI 4MP Network IR Outdoor Bullet Camera (TI-NMB04AV3). Smart Motion Detection. IP67 Outdoor Rated.' },
  { id: 'tur-dome-8mp', name: 'Turing 8MP IR Outdoor Dome', cost: 280, cat: 'Cameras', labor: 1.5,
    desc: 'Turing AI 8MP Network IR Outdoor Dome Camera (TI-NFD08A28). AI Analytics. IK10 Vandal Resistant.' },
  { id: 'tur-twilight-8mp', name: 'Turing 8MP TwilightVision Bullet', cost: 300, cat: 'Cameras', labor: 1.5,
    desc: 'Turing AI 8MP TwilightVision IR VF Bullet Network Camera (TP-MMB8AV2). Advanced Low-Light Performance.' },
  { id: 'tur-ptz-5mp', name: 'Turing 5MP Mini PTZ w/ Active Deterrence', cost: 450, cat: 'Cameras', labor: 2,
    desc: 'Turing AI 5MP WDR TwilightVision Active Deterrence Mini PTZ Camera (TP-MPND5MAV2). Pan/Tilt/Zoom With Built-In Siren and Strobe.' },
  { id: 'tur-nvr-4', name: 'Turing 4-Channel NVR', cost: 500, cat: 'Cameras', labor: 2,
    desc: 'Turing AI 4-Channel, 4 PoE, Direct-to-Cloud NVR (TR-MRCP044T1). Includes 1TB HDD.' },
  { id: 'tur-nvr-8', name: 'Turing 8-Channel NVR', cost: 700, cat: 'Cameras', labor: 2,
    desc: 'Turing AI 8-Channel, 8 PoE, Direct-to-Cloud NVR (TR-MRCP084T2). Includes 2TB HDD.' },
  { id: 'tur-nvr-16', name: 'Turing 16-Channel NVR', cost: 1000, cat: 'Cameras', labor: 2.5,
    desc: 'Turing AI 16-Channel, 16 PoE, Direct-to-Cloud NVR (TR-MRCP166T2). Includes 4TB HDD.' },
  { id: 'tur-nvr-32', name: 'Turing 32-Channel Performance NVR', cost: 1400, cat: 'Cameras', labor: 3,
    desc: 'Turing AI 32-Channel Performance NVR With Turing Vision Bridge (TR-MR32R-B). Enterprise-Grade Recording.' },
  { id: 'tur-cablekit', name: 'Camera Cable Run Kit (per camera)', cost: 45, cat: 'Cameras', labor: 1,
    desc: 'Cat6 Cable Run, Conduit, J-Box, and Mounting Hardware for One Camera Location.' },
  { id: 'tur-poe-switch', name: 'PoE Network Switch', cost: 180, cat: 'Cameras', labor: 0.5,
    desc: 'Managed PoE+ Network Switch. 8-Port Gigabit with 120W PoE Budget.' },
];

// ═══ AUTO OPERATORS ═══
const operators: Product[] = [
  { id: 'lcn-4640', name: 'LCN 4640 Auto-Equalizer Low Energy Operator', cost: 5500, cat: 'Auto Operators', labor: 6,
    desc: 'LCN 4640 Electronic Auto-Equalizer Low Energy Door Operator. ADA Compliant. Pull Side Mounting. Includes Standard Arm.' },
  { id: 'norton-4540', name: 'Norton 4540 Electromechanical Operator', cost: 1716, cat: 'Auto Operators', labor: 5,
    desc: 'Norton 4540 Electromechanical Low Energy Door Operator. WiFi User Interface and Integrated RF Receiver. Ideal For Retrofit Applications.' },
  { id: 'norton-5531', name: 'Norton 5531 Push Side Low Energy Operator', cost: 1893, cat: 'Auto Operators', labor: 5,
    desc: 'Norton 5531-689 Push Side Electro-Hydraulic Low Energy Door Operator. Painted Aluminum Finish.' },
  { id: 'norton-5710', name: 'Norton 5710 Pull Side Powermatic Operator', cost: 2857, cat: 'Auto Operators', labor: 5,
    desc: 'Norton 5710 Powermatic Pull Side Low Energy Power Door Operator. Heavy Duty. ADA Compliant.' },
  { id: 'op-pushplate', name: 'ADA Push Plate Actuator', cost: 275, cat: 'Auto Operators', labor: 1,
    desc: 'ADA Compliant 4.5" Square Push Plate Door Actuator. Surface Mounted. Includes "Push to Open" Signage.' },
  { id: 'op-wireless', name: 'Wireless Push Button Transmitter', cost: 300, cat: 'Auto Operators', labor: 1,
    desc: 'Wireless Push Button Transmitter and Receiver Kit. Battery Operated. Range up to 100 Feet.' },
  { id: 'op-bollard', name: 'Bollard-Mount Push Button', cost: 500, cat: 'Auto Operators', labor: 2,
    desc: 'ADA Compliant Push Button Actuator. Post/Bollard Mounted. Includes Mounting Post.' },
];

// ═══ COMBINED DATABASE ═══
export const DB = {
  exitDevices,
  exitTrims,
  closers,
  locks,
  hinges,
  frames,
  doors,
  weatherstrip,
  thresholds,
  strikes,
  maglocks,
  cylinders,
  misc,
  pdk,
  turing,
  operators,
};

/** Flat array of all products for search */
export const ALL_PRODUCTS: Product[] = Object.values(DB).flat();

/** Find a product by ID */
export function findProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}

/** Find products by category and optional tier */
export function findByCategory(cat: string, tier?: Product['tier']): Product[] {
  return ALL_PRODUCTS.filter(p => p.cat === cat && (!tier || p.tier === tier));
}

/** Pick best product for a category based on tier preference */
export function pickProduct(cat: string, preferBudget: boolean, fireRated: boolean): Product | undefined {
  const products = ALL_PRODUCTS.filter(p => p.cat === cat);
  if (products.length === 0) return undefined;

  if (fireRated) {
    // Fire-rated always gets premium tier
    return products.find(p => p.tier === 'premium') ?? products[0];
  }

  if (preferBudget) {
    return products.find(p => p.tier === 'budget') ?? products.find(p => p.tier === 'mid') ?? products[0];
  }

  // Default: mid tier
  return products.find(p => p.tier === 'mid') ?? products.find(p => p.tier === 'premium') ?? products[0];
}
