import catalogData from '../data/brandCatalog.json';

interface Brand {
  id: string;
  name: string;
  categories: string[];
}

interface ParentGroup {
  id: string;
  name: string;
  color: string;
  brands: Brand[];
}

const catalog = catalogData as { parentGroups: ParentGroup[] };

/** All hardware component types from the catalog */
export const HARDWARE_TYPES = [
  { id: 'door_closer', label: 'Door Closer' },
  { id: 'exit_device', label: 'Exit Device' },
  { id: 'cylindrical_lock', label: 'Cylindrical Lock' },
  { id: 'mortise_lock', label: 'Mortise Lock' },
  { id: 'deadbolt', label: 'Deadbolt' },
  { id: 'hinge', label: 'Hinge' },
  { id: 'continuous_hinge', label: 'Continuous Hinge' },
  { id: 'electric_strike', label: 'Electric Strike' },
  { id: 'maglock', label: 'Maglock' },
  { id: 'card_reader', label: 'Card Reader' },
  { id: 'access_control_panel', label: 'Access Control Panel' },
  { id: 'power_supply', label: 'Power Supply' },
  { id: 'rex_sensor', label: 'REX Sensor' },
  { id: 'door_contact', label: 'Door Contact' },
  { id: 'auto_operator', label: 'Automatic Door Operator' },
  { id: 'hollow_metal_door', label: 'Hollow Metal Door' },
  { id: 'hollow_metal_frame', label: 'Hollow Metal Frame' },
  { id: 'threshold', label: 'Threshold' },
  { id: 'gasket', label: 'Gasket / Weatherstrip' },
  { id: 'door_bottom', label: 'Door Bottom / Sweep' },
  { id: 'flush_bolt', label: 'Flush Bolt' },
  { id: 'coordinator', label: 'Door Coordinator' },
  { id: 'stop', label: 'Door Stop / Holder' },
  { id: 'kickplate', label: 'Kick Plate' },
  { id: 'push_pull', label: 'Push / Pull' },
  { id: 'pivot', label: 'Pivot' },
  { id: 'cylinder', label: 'Cylinder' },
  { id: 'electronic_lock', label: 'Electronic Lock' },
  { id: 'glazing', label: 'Glazing / Glass' },
  { id: 'intercom', label: 'Intercom' },
  { id: 'credential', label: 'Credential / Card' },
  { id: 'mobile_access', label: 'Mobile Access' },
] as const;

/** Get all manufacturers that make a given hardware type */
export function getManufacturersForType(hardwareTypeId: string): Array<{ id: string; name: string; parentGroup: string; color: string }> {
  const results: Array<{ id: string; name: string; parentGroup: string; color: string }> = [];

  for (const group of catalog.parentGroups) {
    for (const brand of group.brands) {
      if (brand.categories.includes(hardwareTypeId)) {
        results.push({
          id: brand.id,
          name: brand.name,
          parentGroup: group.name,
          color: group.color,
        });
      }
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/** Get all parent groups */
export function getParentGroups(): ParentGroup[] {
  return catalog.parentGroups;
}

/** Map hardware type ID to estimate category for part matching */
export function hardwareTypeToCategory(typeId: string): string {
  const map: Record<string, string> = {
    door_closer: 'Door Closers',
    exit_device: 'Exit Devices',
    cylindrical_lock: 'Commercial Locks',
    mortise_lock: 'Commercial Locks',
    deadbolt: 'Commercial Locks',
    hinge: 'Hinges',
    continuous_hinge: 'Hinges',
    electric_strike: 'Electric Strikes',
    maglock: 'Maglocks',
    card_reader: 'Access Control',
    access_control_panel: 'Access Control',
    power_supply: 'Access Control',
    rex_sensor: 'Access Control',
    door_contact: 'Access Control',
    auto_operator: 'Auto Operators',
    hollow_metal_door: 'Frames & Doors',
    hollow_metal_frame: 'Frames & Doors',
    threshold: 'Door Accessories',
    gasket: 'Door Accessories',
    door_bottom: 'Door Accessories',
    flush_bolt: 'Door Accessories',
    coordinator: 'Door Accessories',
    stop: 'Door Accessories',
    kickplate: 'Door Accessories',
    push_pull: 'Door Accessories',
    pivot: 'Hinges',
    cylinder: 'Cylinders',
    electronic_lock: 'Access Control',
    glazing: 'Glass/Storefront',
    intercom: 'Access Control',
    credential: 'Access Control',
    mobile_access: 'Access Control',
  };
  return map[typeId] ?? 'Door Accessories';
}
