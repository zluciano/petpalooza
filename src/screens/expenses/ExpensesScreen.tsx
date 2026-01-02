import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { PieChart } from 'react-native-chart-kit';
import { Card, Button, Input, Select, DatePicker, EmptyState, IconButton } from '../../components';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { supabase } from '../../services/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { Expense } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
};

const categoryOptions = [
  { label: 'Food', value: 'food', icon: '🍽️' },
  { label: 'Vet', value: 'vet', icon: '🏥' },
  { label: 'Medication', value: 'medication', icon: '💊' },
  { label: 'Grooming', value: 'grooming', icon: '✂️' },
  { label: 'Accessories', value: 'accessories', icon: '🎀' },
  { label: 'Insurance', value: 'insurance', icon: '🛡️' },
  { label: 'Other', value: 'other', icon: '📦' },
];

const categoryColors: Record<string, string> = {
  food: '#FF9800',
  vet: '#4CAF50',
  medication: '#E91E63',
  grooming: '#9C27B0',
  accessories: '#03A9F4',
  insurance: '#607D8B',
  other: '#795548',
};

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  vet: '🏥',
  medication: '💊',
  grooming: '✂️',
  accessories: '🎀',
  insurance: '🛡️',
  other: '📦',
};

const screenWidth = Dimensions.get('window').width;

export function ExpensesScreen({ navigation }: Props) {
  const { selectedPet } = usePetStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'food' as Expense['category'],
    amount: '',
    description: '',
    date: new Date(),
    notes: '',
  });

  useEffect(() => {
    if (selectedPet) {
      fetchExpenses();
    }
  }, [selectedPet]);

  const fetchExpenses = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
    setLoading(false);
  };

  const handleAddExpense = async () => {
    if (!selectedPet || !formData.amount || !formData.description) {
      Alert.alert('Error', 'Please fill in amount and description');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').insert({
        pet_id: selectedPet.id,
        category: formData.category,
        amount: parseFloat(formData.amount),
        currency: 'USD',
        description: formData.description,
        date: formData.date.toISOString().split('T')[0],
        notes: formData.notes || null,
      });

      if (error) throw error;

      await fetchExpenses();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('expenses').delete().eq('id', expense.id);
            await fetchExpenses();
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      category: 'food',
      amount: '',
      description: '',
      date: new Date(),
      notes: '',
    });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const currentMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return (
      expenseDate >= startOfMonth(new Date()) &&
      expenseDate <= endOfMonth(new Date())
    );
  });
  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      color: categoryColors[category],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));

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
            <Text style={styles.title}>Expenses</Text>
            <Text style={styles.subtitle}>
              Track {selectedPet.name}'s costs and spending
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryAmount}>${currentMonthTotal.toFixed(2)}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>All Time</Text>
              <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
            </Card>
          </View>

          <Button
            title="Add Expense"
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
            icon={<Text>💰</Text>}
          />

          {pieChartData.length > 0 && (
            <Card style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              <PieChart
                data={pieChartData}
                width={screenWidth - spacing.lg * 4}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={true}
              />
            </Card>
          )}

          {expenses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              {expenses.slice(0, 20).map((expense) => (
                <Card key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseContent}>
                    <View style={[styles.expenseIcon, { backgroundColor: categoryColors[expense.category] + '20' }]}>
                      <Text style={styles.expenseEmoji}>{categoryIcons[expense.category]}</Text>
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <Text style={styles.expenseCategory}>
                        {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} • {format(new Date(expense.date), 'MMM d, yyyy')}
                      </Text>
                    </View>
                    <View style={styles.expenseRight}>
                      <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                      <IconButton
                        icon="🗑️"
                        variant="ghost"
                        size="sm"
                        onPress={() => handleDeleteExpense(expense)}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {expenses.length === 0 && !loading && (
            <EmptyState
              icon="💰"
              title="No expenses recorded"
              description="Track your pet's expenses to manage your budget"
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Expense</Text>

              <Select
                label="Category"
                value={formData.category}
                options={categoryOptions}
                onChange={(value) =>
                  setFormData({ ...formData, category: value as Expense['category'] })
                }
              />

              <Input
                label="Amount ($) *"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Input
                label="Description *"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="What was this expense for?"
              />

              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date: date })}
                maximumDate={new Date()}
              />

              <Input
                label="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any additional notes"
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
                  onPress={handleAddExpense}
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryAmount: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  addButton: {
    marginBottom: spacing.lg,
  },
  chartCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  expenseCard: {
    marginBottom: spacing.sm,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  expenseEmoji: {
    fontSize: 20,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  expenseCategory: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
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
    maxHeight: '85%',
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
