import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as base64Decode } from 'base-64';
import { useAuthStore } from '@/state/authStore';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import { InputField } from '@/components/atoms/input-field';
import { supabase } from '@/lib/supabaseClient';
import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';

export const EditProfileScreen = ({ navigation }: any) => {
  const profile = useAuthStore((state) => state.profile);
  const authMobile = useAuthStore((state) => state.mobile);
  const updateProfile = useAuthStore((state) => state.actions.updateProfile);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(profile?.avatarUrl || null);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    mobile: profile?.mobile || authMobile || '',
    email: (profile as any)?.email || '',
    address: (profile as any)?.village || '', // Using village as address for now
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('Error', 'Failed to pick image: ' + (error as any).message);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!supabase) {
        console.warn('Supabase not configured');
        return null;
    }
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const binary = base64Decode(base64);
      const buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        buffer[i] = binary.charCodeAt(i);
      }

      // Use 'anonymous' folder but identify file by mobile number to ensure uniqueness and persistence
      // This matches the user's request to keep it in anonymous folder
      const mobileToUse = formData.mobile || profile?.mobile || authMobile;
      const normalizedMobile = mobileToUse ? mobileToUse.replace(/[^0-9]/g, '') : 'unknown';
      const fileName = `anonymous/${normalizedMobile}.jpg`;
      
      const { error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      // Add timestamp to bypass cache
      const { data } = supabase.storage.from('profile-images').getPublicUrl(fileName);
      return `${data.publicUrl}?t=${Date.now()}`;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = profile?.avatarUrl;

      if (imageUri && imageUri !== profile?.avatarUrl) {
        const uploadedUrl = await uploadImage(imageUri);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      if (profile || authMobile) {
        const updatedProfile = {
            ...(profile || {}),
            id: profile?.id || authMobile || 'unknown',
            role: profile?.role || 'beneficiary',
            name: formData.name,
            mobile: formData.mobile,
            avatarUrl: avatarUrl,
            // email and address are not in UserProfile yet, so we can't save them to store properly without type update
            // but for now we just update what we can
            village: formData.address, // Mapping address to village for demo
            // @ts-ignore
            email: formData.email,
        };

        // Save to DB if beneficiary
        if (updatedProfile.role === 'beneficiary') {
            try {
                await beneficiaryRepository.updateProfile(updatedProfile.mobile, updatedProfile);
            } catch (error) {
                console.warn('Failed to persist profile to DB:', error);
                // Continue to update local state so user sees the change
            }
        }

        updateProfile(updatedProfile as any);
      }
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Edit Profile</AppText>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: imageUri || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                    style={styles.profileImage} 
                />
                <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
                    <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <AppText style={styles.changePhotoText}>Change Profile Photo</AppText>
        </View>

        <View style={styles.form}>
            <InputField
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Enter your full name"
            />
            
            <InputField
                label="Phone Number"
                value={formData.mobile}
                onChangeText={(text) => handleChange('mobile', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
            />

            <InputField
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Enter your email"
                keyboardType="email-address"
            />

            <InputField
                label="Address (Village)"
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Enter your village/address"
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
            />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton 
            label="Save Changes" 
            onPress={handleSave} 
            loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#008080',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  changePhotoText: {
    color: '#008080',
    fontWeight: '500',
  },
  form: {
    gap: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
