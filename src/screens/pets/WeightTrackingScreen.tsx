import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';
import { Card, Button, Input, EmptyState, IconButton } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { format } from 'date-fns';

type Props = {
  navigation: StackNavigationProp<any>;
};

const screenWidth = Dimensions.get('window').width - spacing.lg * 2;

export function WeightTrackingScreen({ navigation }: Props) {
  const { selectedPet, weightRecords, fetchWeightRecords, addWeightRecord, deleteWeightRecord } = usePetStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPet) {
      fetchWeightRecords(selectedPet.id);
    }
  }, [selectedPet]);

  const handleAddWeight = async () => {
    if (!newWeight || !selectedPet) return;

    setLoading(true);
    const result = await addWeightRecord({
      pet_id: selectedPet.id,
      weight: parseFloat(newWeight),
      weight_unit: selectedPet.weight_unit,
      recorded_at: new Date().toISOString(),
    });

    setLoading(false);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setNewWeight('');
      setShowAddForm(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this weight record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWeightRecord(id),
        },
      ]
    );
  };

  const chartData = {
    labels: weightRecords.slice(-7).map((r) => format(new Date(r.recorded_at), 'MM/dd')),
    datasets: [
      {
        data: weightRecords.slice(-7).map((r) => r.weight),
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(196, 165, 116, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(61, 61, 61, ${opacity})`,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
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
            <Text style={styles.title}>Weight Tracking</Text>
            <Text style={styles.subtitle}>
              Track {selectedPet.name}'s weight over time
            </Text>
          </View>

          {weightRecords.length > 1 && (
            <Card style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Weight Trend</Text>
              <LineChart
                data={chartData}
                width={screenWidth - spacing.lg}
                height={200}
                chartConfig={chartConfig}
                bezier={true}
                style={styles.chart}
              />
            </Card>
          )}

          {showAddForm ? (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Add Weight Record</Text>
              <Input
                label={`Weight (${selectedPet.weight_unit})`}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="Enter weight"
                keyboardType="decimal-pad"
              />
              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => {
                    setShowAddForm(false);
                    setNewWeight('');
                  }}
                  style={styles.formButton}
                />
                <Button
                  title="Save"
                  onPress={handleAddWeight}
                  loading={loading}
                  style={styles.formButton}
                />
              </View>
            </Card>
          ) : (
            <Button
              title="Add Weight Record"
              onPress={() => setShowAddForm(true)}
              style={styles.addButton}
            />
          )}

          {weightRecords.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No weight records"
              description="Start tracking your pet's weight to see trends over time"
            />
          ) : (
            <>
              <Text style={styles.sectionTitle}>History</Text>
              {[...weightRecords].reverse().map((record) => (
                <Card key={record.id} style={styles.recordCard}>
                  <View style={styles.recordContent}>
                    <View>
                      <Text style={styles.recordWeight}>
                        {record.weight} {record.weight_unit}
                      </Text>
                      <Text style={styles.recordDate}>
                        {format(new Date(record.recorded_at), 'MMMM d, yyyy')}
                      </Text>
                    </View>
                    <IconButton
                      icon="🗑️"
                      variant="ghost"
                      size="sm"
                      onPress={() => handleDeleteRecord(record.id)}
                    />
                  </View>
                </Card>
              ))}
            </>
          )}
        </View>
      </ScrollView>
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
  chartCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  recordCard: {
    marginBottom: spacing.sm,
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordWeight: {
    ...typography.h3,
    color: colors.text,
  },
  recordDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
