import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../constants/theme';
import { format } from 'date-fns';
import { Button } from './Button';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());
  const [year, setYear] = useState((value || new Date()).getFullYear());
  const [month, setMonth] = useState((value || new Date()).getMonth());
  const [day, setDay] = useState((value || new Date()).getDate());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const handleConfirm = () => {
    const newDate = new Date(year, month, day);
    onChange(newDate);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value ? format(value, 'MMMM d, yyyy') : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Date</Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                  {months.map((m, i) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.option, month === i && styles.optionSelected]}
                      onPress={() => setMonth(i)}
                    >
                      <Text style={[styles.optionText, month === i && styles.optionTextSelected]}>
                        {m.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                  {days.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.option, day === d && styles.optionSelected]}
                      onPress={() => setDay(d)}
                    >
                      <Text style={[styles.optionText, day === d && styles.optionTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                  {years.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.option, year === y && styles.optionSelected]}
                      onPress={() => setYear(y)}
                    >
                      <Text style={[styles.optionText, year === y && styles.optionTextSelected]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setVisible(false)}
                style={styles.actionButton}
              />
              <Button
                title="Confirm"
                onPress={handleConfirm}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputText: {
    ...typography.body,
    color: colors.text,
  },
  placeholder: {
    color: colors.textLight,
  },
  icon: {
    fontSize: 20,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  scrollContainer: {
    height: 180,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    minWidth: 100,
  },
});
