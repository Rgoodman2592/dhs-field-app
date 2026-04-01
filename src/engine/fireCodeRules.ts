/**
 * NFPA 80 / NFPA 101 / IBC Fire & Life Safety Code Compliance Engine
 * TypeScript port from DHS Estimate Builder fire_code_rules.js
 */

export interface FireCodeViolation {
  code: string;
  issue: string;
  fix: string;
  autoAdd?: string;
  autoAddQty?: number;
}

export interface FireCodeResult {
  compliant: boolean;
  violations: FireCodeViolation[];
  warnings: FireCodeViolation[];
  additions: string[];
  notes: string[];
}

export interface FireCodeConfig {
  fireRated: boolean;
  fireRating?: string;
  isPair: boolean;
  doors: number;
}

interface EstimateItem {
  name?: string;
  cat?: string;
  category?: string;
  description?: string;
  qty?: number;
}

export function validateFireCode(estimateItems: EstimateItem[], config: FireCodeConfig): FireCodeResult {
  const result: FireCodeResult = {
    compliant: true,
    violations: [],
    warnings: [],
    additions: [],
    notes: [],
  };

  const { fireRated, isPair, doors = 1 } = config;
  const hasExit = estimateItems.some(i => /exit|panic/i.test(i.cat || i.category || ''));
  const hasCloser = estimateItems.some(i => /closer/i.test(i.cat || i.category || i.name || ''));
  const hasHinges = estimateItems.some(i => /hinge/i.test(i.cat || i.category || i.name || ''));
  const hasLatch = estimateItems.some(i => /lock|latch|exit/i.test(i.name || ''));
  const hasSmokeGasket = estimateItems.some(i => /smoke|gasket|seal/i.test(i.name || ''));
  const hasFlushBolts = estimateItems.some(i => /flush bolt/i.test(i.name || ''));
  const hasCoordinator = estimateItems.some(i => /coordinator/i.test(i.name || ''));

  if (!fireRated) {
    result.notes.push('Non-fire-rated opening — NFPA 80 fire door requirements do not apply.');
    return result;
  }

  // 1. Closer required on every fire door (NFPA 80 §6.2.1)
  if (!hasCloser) {
    result.compliant = false;
    result.violations.push({
      code: 'NFPA 80 §6.2.1',
      issue: 'DOOR CLOSER REQUIRED — Every fire-rated door must be self-closing.',
      fix: 'Add a listed door closer for each fire-rated door leaf.',
      autoAdd: 'closer',
    });
  } else {
    const closerItems = estimateItems.filter(i => /closer/i.test(i.name || ''));
    const closerQty = closerItems.reduce((s, i) => s + (i.qty || 1), 0);
    if (closerQty < doors) {
      result.compliant = false;
      result.violations.push({
        code: 'NFPA 80 §6.2.1',
        issue: `INSUFFICIENT CLOSERS — ${closerQty} closer(s) for ${doors} door leaf(s).`,
        fix: `Add ${doors - closerQty} more closer(s).`,
        autoAdd: 'closer',
        autoAddQty: doors - closerQty,
      });
    }
  }

  // 2. Positive latching (NFPA 80 §6.1.5)
  if (!hasLatch) {
    result.compliant = false;
    result.violations.push({
      code: 'NFPA 80 §6.1.5',
      issue: 'POSITIVE LATCHING REQUIRED — Fire-rated doors must have a latching device.',
      fix: 'Add a lockset or exit device with positive latching.',
    });
  }

  // 3. Ball-bearing hinges (NFPA 80 §6.4.1)
  if (hasHinges) {
    result.notes.push('NFPA 80 §6.4.1: Verify hinges are steel, ball-bearing type. Min 3 per leaf.');
  } else {
    result.warnings.push({
      code: 'NFPA 80 §6.4.1',
      issue: 'No hinges specified — fire-rated doors require steel ball-bearing hinges (min 3 per leaf).',
      fix: 'Add ball-bearing hinges (3 per door leaf).',
      autoAdd: 'hinges',
    });
  }

  // 4. Exit devices must be Fire Exit Hardware (NFPA 80 §6.4.3)
  if (hasExit) {
    const exitItems = estimateItems.filter(i => /exit|panic/i.test(i.cat || i.category || ''));
    for (const item of exitItems) {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      if (!desc.includes('fire') && !name.includes('fire') && !desc.includes('-f-')) {
        result.compliant = false;
        result.violations.push({
          code: 'NFPA 80 §6.4.3 / UL 305',
          issue: `NON-FIRE-RATED EXIT DEVICE — "${item.name}" must be Fire Exit Hardware.`,
          fix: 'Replace with fire-rated exit hardware (e.g., Von Duprin 99EO-F series).',
        });
      }
    }
  }

  // 5. Pairs — automatic flush bolts (NFPA 80 §6.4.4)
  if (isPair) {
    if (!hasFlushBolts) {
      result.compliant = false;
      result.violations.push({
        code: 'NFPA 80 §6.4.4',
        issue: 'FLUSH BOLTS REQUIRED — Inactive leaf requires AUTOMATIC flush bolts.',
        fix: 'Add automatic flush bolt set (top & bottom) for inactive leaf.',
        autoAdd: 'flushbolt',
      });
    }

    if (!hasCoordinator) {
      result.warnings.push({
        code: 'NFPA 80 §6.1.5.2',
        issue: 'DOOR COORDINATOR RECOMMENDED — Pairs with overlapping astragal need a coordinator.',
        fix: 'Add door coordinator.',
        autoAdd: 'coordinator',
      });
    }
  }

  // 6. Smoke gasketing (NFPA 80 / UL 1784)
  if (!hasSmokeGasket) {
    result.warnings.push({
      code: 'NFPA 80 §4.8.4 / UL 1784',
      issue: 'SMOKE GASKETING — Fire-rated doors in smoke barriers require smoke gasketing.',
      fix: 'Add smoke gasketing (Pemko S88BL or equivalent).',
      autoAdd: 'smoke_gasket',
    });
  }

  // Standard notes
  result.notes.push('NFPA 80 §6.1.4: ALL hardware must be listed and labeled for fire-rated use.');
  result.notes.push('NFPA 80 §6.1.6: No field modifications without manufacturer written authorization.');
  result.notes.push('NFPA 80 §5.2: Fire door assemblies must be inspected annually.');
  result.notes.push('IBC §1010.1.9 / ADA §404.2.7: Lever handles required (operable without tight grasping).');
  result.notes.push('NFPA 80 §4.8.4: Max 1/8" top/sides, 3/4" bottom, 1/8" meeting stiles.');

  return result;
}

