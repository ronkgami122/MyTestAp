import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomCountryPicker, { Country } from '../components/CustomCountryPicker';

export const SettingsScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  // Form State for the 4 required fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [country, setCountry] = useState<Country | null>(null);

  // Form Validation Errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    birthdate?: string;
    country?: string;
  }>({});

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!birthdate) {
      newErrors.birthdate = 'Please select your birthdate.';
    }

    if (!country) {
      newErrors.country = 'Please select your country.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitted(true);
      const formattedDate = birthdate
        ? birthdate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '';

      Alert.alert(
        'Profile Saved Successfully 🎉',
        `The following settings have been stored:\n\n` +
          `• Name: ${name.trim()}\n` +
          `• Email: ${email.trim()}\n` +
          `• Birthdate: ${formattedDate}\n` +
          `• Country: ${country?.flag} ${country?.name} (${country?.dialCode})`,
        [{ text: 'Great!' }],
      );
    } else {
      Alert.alert('Incomplete Form', 'Please correct the highlighted fields before submitting.');
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setBirthdate(null);
    setCountry(null);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Introduction */}
        <View style={styles.headerBlock}>
          <Text style={[styles.heading, { color: colors.text }]}>Settings & Profile</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Requirement #11 • Configure and update user profile form fields
          </Text>
        </View>

        {/* Form Container Card */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* FIELD 1: NAME */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : '#374151' }]}>
              Name <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  borderColor: errors.name ? colors.danger : colors.border,
                },
              ]}
            >
              <Text style={styles.fieldIcon}>👤</Text>
              <TextInput
                placeholder="Enter full name (e.g. John Doe)"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                autoCapitalize="words"
                style={[styles.textInput, { color: colors.text }]}
              />
              {name ? (
                <TouchableOpacity onPress={() => setName('')}>
                  <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {errors.name ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>
            ) : null}
          </View>

          {/* FIELD 2: EMAIL ADDRESS */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : '#374151' }]}>
              Email Address <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  borderColor: errors.email ? colors.danger : colors.border,
                },
              ]}
            >
              <Text style={styles.fieldIcon}>✉️</Text>
              <TextInput
                placeholder="Enter email (e.g. john.doe@example.com)"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.textInput, { color: colors.text }]}
              />
              {email ? (
                <TouchableOpacity onPress={() => setEmail('')}>
                  <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {errors.email ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.email}</Text>
            ) : null}
          </View>

          {/* FIELD 3: BIRTHDATE PICKER */}
          <CustomDatePicker
            value={birthdate}
            onChange={date => {
              setBirthdate(date);
              if (errors.birthdate) setErrors(prev => ({ ...prev, birthdate: undefined }));
            }}
            label="Birthdate Picker"
            placeholder="Select your birthdate"
            error={errors.birthdate}
          />

          {/* FIELD 4: COUNTRY SELECTOR */}
          <CustomCountryPicker
            value={country}
            onChange={c => {
              setCountry(c);
              if (errors.country) setErrors(prev => ({ ...prev, country: undefined }));
            }}
            label="Country Selector"
            placeholder="Select your country"
            error={errors.country}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.submitButtonText}>Save Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleReset}
              style={[styles.resetButton, { backgroundColor: isDark ? colors.surface : '#F1F5F9', borderColor: colors.border }]}
            >
              <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>
                Clear Form
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Summary Preview Card */}
        {name || email || birthdate || country ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Live Form Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Name:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{name || 'Not provided'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{email || 'Not provided'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Birthdate:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {birthdate
                  ? birthdate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not selected'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Country:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {country ? `${country.flag} ${country.name}` : 'Not selected'}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  headerBlock: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
  },
  clearBtn: {
    fontSize: 15,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 10,
    gap: 10,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SettingsScreen;
