import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { launchImageLibrary } from 'react-native-image-picker';

export interface DeviceDetails {
  os: string;
  osVersion: string;
  deviceId: string;
  brand: string;
  model: string;
  deviceType: string;
  appVersion: string;
  isEmulator: boolean;
}

export interface SelectedPhoto {
  uri: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

export const useHomeScreen = () => {
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
  const [isOpeningGallery, setIsOpeningGallery] = useState<boolean>(false);

  // Check if photo permission is granted on Android
  const checkPhotoPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const androidVersion = Platform.Version as number;
    try {
      if (androidVersion >= 33) {
        const hasImages = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        if (hasImages) {
          return true;
        }

        if (
          androidVersion >= 34 &&
          (PermissionsAndroid.PERMISSIONS as any).READ_MEDIA_VISUAL_USER_SELECTED
        ) {
          const hasPartial = await PermissionsAndroid.check(
            (PermissionsAndroid.PERMISSIONS as any).READ_MEDIA_VISUAL_USER_SELECTED,
          );
          if (hasPartial) {
            return true;
          }
        }
        return false;
      }

      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    } catch (err) {
      console.warn('Error checking photo permission:', err);
      return false;
    }
  };

  // Request photo permission from user
  const requestPhotoPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const androidVersion = Platform.Version as number;
    try {
      if (androidVersion >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photos Access Permission',
            message:
              'MyTestAp requires access to your photos to allow you to select and view images.',
            buttonPositive: 'Allow',
            buttonNegative: "Don't allow",
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Photos Access Permission',
          message:
            'MyTestAp requires access to your photos to allow you to select and view images.',
          buttonPositive: 'Allow',
          buttonNegative: "Don't allow",
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting photo permission:', err);
      return false;
    }
  };

  // Check and request photo permission if not already granted
  const checkAndRequestPhotoPermission = async (): Promise<boolean> => {
    const hasPermission = await checkPhotoPermission();
    if (!hasPermission) {
      return await requestPhotoPermission();
    }
    return true;
  };

  // Fetch device hardware and operating system details
  const loadDeviceDetails = async () => {
    setIsLoadingDetails(true);

    try {
      const os = DeviceInfo.getSystemName();
      const osVersion = DeviceInfo.getSystemVersion();
      const deviceId = await DeviceInfo.getUniqueId();
      const brand = DeviceInfo.getBrand();
      const model = DeviceInfo.getModel();
      const deviceType = DeviceInfo.getDeviceType();
      const appVersion = `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`;
      const isEmulator = await DeviceInfo.isEmulator();

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

  // Launch photo library to pick an image
  const handleOpenPhotos = async () => {
    setIsOpeningGallery(true);

    try {
      const hasPermission = await checkPhotoPermission();
      if (!hasPermission) {
        const granted = await requestPhotoPermission();
        if (!granted) {
          Alert.alert(
            'Permission Denied',
            'Photos access permission is required to select images from your gallery.',
            [{ text: 'OK' }],
          );
          setIsOpeningGallery(false);
          return;
        }
      }

      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert(
          'Image Picker Error',
          response.errorMessage || 'Failed to open gallery.',
        );
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
      Alert.alert(
        'Error',
        'An unexpected error occurred while accessing the gallery.',
      );
    } finally {
      setIsOpeningGallery(false);
    }
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
  };

  // On mount: load device details and check/ask photo permission
  useEffect(() => {
    loadDeviceDetails();

    const timer = setTimeout(() => {
      checkAndRequestPhotoPermission();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    isLoadingDetails,
    deviceDetails,
    selectedPhoto,
    isOpeningGallery,
    loadDeviceDetails,
    handleOpenPhotos,
    handleClearPhoto,
  };
};

export default useHomeScreen;
