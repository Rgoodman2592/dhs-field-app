// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'tech' | 'estimator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ─── Survey Hierarchy: Job > Opening > Issue ──────────────────────────────────
export interface Job {
  [key: string]: unknown;
  id: string;
  sfJobId?: string;
  customerId?: string;
  customerName: string;
  address: string;
  contact: string;
  phone: string;
  status: 'active' | 'survey_complete' | 'estimate_pending' | 'estimate_submitted';
  assignedTechId?: string;
  createdAt: string;
}

export interface Opening {
  [key: string]: unknown;
  id: string;
  jobId: string;
  label: string;           // e.g. "Main Entry #1", "Stairwell B 3rd Floor"
  floor?: string;
  building?: string;
  doorType: 'single' | 'pair';
  fireRated: boolean;
  fireRating?: '20min' | '45min' | '1hr' | '1.5hr' | '3hr';
  wallType?: 'masonry' | 'drywall' | 'steel_stud' | 'wood_stud';
  throatDepth?: string;
  notes?: string;
  photos: string[];         // URLs or base64
}

export interface Issue {
  [key: string]: unknown;
  id: string;
  openingId: string;
  jobId: string;
  description: string;
  category?: string;        // Auto-classified: "Exit Devices", "Door Closers", etc.
  manufacturer?: string;
  brandId?: string;
  action: 'replace' | 'repair' | 'adjust' | 'install_new';
  severity: 'critical' | 'standard' | 'cosmetic';
  photos: string[];         // Required — at least 1
  videos?: string[];
  barcodeScan?: string;
  // Classification results
  classifiedProductId?: string;
  classificationConfidence?: number;
  // Estimate fields (populated by estimator)
  laborHours?: number;
  partNumber?: string;
  unitCost?: number;
  veSelectedBrand?: string;
  // Access control specific
  acFields?: {
    credentialType?: string;
    panelZone?: string;
    wiringNotes?: string;
  };
  createdBy: string;
  createdAt: string;
  syncStatus: 'local' | 'synced' | 'pending';
}

// ─── Estimate ─────────────────────────────────────────────────────────────────
export interface EstimateLineItem {
  id: string;
  issueId: string;
  openingLabel: string;
  description: string;       // DHS-style formatted
  partNumber: string;
  category: string;
  quantity: number;
  unitCost: number;
  markupPct: number;
  sellPrice: number;
  laborHours: number;
  laborCost: number;
  lineTotal: number;
  veAlternatives?: VEAlternative[];
  fireCodeRequired?: boolean;
}

export interface VEAlternative {
  brand: string;
  partNumber: string;
  unitCost: number;
  sellPrice: number;
  savingsPct: number;
}

export interface Estimate {
  id: string;
  jobId: string;
  lineItems: EstimateLineItem[];
  materialTotal: number;
  laborTotal: number;
  tripCharge: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: 'draft' | 'reviewed' | 'submitted';
  sfEstimateId?: string;
  submittedAt?: string;
  submittedBy?: string;
}

// ─── Offline Sync ─────────────────────────────────────────────────────────────
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  createdAt: string;
}
