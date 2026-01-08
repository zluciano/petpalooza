import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { Card, Button, Input, Select, DatePicker, EmptyState, IconButton } from '../../components';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { supabase } from '../../services/supabase';
import { format, addMinutes, isBefore, isAfter } from 'date-fns';
import type { VetVisit } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
};

const visitTypeOptions = [
  { label: 'Checkup', value: 'checkup', icon: '🩺' },
  { label: 'Vaccination', value: 'vaccination', icon: '💉' },
  { label: 'Surgery', value: 'surgery', icon: '🏥' },
  { label: 'Emergency', value: 'emergency', icon: '🚨' },
  { label: 'Grooming', value: 'grooming', icon: '✂️' },
  { label: 'Other', value: 'other', icon: '📋' },
];

const visitTypeIcons: Record<string, string> = {
  checkup: '🩺',
  vaccination: '💉',
  surgery: '🏥',
  emergency: '🚨',
  grooming: '✂️',
  other: '📋',
};

const reminderOptions = [
  { label: '15 minutes before', value: '15' },
  { label: '30 minutes before', value: '30' },
  { label: '1 hour before', value: '60' },
  { label: '1 day before', value: '1440' },
];

// Wrap in try-catch for Expo Go compatibility (notifications removed in SDK 53+)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log('Notifications not available in Expo Go');
}

