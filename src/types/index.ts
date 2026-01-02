export type PetType = 'dog' | 'cat' | 'fish' | 'snake' | 'bird' | 'rabbit' | 'hamster' | 'turtle' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: PetType;
  breed?: string;
  date_of_birth?: string;
  weight?: number;
  weight_unit: 'kg' | 'lb';
  size?: number;
  size_unit: 'cm' | 'in';
  color?: string;
  microchip_id?: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightRecord {
  id: string;
  pet_id: string;
  weight: number;
  weight_unit: 'kg' | 'lb';
  recorded_at: string;
  notes?: string;
  created_at: string;
}

export interface Document {
  id: string;
  pet_id: string;
  name: string;
  type: 'vaccination' | 'medical_record' | 'custody' | 'insurance' | 'other';
  file_url: string;
  file_type: string;
  file_size: number;
  notes?: string;
  expiry_date?: string;
  created_at: string;
}

export interface VetVisit {
  id: string;
  pet_id: string;
  vet_name: string;
  vet_address?: string;
  vet_phone?: string;
  visit_type: 'checkup' | 'vaccination' | 'surgery' | 'emergency' | 'grooming' | 'other';
  scheduled_at: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
  cost?: number;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  pet_id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'monthly' | 'as_needed';
  start_date: string;
  end_date?: string;
  time_of_day?: string[];
  notes?: string;
  reminder_enabled: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  given_at: string;
  skipped: boolean;
  notes?: string;
  created_at: string;
}

export interface FeedingSchedule {
  id: string;
  pet_id: string;
  food_name: string;
  food_brand?: string;
  portion_size: string;
  feeding_times: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedingLog {
  id: string;
  pet_id: string;
  feeding_schedule_id?: string;
  food_name: string;
  portion_size: string;
  fed_at: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  pet_id: string;
  category: 'food' | 'vet' | 'medication' | 'grooming' | 'accessories' | 'insurance' | 'other';
  amount: number;
  currency: string;
  description: string;
  date: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
}

export interface EmergencyVet {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  is_24_hours: boolean;
  rating?: number;
}
