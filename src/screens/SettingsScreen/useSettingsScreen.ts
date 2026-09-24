import { useState } from 'react';
import { Alert } from 'react-native';
import { Country } from '../../components/CustomCountryPicker';

export interface FormErrors {
  name?: string;
  email?: string;
  birthdate?: string;
  country?: string;
}

export const useSettingsScreen = () => {
  // Form State for the 4 required fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [country, setCountry] = useState<Country | null>(null);

  // Form Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  const handleNameChange = (text: string) => {
    setName(text);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleBirthdateChange = (date: Date | null) => {
    setBirthdate(date);
    if (errors.birthdate) {
      setErrors(prev => ({ ...prev, birthdate: undefined }));
    }
  };

  const handleCountryChange = (selectedCountry: Country | null) => {
    setCountry(selectedCountry);
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
      Alert.alert(
        'Profile Saved Successfully',
        'Your profile changes have been saved successfully.',
        [{ text: 'Ok' }],
      );
    } else {
      Alert.alert(
        'Incomplete Form',
        'Please correct the highlighted fields before submitting.',
      );
    }
  };

  return {
    name,
    setName,
    handleNameChange,
    email,
    setEmail,
    handleEmailChange,
    birthdate,
    setBirthdate,
    handleBirthdateChange,
    country,
    setCountry,
    handleCountryChange,
    errors,
    handleSubmit,
  };
};