export function VetVisitsScreen({ navigation }: Props) {
  const { selectedPet } = usePetStore();
  const [visits, setVisits] = useState<VetVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    vetName: '',
    vetAddress: '',
    vetPhone: '',
    visitType: 'checkup' as VetVisit['visit_type'],
    scheduledAt: new Date(),
    notes: '',
    reminderMinutes: '60',
  });

  useEffect(() => {
    if (selectedPet) {
      fetchVisits();
      requestNotificationPermissions();
    }
  }, [selectedPet]);

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please enable notifications for reminders');
      }
    } catch (e) {
      // Notifications not available in Expo Go
    }
  };

  const fetchVisits = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vet_visits')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
    setLoading(false);
  };

  const scheduleNotification = async (visit: VetVisit) => {
    try {
      const triggerDate = addMinutes(
        new Date(visit.scheduled_at),
        -visit.reminder_minutes_before
      );

      if (isBefore(triggerDate, new Date())) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Vet Visit Reminder 🏥`,
          body: `${selectedPet?.name} has a ${visit.visit_type} appointment at ${visit.vet_name}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    } catch (e) {
      // Notifications not available in Expo Go
    }
  };

  const handleAddVisit = async () => {
    if (!selectedPet || !formData.vetName) {
      Alert.alert('Error', 'Please enter vet name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vet_visits')
        .insert({
          pet_id: selectedPet.id,
          vet_name: formData.vetName,
          vet_address: formData.vetAddress || null,
          vet_phone: formData.vetPhone || null,
          visit_type: formData.visitType,
          scheduled_at: formData.scheduledAt.toISOString(),
          notes: formData.notes || null,
          reminder_enabled: true,
          reminder_minutes_before: parseInt(formData.reminderMinutes),
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await scheduleNotification(data);
      }

      await fetchVisits();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const handleCompleteVisit = async (visit: VetVisit) => {
    try {
      await supabase
        .from('vet_visits')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', visit.id);

      await fetchVisits();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteVisit = (visit: VetVisit) => {
    Alert.alert(
      'Delete Visit',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('vet_visits').delete().eq('id', visit.id);
            await fetchVisits();
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      vetName: '',
      vetAddress: '',
      vetPhone: '',
      visitType: 'checkup',
      scheduledAt: new Date(),
      notes: '',
      reminderMinutes: '60',
    });
  };

  const upcomingVisits = visits.filter(
    (v) => !v.completed && isAfter(new Date(v.scheduled_at), new Date())
  );
  const pastVisits = visits.filter(
    (v) => v.completed || isBefore(new Date(v.scheduled_at), new Date())
  );

  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  const renderVisitCard = (visit: VetVisit, isUpcoming: boolean) => (
    <Card key={visit.id} style={[styles.visitCard, visit.completed ? styles.completedCard : undefined]}>
      <View style={styles.visitHeader}>
        <View style={styles.visitTypeIcon}>
          <Text style={styles.visitEmoji}>{visitTypeIcons[visit.visit_type]}</Text>
        </View>
        <View style={styles.visitInfo}>
          <Text style={styles.visitType}>
            {visit.visit_type.charAt(0).toUpperCase() + visit.visit_type.slice(1)}
          </Text>
          <Text style={styles.vetName}>{visit.vet_name}</Text>
        </View>
        {!visit.completed && (
          <IconButton
            icon="✓"
            variant="primary"
            size="sm"
            onPress={() => handleCompleteVisit(visit)}
          />
        )}
      </View>
      <View style={styles.visitDetails}>
        <Text style={styles.visitDate}>
          📅 {format(new Date(visit.scheduled_at), 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text style={styles.visitTime}>
          🕐 {format(new Date(visit.scheduled_at), 'h:mm a')}
        </Text>
        {visit.vet_address && (
          <Text style={styles.visitAddress}>📍 {visit.vet_address}</Text>
        )}
      </View>
      {visit.notes && <Text style={styles.visitNotes}>{visit.notes}</Text>}
      <View style={styles.visitActions}>
        <Button
          title="Delete"
          variant="ghost"
          size="sm"
          onPress={() => handleDeleteVisit(visit)}
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
            <Text style={styles.title}>Vet Visits</Text>
            <Text style={styles.subtitle}>
              Schedule and track {selectedPet.name}'s appointments
            </Text>
          </View>

          <Button
            title="Schedule Visit"
            onPress={() => setShowAddModal(true)}
            style={styles.scheduleButton}
            icon={<Text>📅</Text>}
          />

          {upcomingVisits.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcomingVisits.map((visit) => renderVisitCard(visit, true))}
            </>
          )}

          {pastVisits.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Past Visits</Text>
              {pastVisits.map((visit) => renderVisitCard(visit, false))}
            </>
          )}

          {visits.length === 0 && !loading && (
            <EmptyState
              icon="🏥"
              title="No vet visits scheduled"
              description="Schedule your pet's next vet appointment"
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Schedule Visit</Text>

              <Input
                label="Vet/Clinic Name *"
                value={formData.vetName}
                onChangeText={(text) => setFormData({ ...formData, vetName: text })}
                placeholder="Enter vet or clinic name"
              />

              <Select
                label="Visit Type"
                value={formData.visitType}
                options={visitTypeOptions}
                onChange={(value) =>
                  setFormData({ ...formData, visitType: value as VetVisit['visit_type'] })
                }
              />

              <DatePicker
                label="Date & Time"
                value={formData.scheduledAt}
                onChange={(date) => setFormData({ ...formData, scheduledAt: date })}
                minimumDate={new Date()}
              />

              <Input
                label="Address"
                value={formData.vetAddress}
                onChangeText={(text) => setFormData({ ...formData, vetAddress: text })}
                placeholder="Enter address (optional)"
              />

              <Input
                label="Phone"
                value={formData.vetPhone}
                onChangeText={(text) => setFormData({ ...formData, vetPhone: text })}
                placeholder="Enter phone number (optional)"
                keyboardType="phone-pad"
              />

              <Select
                label="Reminder"
                value={formData.reminderMinutes}
                options={reminderOptions}
                onChange={(value) => setFormData({ ...formData, reminderMinutes: value })}
              />

              <Input
                label="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any additional notes"
                multiline={true}
                numberOfLines={3}
              />

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
                  title="Schedule"
                  onPress={handleAddVisit}
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
  scheduleButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  visitCard: {
    marginBottom: spacing.md,
  },
  completedCard: {
    opacity: 0.7,
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  visitTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  visitEmoji: {
    fontSize: 24,
  },
  visitInfo: {
    flex: 1,
  },
  visitType: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  vetName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  visitDetails: {
    paddingLeft: 60,
    gap: spacing.xs,
  },
  visitDate: {
    ...typography.bodySmall,
    color: colors.text,
  },
  visitTime: {
    ...typography.bodySmall,
    color: colors.text,
  },
  visitAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  visitNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingLeft: 60,
    fontStyle: 'italic',
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});
