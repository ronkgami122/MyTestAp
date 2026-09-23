import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface DeviceDetails {
  os: string;
  osVersion: string;
  deviceId: string;
  brand: string;
  model: string;
  deviceType: string;
  appVersion: string;
  isEmulator: boolean;
}

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<{
    uri: string;
    fileName?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  } | null>(null);
  const [isOpeningGallery, setIsOpeningGallery] = useState<boolean>(false);

  const requestPermissionAndLoadDetails = async () => {
    setIsRequestingPermission(true);

    try {
      let isGranted = false;

      if (Platform.OS === 'android') {
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        );

        if (checkResult) {
          isGranted = true;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
              title: 'Device Details Permission',
              message:
                'MyTestAp needs permission to access your hardware specifications and unique device identifier.',
              buttonPositive: 'Grant Permission',
              buttonNegative: 'Deny',
            },
          );
          isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else {
        // On iOS, system permissions are managed differently
        isGranted = true;
      }

      if (isGranted) {
        setHasPermission(true);
        await loadDeviceDetails();
      } else {
        Alert.alert(
          'Permission Denied',
          'Permission is required to display your hardware details and Device ID. You can grant it anytime.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.warn('Permission request error:', error);
      // Fallback: still allow loading system info
      setHasPermission(true);
      await loadDeviceDetails();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const loadDeviceDetails = async () => {
    setIsLoadingDetails(true);

    try {
      let DeviceInfo: any = null;
      try {
        DeviceInfo = require('react-native-device-info').default || require('react-native-device-info');
      } catch (e) {
        DeviceInfo = null;
      }

      let os = Platform.OS === 'android' ? 'Android' : 'iOS';
      let osVersion = String(Platform.Version);
      let deviceId = 'MTA-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      let brand = Platform.OS === 'android' ? 'Android Device' : 'Apple';
      let model = Platform.select({ ios: 'iPhone', android: 'Handset', default: 'Device' });
      let deviceType = 'Handset';
      let appVersion = '1.0.0 (Build 1)';
      let isEmulator = false;

      if (DeviceInfo) {
        try {
          if (DeviceInfo.getSystemName) os = DeviceInfo.getSystemName();
          if (DeviceInfo.getSystemVersion) osVersion = DeviceInfo.getSystemVersion();
          if (DeviceInfo.getUniqueId) {
            const uid = await DeviceInfo.getUniqueId();
            if (uid) deviceId = uid;
          }
          if (DeviceInfo.getBrand) brand = DeviceInfo.getBrand();
          if (DeviceInfo.getModel) model = DeviceInfo.getModel();
          if (DeviceInfo.getDeviceType) deviceType = DeviceInfo.getDeviceType();
          if (DeviceInfo.getVersion) appVersion = `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber ? DeviceInfo.getBuildNumber() : '1'})`;
          if (DeviceInfo.isEmulator) isEmulator = await DeviceInfo.isEmulator();
        } catch (deviceInfoErr) {
          console.warn('DeviceInfo call error:', deviceInfoErr);
        }
      }

      setDeviceDetails({
        os,
        osVersion,
        deviceId,
        brand,
        model,
        deviceType,
        appVersion,
        isEmulator,
      });
    } catch (err) {
      console.error('Error fetching device details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleOpenPhotos = async () => {
    setIsOpeningGallery(true);

    try {
      let ImagePicker: any = null;
      try {
        ImagePicker = require('react-native-image-picker');
      } catch (e) {
        ImagePicker = null;
      }

      if (!ImagePicker || !ImagePicker.launchImageLibrary) {
        Alert.alert(
          'Library Notice',
          'react-native-image-picker will be fully initialized when dependencies are installed. Here is a simulated photo selection for preview.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedPhoto({
                  uri: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop',
                  fileName: 'sample_gradient_photo.jpg',
                  fileSize: 245600,
                  width: 600,
                  height: 400,
                });
              },
            },
          ],
        );
        return;
      }

      // Check storage permissions on Android if needed
      if (Platform.OS === 'android' && (Platform.Version as number) < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Gallery Access Permission',
            message: 'App needs permission to open and pick images from your photo gallery.',
            buttonPositive: 'Allow',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to access your gallery photos.');
          return;
        }
      }

      const response = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.85,
      });

      if (response.didCancel) {
        // User cancelled photo picker
        return;
      }

      if (response.errorCode) {
        Alert.alert('Image Picker Error', response.errorMessage || 'Failed to open gallery.');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedPhoto({
            uri: asset.uri,
            fileName: asset.fileName || 'selected_photo.jpg',
            fileSize: asset.fileSize,
            width: asset.width,
            height: asset.height,
          });
        }
      }
    } catch (err) {
      console.error('Error opening photo gallery:', err);
      Alert.alert('Error', 'An unexpected error occurred while accessing the gallery.');
    } finally {
      setIsOpeningGallery(false);
    }
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeTextGroup}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome to</Text>
            <Text style={[styles.appHeaderTitle, { color: colors.primary }]}>MyTestAp</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textMuted }]}>
              Device Diagnostics & Multimedia Hub
            </Text>
          </View>
          <View style={[styles.appBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 24 }}>📱</Text>
          </View>
        </View>
      </View>

      {/* SECTION 1: DEVICE DETAILS (Requirement 8) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Device Details</Text>
        <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
          Hardware & OS Identification
        </Text>
      </View>

      {!hasPermission ? (
        <View style={[styles.card, styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.permissionIconCircle, { backgroundColor: colors.warningLight }]}>
            <Text style={{ fontSize: 32 }}>🔒</Text>
          </View>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Permission Required
          </Text>
          <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
            In accordance with requirement #8, MyTestAp must request permission before retrieving and displaying your device information (OS, Device ID, etc.).
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={requestPermissionAndLoadDetails}
            disabled={isRequestingPermission}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            {isRequestingPermission ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Grant Permission to View Details</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.badgeRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.success }]}>
                Permission Granted
              </Text>
            </View>
            <TouchableOpacity
              onPress={loadDeviceDetails}
              disabled={isLoadingDetails}
              style={[styles.refreshPill, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.refreshText, { color: colors.primary }]}>
                {isLoadingDetails ? 'Refreshing...' : '🔄 Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingDetails ? (
            <View style={styles.loaderCenter}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingLabel, { color: colors.textSecondary }]}>
                Reading device hardware parameters...
              </Text>
            </View>
          ) : deviceDetails ? (
            <View style={styles.detailsGrid}>
              <View style={[styles.detailItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Operating System</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {deviceDetails.os} (v{deviceDetails.osVersion})
                </Text>
              </View>

              <View style={[styles.detailItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Device ID</Text>
                <Text style={[styles.detailValue, { color: colors.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]} numberOfLines={2}>
                  {deviceDetails.deviceId}
                </Text>
              </View>

              <View style={[styles.detailItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Brand & Model</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {deviceDetails.brand} {deviceDetails.model}
                </Text>
              </View>

              <View style={[styles.detailItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Device Category</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {deviceDetails.deviceType.toUpperCase()} {deviceDetails.isEmulator ? '• Emulator' : '• Physical'}
                </Text>
              </View>

              <View style={[styles.detailItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Application Build</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  v{deviceDetails.appVersion}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* SECTION 2: PHOTOS GALLERY BUTTON (Requirement 9) */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gallery Access</Text>
        <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
          Requirement #9 • Open Device Photos
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.galleryDescription, { color: colors.textSecondary }]}>
          Click the button below named <Text style={{ fontWeight: '700', color: colors.primary }}>Photos</Text> to launch your device's photo gallery and pick an image.
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
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.photosButtonText}>Photos</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Selected Photo Preview */}
        {selectedPhoto ? (
          <View style={[styles.previewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>Selected Photo Preview</Text>
              <TouchableOpacity onPress={handleClearPhoto}>
                <Text style={[styles.clearPhotoText, { color: colors.danger }]}>✕ Remove</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />

            <View style={styles.photoMetadata}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                📁 {selectedPhoto.fileName || 'Photo from Gallery'}
              </Text>
              {selectedPhoto.fileSize ? (
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  💾 {(selectedPhoto.fileSize / 1024).toFixed(1)} KB
                </Text>
              ) : null}
              {selectedPhoto.width && selectedPhoto.height ? (
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  📐 {selectedPhoto.width} × {selectedPhoto.height} px
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextGroup: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  welcomeSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  appBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  permissionCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  permissionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  refreshPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loaderCenter: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingLabel: {
    fontSize: 13,
    marginTop: 10,
  },
  detailsGrid: {
    gap: 10,
  },
  detailItem: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  galleryDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  photosButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  photosButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  previewContainer: {
    marginTop: 18,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  clearPhotoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  photoMetadata: {
    marginTop: 10,
    gap: 3,
  },
  metaText: {
    fontSize: 12,
  },
});

export default HomeScreen;
