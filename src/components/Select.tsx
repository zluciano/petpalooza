import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../constants/theme';
import { Button } from './Button';

interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select option',
  error,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
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
          {selectedOption ? (
            <>
              {selectedOption.icon && `${selectedOption.icon} `}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </Text>
        <Text style={styles.icon}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={visible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label || 'Select option'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.list}
            />
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setVisible(false)}
              style={styles.cancelButton}
            />
          </View>
        </TouchableOpacity>
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
    fontSize: 12,
    color: colors.textSecondary,
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
    maxHeight: '70%',
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: spacing.md,
  },
});
