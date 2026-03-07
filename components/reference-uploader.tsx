import React, { useState } from 'react';
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface ReferenceImage {
  uri: string;
  base64?: string;
  mimeType: string;
  name: string;
}

interface ReferenceUploaderProps {
  references: ReferenceImage[];
  onReferencesChange: (refs: ReferenceImage[]) => void;
  maxCount?: number;
  label?: string;
}

export function ReferenceUploader({
  references,
  onReferencesChange,
  maxCount = 3,
  label = 'Reference Images',
}: ReferenceUploaderProps) {
  const [loading, setLoading] = useState(false);
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: '#F5F5F5', dark: '#1A1A1A' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const pickImage = async (source: 'library' | 'camera') => {
    if (references.length >= maxCount) {
      Alert.alert('Limit Reached', `You can add up to ${maxCount} reference images.`);
      return;
    }

    setLoading(true);
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is needed to capture reference images.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library access is needed to pick reference images.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: maxCount - references.length,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets.length > 0) {
        const newRefs: ReferenceImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
          mimeType: asset.mimeType ?? 'image/jpeg',
          name: asset.fileName ?? `reference_${Date.now()}.jpg`,
        }));

        const combined = [...references, ...newRefs].slice(0, maxCount);
        onReferencesChange(combined);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeReference = (index: number) => {
    const updated = references.filter((_, i) => i !== index);
    onReferencesChange(updated);
  };

  const showPickerOptions = () => {
    if (Platform.OS === 'web') {
      pickImage('library');
      return;
    }
    Alert.alert('Add Reference', 'Choose a source', [
      { text: 'Photo Library', onPress: () => pickImage('library') },
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={[styles.counter, { color: borderColor }]}>
          {references.length}/{maxCount}
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {/* Existing reference thumbnails */}
        {references.map((ref, index) => (
          <View key={index} style={[styles.thumbnail, { borderColor }]}>
            <Image source={{ uri: ref.uri }} style={styles.thumbnailImage} />
            <Pressable
              style={[styles.removeButton, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
              onPress={() => removeReference(index)}
              hitSlop={8}
            >
              <ThemedText style={styles.removeIcon}>✕</ThemedText>
            </Pressable>
            <View style={[styles.indexBadge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.indexText}>{index + 1}</ThemedText>
            </View>
          </View>
        ))}

        {/* Add button */}
        {references.length < maxCount && (
          <Pressable
            style={[styles.addButton, { borderColor, backgroundColor }]}
            onPress={showPickerOptions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <>
                <ThemedText style={[styles.addIcon, { color: tintColor }]}>+</ThemedText>
                <ThemedText style={[styles.addLabel, { color: borderColor }]}>
                  Add Ref
                </ThemedText>
              </>
            )}
          </Pressable>
        )}
      </View>

      {references.length > 0 && (
        <ThemedText style={[styles.hint, { color: borderColor }]}>
          References guide the AI style, composition, and content of your generation.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  counter: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  indexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  addButton: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  addLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
    opacity: 0.8,
  },
});
