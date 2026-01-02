import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Pet, WeightRecord } from '../types';

interface PetState {
  pets: Pet[];
  selectedPet: Pet | null;
  weightRecords: WeightRecord[];
  loading: boolean;
  fetchPets: () => Promise<void>;
  addPet: (pet: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<{ error?: string }>;
  deletePet: (id: string) => Promise<{ error?: string }>;
  selectPet: (pet: Pet | null) => void;
  fetchWeightRecords: (petId: string) => Promise<void>;
  addWeightRecord: (record: Omit<WeightRecord, 'id' | 'created_at'>) => Promise<{ error?: string }>;
  deleteWeightRecord: (id: string) => Promise<{ error?: string }>;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedPet: null,
  weightRecords: [],
  loading: false,

  fetchPets: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ pets: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching pets:', error);
      set({ loading: false });
    }
  },

  addPet: async (pet) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return { error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('pets')
        .insert({
          ...pet,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set((state) => ({
        pets: [data, ...state.pets],
        loading: false,
      }));
      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  updatePet: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? data : p)),
        selectedPet: state.selectedPet?.id === id ? data : state.selectedPet,
        loading: false,
      }));
      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  deletePet: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set((state) => ({
        pets: state.pets.filter((p) => p.id !== id),
        selectedPet: state.selectedPet?.id === id ? null : state.selectedPet,
        loading: false,
      }));
      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  selectPet: (pet) => set({ selectedPet: pet }),

  fetchWeightRecords: async (petId) => {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('pet_id', petId)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      set({ weightRecords: data || [] });
    } catch (error) {
      console.error('Error fetching weight records:', error);
    }
  },

  addWeightRecord: async (record) => {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert(record)
        .select()
        .single();

      if (error) return { error: error.message };

      set((state) => ({
        weightRecords: [...state.weightRecords, data].sort(
          (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        ),
      }));
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteWeightRecord: async (id) => {
    try {
      const { error } = await supabase.from('weight_records').delete().eq('id', id);
      if (error) return { error: error.message };

      set((state) => ({
        weightRecords: state.weightRecords.filter((r) => r.id !== id),
      }));
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },
}));
