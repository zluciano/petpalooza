import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Button, Input, EmptyState, IconButton } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';
import type { FeedingSchedule, FeedingLog } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
};

export function DietScreen({ navigation }: Props) {
  const { selectedPet } = usePetStore();
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [recentLogs, setRecentLogs] = useState<FeedingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    foodBrand: '',
    portionSize: '',
    feedingTimes: ['08:00', '18:00'],
    notes: '',
  });
  const [logData, setLogData] = useState({
    foodName: '',
    portionSize: '',
  });

  useEffect(() => {
    if (selectedPet) {
      fetchData();
    }
  }, [selectedPet]);

  const fetchData = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const [schedulesRes, logsRes] = await Promise.all([
        supabase
          .from('feeding_schedules')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('feeding_logs')
          .select('*')
          .eq('pet_id', selectedPet.id)
          .order('fed_at', { ascending: false })
          .limit(20),
      ]);

      setSchedules(schedulesRes.data || []);
      setRecentLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error fetching diet data:', error);
    }
    setLoading(false);
  };

  const handleAddSchedule = async () => {
    if (!selectedPet || !formData.foodName || !formData.portionSize) {
      Alert.alert('Error', 'Please fill in food name and portion size');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feeding_schedules').insert({
        pet_id: selectedPet.id,
        food_name: formData.foodName,
        food_brand: formData.foodBrand || null,
        portion_size: formData.portionSize,
        feeding_times: formData.feedingTimes,
        notes: formData.notes || null,
      });

      if (error) throw error;

      await fetchData();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const handleLogFeeding = async () => {
    if (!selectedPet || !logData.foodName || !logData.portionSize) {
      Alert.alert('Error', 'Please fill in food name and portion');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feeding_logs').insert({
        pet_id: selectedPet.id,
        food_name: logData.foodName,
        portion_size: logData.portionSize,
        fed_at: new Date().toISOString(),
      });

      if (error) throw error;

      await fetchData();
      setShowLogModal(false);
      setLogData({ foodName: '', portionSize: '' });
      Alert.alert('Success', 'Feeding logged!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const handleQuickLog = async (schedule: FeedingSchedule) => {
    if (!selectedPet) return;
    try {
      await supabase.from('feeding_logs').insert({
        pet_id: selectedPet.id,
        feeding_schedule_id: schedule.id,
        food_name: schedule.food_name,
        portion_size: schedule.portion_size,
        fed_at: new Date().toISOString(),
      });

      await fetchData();
      Alert.alert('Logged!', `${schedule.food_name} feeding recorded`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteSchedule = (schedule: FeedingSchedule) => {
    Alert.alert(
      'Delete Schedule',
      `Delete "${schedule.food_name}" from feeding schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('feeding_schedules').delete().eq('id', schedule.id);
            await fetchData();
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      foodName: '',
      foodBrand: '',
      portionSize: '',
      feedingTimes: ['08:00', '18:00'],
      notes: '',
    });
  };

  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Diet & Feeding</Text>
            <Text style={styles.subtitle}>
              Track {selectedPet.name}'s meals and nutrition
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Add Schedule"
              onPress={() => setShowAddModal(true)}
              style={styles.halfButton}
              icon={<Text>📋</Text>}
            />
            <Button
              title="Log Feeding"
              variant="secondary"
              onPress={() => setShowLogModal(true)}
              style={styles.halfButton}
              icon={<Text>🍽️</Text>}
            />
          </View>

          {schedules.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Feeding Schedule</Text>
              {schedules.map((schedule) => (
                <Card key={schedule.id} style={styles.scheduleCard}>
                  <View style={styles.scheduleHeader}>
                    <View style={styles.scheduleIcon}>
                      <Text style={styles.scheduleEmoji}>🍽️</Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.foodName}>{schedule.food_name}</Text>
                      {schedule.food_brand && (
                        <Text style={styles.foodBrand}>{schedule.food_brand}</Text>
                      )}
                    </View>
                    <Button
                      title="Log"
                      size="sm"
                      onPress={() => handleQuickLog(schedule)}
                    />
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.portion}>
                      🥣 {schedule.portion_size}
                    </Text>
                    <Text style={styles.times}>
                      🕐 {schedule.feeding_times.join(' • ')}
                    </Text>
                  </View>
                  {schedule.notes && (
                    <Text style={styles.scheduleNotes}>{schedule.notes}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.deleteLink}
                    onPress={() => handleDeleteSchedule(schedule)}
                  >
                    <Text style={styles.deleteLinkText}>Delete</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </>
          )}

          {recentLogs.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recent Feedings</Text>
              {recentLogs.slice(0, 10).map((log) => (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logContent}>
                    <View>
                      <Text style={styles.logFood}>{log.food_name}</Text>
                      <Text style={styles.logPortion}>{log.portion_size}</Text>
                    </View>
                    <Text style={styles.logTime}>
                      {format(new Date(log.fed_at), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                </Card>
              ))}
            </>
          )}

          {schedules.length === 0 && recentLogs.length === 0 && !loading && (
            <EmptyState
              icon="🍽️"
              title="No diet data"
              description="Set up feeding schedules and track meals"
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Feeding Schedule</Text>

              <Input
                label="Food Name *"
                value={formData.foodName}
                onChangeText={(text) => setFormData({ ...formData, foodName: text })}
                placeholder="e.g., Dry kibble"
              />

              <Input
                label="Brand (Optional)"
                value={formData.foodBrand}
                onChangeText={(text) => setFormData({ ...formData, foodBrand: text })}
                placeholder="e.g., Royal Canin"
              />

              <Input
                label="Portion Size *"
                value={formData.portionSize}
                onChangeText={(text) => setFormData({ ...formData, portionSize: text })}
                placeholder="e.g., 1 cup, 100g"
              />

              <Input
                label="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any dietary notes"
                multiline={true}
                numberOfLines={2}
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
                  title="Add"
                  onPress={handleAddSchedule}
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Feeding</Text>

            <Input
              label="Food Name *"
              value={logData.foodName}
              onChangeText={(text) => setLogData({ ...logData, foodName: text })}
              placeholder="What did you feed?"
            />

            <Input
              label="Portion Size *"
              value={logData.portionSize}
              onChangeText={(text) => setLogData({ ...logData, portionSize: text })}
              placeholder="How much?"
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowLogModal(false);
                  setLogData({ foodName: '', portionSize: '' });
                }}
                style={styles.modalButton}
              />
              <Button
                title="Log"
                onPress={handleLogFeeding}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  halfButton: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  scheduleCard: {
    marginBottom: spacing.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  scheduleEmoji: {
    fontSize: 24,
  },
  scheduleInfo: {
    flex: 1,
  },
  foodName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  foodBrand: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scheduleDetails: {
    paddingLeft: 60,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  portion: {
    ...typography.bodySmall,
    color: colors.text,
  },
  times: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  scheduleNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingLeft: 60,
    marginTop: spacing.sm,
  },
  deleteLink: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  deleteLinkText: {
    ...typography.caption,
    color: colors.error,
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  logContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logFood: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  logPortion: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  logTime: {
    ...typography.caption,
    color: colors.textSecondary,
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
    maxHeight: '80%',
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
