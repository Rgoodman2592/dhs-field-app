/** Rule-based issue classifier — matches issue descriptions to product categories.
 *  Returns confidence 0-1. AI fallback only when confidence < 0.6. */

interface ClassificationResult {
  category: string;
  confidence: number;
  matchedPattern: string;
}

const PATTERNS: Array<{ category: string; patterns: RegExp[]; weight: number }> = [
  // Exit devices
  { category: 'Exit Devices', weight: 1.0, patterns: [
    /exit\s*device/i, /panic\s*(bar|device|hardware)/i, /push\s*bar/i, /crash\s*bar/i,
    /rim\s*exit/i, /vertical\s*rod/i, /99eo/i, /98\-?[A-Z]/i, /33a/i, /25\-?r/i,
    /von\s*duprin/i, /falcon\s*2[45]/i, /s1250/i,
  ]},

  // Door closers
  { category: 'Door Closers', weight: 1.0, patterns: [
    /door\s*closer/i, /closer/i, /hydraulic\s*closer/i, /auto\s*closer/i,
    /lcn/i, /4040/i, /4041/i, /1461/i, /dcn\s*[35]/i,
    /not\s*closing/i, /won'?t\s*close/i, /slamming/i, /leaking\s*oil/i,
  ]},

  // Locks
  { category: 'Commercial Locks', weight: 1.0, patterns: [
    /lock\s*set/i, /cylindrical\s*lock/i, /mortise\s*lock/i, /lever\s*(handle|lock|set)/i,
    /schlage/i, /nd\s*\d/i, /alx/i, /rl\s*0[12]/i,
    /won'?t\s*lock/i, /not\s*latching/i, /latch\s*(broken|stuck|jammed)/i,
    /storeroom\s*function/i, /classroom\s*function/i, /passage/i, /privacy/i,
  ]},

  // Hinges
  { category: 'Hinges', weight: 0.9, patterns: [
    /hinge/i, /butt\s*hinge/i, /ball\s*bearing\s*hinge/i, /continuous\s*hinge/i,
    /pivot/i, /ives/i, /mckinney/i, /5bb1/i, /fbb179/i,
    /sagging/i, /squeaking/i, /worn\s*hinge/i, /pin\s*loose/i,
  ]},

  // Frames
  { category: 'Frames & Doors', weight: 0.9, patterns: [
    /frame/i, /hollow\s*metal\s*frame/i, /hm\s*frame/i, /door\s*frame/i,
    /welded\s*frame/i, /knock\s*down/i, /kd\s*frame/i,
    /frame\s*(rust|damage|bent|dented)/i, /throat/i, /jamb/i,
  ]},

  // Doors
  { category: 'Frames & Doors', weight: 0.85, patterns: [
    /hollow\s*metal\s*door/i, /hm\s*door/i, /steel\s*door/i, /flush\s*door/i,
    /door\s*(rust|damage|dented|warped|sagging)/i, /replace\s*door/i,
    /3070/i, /6070/i,
  ]},

  // Electric strikes
  { category: 'Electric Strikes', weight: 1.0, patterns: [
    /electric\s*strike/i, /e\s*strike/i, /hes/i, /9600/i, /9400/i,
  ]},

  // Maglocks
  { category: 'Maglocks', weight: 1.0, patterns: [
    /mag\s*lock/i, /magnetic\s*lock/i, /electro\s*magnetic/i, /sdc/i, /1511/i,
  ]},

  // Access control
  { category: 'Access Control', weight: 1.0, patterns: [
    /access\s*control/i, /card\s*reader/i, /prox\s*reader/i, /credential/i,
    /pdk/i, /prodatakey/i, /cloud\s*node/i, /controller/i,
    /rex/i, /request\s*to\s*exit/i, /door\s*contact/i,
  ]},

  // Cameras
  { category: 'Cameras', weight: 1.0, patterns: [
    /camera/i, /nvr/i, /surveillance/i, /cctv/i, /security\s*camera/i,
    /turing/i, /bullet\s*cam/i, /dome\s*cam/i, /ptz/i,
  ]},

  // Auto operators
  { category: 'Auto Operators', weight: 1.0, patterns: [
    /auto\s*(operator|opener)/i, /automatic\s*door/i, /power\s*door/i, /ada\s*operator/i,
    /push\s*plate/i, /actuator/i, /low\s*energy/i,
    /4640/i, /4540/i, /5531/i, /5710/i,
  ]},

  // Cylinders
  { category: 'Cylinders', weight: 0.8, patterns: [
    /cylinder/i, /re\s*key/i, /rekey/i, /core/i, /sfic/i, /keyway/i,
    /key\s*(broken|stuck|lost)/i, /change\s*key/i,
  ]},

  // Door accessories
  { category: 'Door Accessories', weight: 0.7, patterns: [
    /threshold/i, /weatherstrip/i, /sweep/i, /gasket/i, /smoke\s*seal/i,
    /kick\s*plate/i, /wall\s*stop/i, /door\s*stop/i, /silencer/i,
    /flush\s*bolt/i, /astragal/i, /coordinator/i,
  ]},

  // Glass / storefront
  { category: 'Glass/Storefront', weight: 0.9, patterns: [
    /glass/i, /storefront/i, /glazing/i, /tempered/i, /laminated/i,
    /broken\s*glass/i, /cracked\s*glass/i, /window/i,
  ]},
];

export function classifyIssue(description: string): ClassificationResult {
  let bestCategory = 'Door Accessories'; // fallback
  let bestConfidence = 0;
  let bestPattern = '';

  for (const { category, patterns, weight } of PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(description)) {
        const confidence = weight;
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestCategory = category;
          bestPattern = pattern.source;
        }
      }
    }
  }

  return {
    category: bestCategory,
    confidence: bestConfidence || 0.3, // minimum 0.3 if no match
    matchedPattern: bestPattern,
  };
}

/** Check if AI classification is needed */
export function needsAIClassification(result: ClassificationResult): boolean {
  return result.confidence < 0.6;
}
