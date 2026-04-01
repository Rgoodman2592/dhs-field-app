/**
 * DHS Writing Style Templates
 * Ported from STYLE_GUIDE.md — 25K+ real estimate line items analyzed
 *
 * Rules:
 * - Title Case for all descriptions
 * - "Furnished in a [Finish] Finish." pattern
 * - NO manufacturer names in final output
 * - Fire code notes: "*** AS REQUIRED PER NFPA 80 FIRE CODE***"
 * - ADA callouts: "ADA Approved..." prefix
 * - Architectural sizes: 3'0" x 7'0" (not 36" x 84")
 */

export const REMOVAL_TEMPLATE =
  'Removal and Disposal of Existing Defective {item}. Existing {salvageable} Will Be Salvaged For {reuse}.';

export const FI_HEADER = 'Furnish and Install Materials and Labor as Follows:';
export const FO_HEADER = 'Furnish Materials as Follows:';

export const ALIGN_ADJUST =
  'Align and Adjust Newly Installed Doors and Hardware For Proper Operation.';

export const LABOR_LINE = (rate: number) =>
  `Installation Labor Included. 2-Man Service Truck at $${rate}/Per-Man, Per Hour.`;

export const FIRE_CODE_NOTE = '*** AS REQUIRED PER NFPA 80 FIRE CODE***';

/** Material line templates by category */
export const MATERIAL_TEMPLATES: Record<string, string> = {
  'Exit Devices':
    '{grade} {type} Exit Device{size}. Furnished in a {finish} Finish.',
  'Door Closers':
    'ADA Approved {duty} Surface Mounted Door Closer. Furnished in Painted Aluminum.',
  'Commercial Locks':
    'ADA Approved, {grade}, {function} Function Cylindrical Lever, {keyway} Keyway, 2-3/4" Backset. Furnished in a {finish} Finish With 2 Keys.',
  'Hinges':
    '4.5" X 4.5", Non-Removable Pin, {weight} Ball Bearing Hinges. Furnished in {finish} as Box of Three.',
  'Frames & Doors':
    '{gauge} Gauge, {size}, {construction}, Hollow Metal {type}, {throat} Jamb Depth. Furnished in a Grey Prime Coat Finish.',
  'Door Accessories':
    '{description}. Furnished in a {finish} Finish.',
  'Electric Strikes':
    '{voltage} Electric Strike. Furnished in a {finish} Finish.',
  'Maglocks':
    '{capacity} Electromagnetic Lock, Single Door. Furnished in a {finish} Finish.',
  'Cylinders':
    '{type} Cylinder, {keyway} Keyway. Furnished in a {finish} Finish. Includes 2 Keys.',
  'Access Control':
    '{description}',
  'Cameras':
    '{description}',
  'Auto Operators':
    '{description}',
};
