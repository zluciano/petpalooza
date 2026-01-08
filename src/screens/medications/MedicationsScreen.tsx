import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Button, Input, Select, DatePicker, EmptyState, IconButton } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';
import type { Medication } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
};

const frequencyOptions = [
  { label: 'Once daily', value: 'daily', icon: '1️⃣' },
  { label: 'Twice daily', value: 'twice_daily', icon: '2️⃣' },
  { label: 'Weekly', value: 'weekly', icon: '📅' },
  { label: 'Monthly', value: 'monthly', icon: '🗓️' },
  { label: 'As needed', value: 'as_needed', icon: '❓' },
];

const frequencyLabels: Record<string, string> = {
  daily: 'Once daily',
  twice_daily: 'Twice daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  as_needed: 'As needed',
};

export function MedicationsScreen({ navigation }: Props) {
  const { selectedPet } = usePetStore();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily' as Medication['frequency'],
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    notes: '',
    reminderEnabled: true,
  });

  useEffect(() => {
    if (selectedPet) {
      fetchMedications();
    }
  }, [selectedPet]);

  const fetchMedications = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
    setLoading(false);
  };

  const handleAddMedication = async () => {
    if (!selectedPet || !formData.name || !formData.dosage) {
      Alert.alert('Error', 'Please fill in medication name and dosage');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('medications').insert({
        pet_id: selectedPet.id,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate?.toISOString().split('T')[0] || null,
        notes: formData.notes || null,
        reminder_enabled: formData.reminderEnabled,
        active: true,
      });

      if (error) throw error;

      await fetchMedications();
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Medication added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const handleToggleActive = async (med: Medication) => {
    try {
      await supabase
        .from('medications')
        .update({ active: !med.active })
        .eq('id', med.id);

      await fetchMedications();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteMedication = (med: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${med.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('medications').delete().eq('id', med.id);
            await fetchMedications();
          },
        },
      ]
    );
  };

  const handleLogDose = async (med: Medication) => {
    try {
      await supabase.from('medication_logs').insert({
        medication_id: med.id,
        given_at: new Date().toISOString(),
        skipped: false,
      });

      Alert.alert('Logged', `Dose of ${med.name} logged successfully!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      startDate: new Date(),
      endDate: undefined,
      notes: '',
      reminderEnabled: true,
    });
  };

  const activeMedications = medications.filter((m) => m.active);
  const inactiveMedications = medications.filter((m) => !m.active);

  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  const renderMedicationCard = (med: Medication) => (
    <Card key={med.id} style={[styles.medCard, !med.active ? styles.inactiveCard : undefined]}>
      <View style={styles.medHeader}>
        <View style={styles.medIcon}>
          <Text style={styles.medEmoji}>💊</Text>
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{med.name}</Text>
          <Text style={styles.medDosage}>{med.dosage}</Text>
        </View>
        <Switch
          value={med.active}
          onValueChange={() => handleToggleActive(med)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={med.active ? colors.primary : colors.textLight}
        />
      </View>
      <View style={styles.medDetails}>
        <Text style={styles.medFrequency}>
          📆 {frequencyLabels[med.frequency]}
        </Text>
        {med.start_date && (
          <Text style={styles.medDate}>
            Started: {format(new Date(med.start_date), 'MMM d, yyyy')}
          </Text>
        )}
        {med.end_date && (
          <Text style={styles.medDate}>
            Until: {format(new Date(med.end_date), 'MMM d, yyyy')}
          </Text>
        )}
      </View>
      {med.notes && <Text style={styles.medNotes}>{med.notes}</Text>}
      <View style={styles.medActions}>
        {med.active && (
          <Button
            title="Log Dose"
            size="sm"
            onPress={() => handleLogDose(med)}
            style={styles.logButton}
          />
        )}
        <Button
          title="Delete"
          variant="ghost"
          size="sm"
          onPress={() => handleDeleteMedication(med)}
          textStyle={styles.deleteText}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Medications</Text>
            <Text style={styles.subtitle}>
              Track {selectedPet.name}'s medications and reminders
            </Text>
          </View>

          <Button
            title="Add Medication"
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
            icon={<Text>💊</Text>}
          />

          {activeMedications.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Active Medications</Text>
              {activeMedications.map(renderMedicationCard)}
            </>
          )}

          {inactiveMedications.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Inactive</Text>
              {inactiveMedications.map(renderMedicationCard)}
            </>
          )}

          {medications.length === 0 && !loading && (
            <EmptyState
              icon="💊"
              title="No medications"
              description="Add your pet's medications to track and get reminders"
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Medication</Text>

              <Input
                label="Medication Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Heartgard"
              />

              <Input
                label="Dosage *"
                value={formData.dosage}
                onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                placeholder="e.g., 1 tablet, 5ml"
              />

              <Select
                label="Frequency"
                value={formData.frequency}
                options={frequencyOptions}
                onChange={(value) =>
                  setFormData({ ...formData, frequency: value as Medication['frequency'] })
                }
              />

              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
              />

              <DatePicker
                label="End Date (Optional)"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                placeholder="Leave empty if ongoing"
              />

              <Input
                label="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any special instructions"
                multiline={true}
                numberOfLines={2}
              />

              <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>Enable Reminders</Text>
                <Switch
                  value={formData.reminderEnabled}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reminderEnabled: value })
                  }
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={formData.reminderEnabled ? colors.primary : colors.textLight}
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={styles.modalButton}
                />
                <Button
                  title="Add"
                  onPress={handleAddMedication}
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  medCard: {
    marginBottom: spacing.md,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  medEmoji: {
    fontSize: 24,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  medDosage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  medDetails: {
    paddingLeft: 60,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  medFrequency: {
    ...typography.bodySmall,
    color: colors.text,
  },
  medDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  medNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingLeft: 60,
  },
  medActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logButton: {
    minWidth: 100,
  },
  deleteText: {
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  reminderLabel: {
    ...typography.body,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});
