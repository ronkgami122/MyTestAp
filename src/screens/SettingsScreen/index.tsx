import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../context/ThemeContext';
import CustomDatePicker from '../../components/CustomDatePicker';
import CustomCountryPicker from '../../components/CustomCountryPicker';
import { useSettingsScreen } from './useSettingsScreen';
import { styles } from './styles';

export const SettingsScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const {
    name,
    handleNameChange,
    email,
    handleEmailChange,
    birthdate,
    handleBirthdateChange,
    country,
    handleCountryChange,
    errors,
    handleSubmit,
  } = useSettingsScreen();

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
          <Text style={[styles.heading, { color: colors.text }]}>
            Profile Information
          </Text>
        </View>

        {/* Form Container Card */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* FIELD 1: NAME */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.fieldLabel,
                { color: isDark ? colors.textSecondary : '#374151' },
              ]}
            >
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
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.primary}
                style={styles.fieldIcon}
              />
              <TextInput
                placeholder="Enter full name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={handleNameChange}
                autoCapitalize="words"
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.name ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.name}
              </Text>
            ) : null}
          </View>

          {/* FIELD 2: EMAIL ADDRESS */}
          <View style={styles.fieldGroup}>
            <Text
              style={[
                styles.fieldLabel,
                { color: isDark ? colors.textSecondary : '#374151' },
              ]}
            >
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
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.primary}
                style={styles.fieldIcon}
              />
              <TextInput
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.textInput, { color: colors.text }]}
              />
            </View>
            {errors.email ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* FIELD 3: BIRTHDATE PICKER */}
          <CustomDatePicker
            value={birthdate}
            onChange={handleBirthdateChange}
            label="Birthdate Picker"
            placeholder="Select your birthdate"
            error={errors.birthdate}
          />

          {/* FIELD 4: COUNTRY SELECTOR */}
          <CustomCountryPicker
            value={country}
            onChange={handleCountryChange}
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
              <View style={styles.btnInner}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Save Profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsScreen;