export interface FireRatedRequirement {
  type: string;
  qty: number;
  reason: string;
  mandatory: boolean;
}

export function getFireRatedRequirements(config: FireCodeConfig): FireRatedRequirement[] {
  const reqs: FireRatedRequirement[] = [];
  const { isPair, doors = 1 } = config;

  reqs.push({ type: 'closer', qty: doors, reason: 'Self-closing per NFPA 80 §6.2.1', mandatory: true });
  reqs.push({ type: 'hinges', qty: doors, reason: 'Steel ball-bearing hinges per NFPA 80 §6.4.1 (3/leaf)', mandatory: true });
  reqs.push({ type: 'latch', qty: isPair ? 1 : doors, reason: 'Positive latching per NFPA 80 §6.1.5', mandatory: true });
  reqs.push({ type: 'smoke_gasket', qty: doors, reason: 'Smoke gasketing per UL 1784', mandatory: false });

  if (isPair) {
    reqs.push({ type: 'auto_flush_bolts', qty: 1, reason: 'Automatic flush bolts per NFPA 80 §6.4.4', mandatory: true });
    reqs.push({ type: 'coordinator', qty: 1, reason: 'Coordinator per NFPA 80 §6.1.5.2', mandatory: true });
    reqs.push({ type: 'astragal', qty: 1, reason: 'Astragal per NFPA 80 §6.4.5', mandatory: false });
  }

  return reqs;
}
