import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../context/ThemeContext';
import { useHomeScreen } from './useHomeScreen';
import { styles } from './styles';

export const HomeScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const {
    isLoadingDetails,
    deviceDetails,
    selectedPhoto,
    isOpeningGallery,
    handleOpenPhotos,
    handleClearPhoto,
  } = useHomeScreen();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* SECTION 1: DEVICE DETAILS (Requirement 8) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Device Details
        </Text>
        <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
          Hardware & OS Identification
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {isLoadingDetails ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text
              style={[styles.loadingLabel, { color: colors.textSecondary }]}
            >
              Reading device hardware parameters...
            </Text>
          </View>
        ) : deviceDetails ? (
          <View style={styles.detailsGrid}>
            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <Ionicons
                  name="logo-android"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Operating System
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {deviceDetails.os} (v{deviceDetails.osVersion})
              </Text>
            </View>

            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <Ionicons
                  name="finger-print-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Device ID
                </Text>
              </View>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.primary,
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  },
                ]}
                numberOfLines={2}
              >
                {deviceDetails.deviceId}
              </Text>
            </View>

            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Brand & Model
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {deviceDetails.brand} {deviceDetails.model}
              </Text>
            </View>

            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Device Category
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {deviceDetails.deviceType.toUpperCase()}{' '}
                {deviceDetails.isEmulator ? '• Emulator' : '• Physical'}
              </Text>
            </View>

            <View
              style={[
                styles.detailItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <Ionicons
                  name="code-slash-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Application Build
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                v{deviceDetails.appVersion}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* SECTION 2: PHOTOS GALLERY BUTTON (Requirement 9) */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Gallery Access
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.galleryDescription, { color: colors.textSecondary }]}
        >
          Tap on below button to launch your device's photo gallery and pick an
          image.
        </Text>

        {/* REQUIRED: "Button named photos" */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenPhotos}
          disabled={isOpeningGallery}
          style={[styles.photosButton, { backgroundColor: colors.primary }]}
        >
          {isOpeningGallery ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonInner}>
              <Ionicons name="images" size={20} color="#FFFFFF" />
              <Text style={styles.photosButtonText}>Photos</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Selected Photo Preview */}
        {selectedPhoto ? (
          <View
            style={[
              styles.previewContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.previewHeader}>
              <View style={styles.previewTitleRow}>
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  Selected Photo Preview
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClearPhoto}
                style={[
                  styles.clearPhotoButton,
                  { borderColor: colors.danger },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={13}
                  color={colors.danger}
                />
                <Text style={[styles.clearPhotoText, { color: colors.danger }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
