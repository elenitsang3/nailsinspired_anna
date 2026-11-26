export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  instagram_handle: string | null;
  is_approved: boolean;
  is_admin: boolean;
  created_at: string;
};

export type AvailableSlot = {
  id: string;
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  slot_id: string;
  tier: string;
  design_notes: string | null;
  reference_photo_path: string | null;
  created_at: string;
  slot?: AvailableSlot;
  profile?: Profile;
};

export const SERVICE_TIERS = [
  {
    id: 'tier-1-minimalist',
    name: 'Tier 1 — Minimalist',
    description: 'Clean, simple designs. Solid colors, French tips, subtle accents.',
    duration: '60 min',
    price: '€45',
  },
  {
    id: 'tier-2-medium-art',
    name: 'Tier 2 — Medium Art',
    description: 'Hand-painted details, ombré, moderate nail art across fingers.',
    duration: '90 min',
    price: '€70',
  },
  {
    id: 'tier-3-complex-3d',
    name: 'Tier 3 — Complex / 3D Art',
    description: 'Intricate 3D sculptures, charms, rhinestones, full custom artwork.',
    duration: '150 min',
    price: '€120',
  },
] as const;
