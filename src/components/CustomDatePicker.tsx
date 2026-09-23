import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label = 'Birthdate Picker',
  error,
  placeholder = 'Select your birthdate',
}) => {
  const { colors, isDark } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const initialDate = value || new Date(1998, 0, 15);
  const [tempYear, setTempYear] = useState<number>(initialDate.getFullYear());
  const [tempMonth, setTempMonth] = useState<number>(initialDate.getMonth());
  const [tempDay, setTempDay] = useState<number>(initialDate.getDate());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 90 }, (_, i) => currentYear - i);

  const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleOpen = () => {
    const cur = value || new Date(1998, 0, 15);
    setTempYear(cur.getFullYear());
    setTempMonth(cur.getMonth());
    setTempDay(Math.min(cur.getDate(), new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate()));
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const safeDay = Math.min(tempDay, daysInMonth);
    const selected = new Date(tempYear, tempMonth, safeDay);
    onChange(selected);
    setModalVisible(false);
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${month} ${day}, ${year} (${age} years old)`;
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: isDark ? colors.textSecondary : '#374151' }]}>
          {label} <Text style={{ color: colors.danger }}>*</Text>
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpen}
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <Text style={styles.icon}>📅</Text>
        <Text
          style={[
            styles.inputText,
            {
              color: value ? colors.text : colors.textMuted,
            },
          ]}
        >
          {value ? formatDateDisplay(value) : placeholder}
        </Text>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>▼</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Birthdate
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCancel, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.columnsContainer}>
              {/* Day Column */}
              <View style={styles.column}>
                <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>Day</Text>
                <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                  {days.map(d => {
                    const isSelected = d === tempDay;
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setTempDay(d)}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: isSelected ? colors.primary : colors.text },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={[styles.column, { flex: 1.5 }]}>
                <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>Month</Text>
                <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((m, idx) => {
                    const isSelected = idx === tempMonth;
                    return (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setTempMonth(idx)}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: isSelected ? colors.primary : colors.text },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {m.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View style={styles.column}>
                <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>Year</Text>
                <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                  {years.map(y => {
                    const isSelected = y === tempYear;
                    return (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setTempYear(y)}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: isSelected ? colors.primary : colors.text },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.confirmText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
  },
  chevron: {
    fontSize: 10,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCancel: {
    fontSize: 15,
    fontWeight: '600',
  },
  columnsContainer: {
    flexDirection: 'row',
    height: 200,
    gap: 8,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scrollList: {
    flex: 1,
  },
  optionItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 14,
  },
  confirmButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CustomDatePicker;
