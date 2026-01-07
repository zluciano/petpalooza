import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Button, Input, Select, DatePicker } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { usePetStore } from '../../store/petStore';
import { supabase } from '../../services/supabase';
import type { PetType } from '../../types';

type Props = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any>;
};

const petTypeOptions = [
  { label: 'Dog', value: 'dog', icon: '🐕' },
  { label: 'Cat', value: 'cat', icon: '🐱' },
  { label: 'Fish', value: 'fish', icon: '🐟' },
  { label: 'Snake', value: 'snake', icon: '🐍' },
  { label: 'Bird', value: 'bird', icon: '🐦' },
  { label: 'Rabbit', value: 'rabbit', icon: '🐰' },
  { label: 'Hamster', value: 'hamster', icon: '🐹' },
  { label: 'Turtle', value: 'turtle', icon: '🐢' },
  { label: 'Other', value: 'other', icon: '🐾' },
];

const weightUnitOptions = [
  { label: 'Kilograms (kg)', value: 'kg' },
  { label: 'Pounds (lb)', value: 'lb' },
];

const sizeUnitOptions = [
  { label: 'Centimeters (cm)', value: 'cm' },
  { label: 'Inches (in)', value: 'in' },
];

export function EditPetScreen({ navigation, route }: Props) {
  const { selectedPet, updatePet, loading } = usePetStore();
  const pet = selectedPet;

  const [name, setName] = useState(pet?.name || '');
  const [type, setType] = useState<PetType>(pet?.type || 'dog');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    pet?.date_of_birth ? new Date(pet.date_of_birth) : undefined
  );
  const [weight, setWeight] = useState(pet?.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(pet?.weight_unit || 'kg');
  const [size, setSize] = useState(pet?.size?.toString() || '');
  const [sizeUnit, setSizeUnit] = useState<'cm' | 'in'>(pet?.size_unit || 'cm');
  const [color, setColor] = useState(pet?.color || '');
  const [microchipId, setMicrochipId] = useState(pet?.microchip_id || '');
  const [notes, setNotes] = useState(pet?.notes || '');
  const [photoUri, setPhotoUri] = useState<string | null>(pet?.photo_url || null);
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const filename = `${Date.now()}.jpg`;
      const path = `pet-photos/${filename}`;

      const { error } = await supabase.storage
        .from('pets')
        .upload(path, decode(base64), { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('pets')
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const validate = () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Pet name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setUploading(true);
    let photoUrl = photoUri;

    if (newPhotoUri) {
      const url = await uploadPhoto(newPhotoUri);
      if (url) photoUrl = url;
    }

    const result = await updatePet(pet.id, {
      name: name.trim(),
      type,
      breed: breed.trim() || undefined,
      date_of_birth: dateOfBirth?.toISOString().split('T')[0],
      weight: weight ? parseFloat(weight) : undefined,
      weight_unit: weightUnit,
      size: size ? parseFloat(size) : undefined,
      size_unit: sizeUnit,
      color: color.trim() || undefined,
      microchip_id: microchipId.trim() || undefined,
      photo_url: photoUrl || undefined,
      notes: notes.trim() || undefined,
    });

    setUploading(false);

    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      navigation.goBack();
    }
  };

  const showSizeField = type === 'snake' || type === 'fish' || type === 'turtle';
  const displayPhotoUri = newPhotoUri || photoUri;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {displayPhotoUri ? (
              <Image source={{ uri: displayPhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Text style={styles.photoEditIcon}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Input
            label="Pet Name *"
            value={name}
            onChangeText={setName}
            placeholder="What's your pet's name?"
            error={errors.name}
          />

          <Select
            label="Pet Type"
            value={type}
            options={petTypeOptions}
            onChange={(value) => setType(value as PetType)}
          />

          <Input
            label="Breed"
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g., Golden Retriever"
          />

          <DatePicker
            label="Date of Birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            placeholder="When was your pet born?"
            maximumDate={new Date()}
          />

          <View style={styles.row}>
            <View style={styles.rowField}>
              <Input
                label="Weight"
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.rowFieldSmall}>
              <Select
                label="Unit"
                value={weightUnit}
                options={weightUnitOptions}
                onChange={(value) => setWeightUnit(value as 'kg' | 'lb')}
              />
            </View>
          </View>

          {showSizeField && (
            <View style={styles.row}>
              <View style={styles.rowField}>
                <Input
                  label="Size/Length"
                  value={size}
                  onChangeText={setSize}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.rowFieldSmall}>
                <Select
                  label="Unit"
                  value={sizeUnit}
                  options={sizeUnitOptions}
                  onChange={(value) => setSizeUnit(value as 'cm' | 'in')}
                />
              </View>
            </View>
          )}

          <Input
            label="Color/Markings"
            value={color}
            onChangeText={setColor}
            placeholder="e.g., Brown with white spots"
          />

          <Input
            label="Microchip ID"
            value={microchipId}
            onChangeText={setMicrochipId}
            placeholder="Enter microchip number if available"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information about your pet"
            multiline={true}
            numberOfLines={3}
            style={styles.notesInput}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading || uploading}
            size="lg"
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  photoText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  photoEditIcon: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 2,
  },
  rowFieldSmall: {
    flex: 1,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
