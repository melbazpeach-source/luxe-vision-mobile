import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  StyleReference,
  getStyleLibrary,
  mixStyles,
  applyMixedStylesToPrompt,
  saveStyleToLibrary,
} from '@/lib/style-transfer';

interface SelectedStyle {
  style: StyleReference;
  ratio: number;
}

export default function StyleMixerScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');

  const [library, setLibrary] = useState<StyleReference[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<SelectedStyle[]>([]);
  const [mixName, setMixName] = useState('');
  const [basePrompt, setBasePrompt] = useState('');
  const [intensity, setIntensity] = useState(100);
  const [mixedPrompt, setMixedPrompt] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    updateMixedPrompt();
  }, [selectedStyles, basePrompt, intensity]);

  const loadLibrary = async () => {
    const styles = await getStyleLibrary('');
    setLibrary(styles);
  };

  const handleSelectStyle = (style: StyleReference) => {
    if (selectedStyles.length >= 4) {
      Alert.alert('Limit Reached', 'You can mix up to 4 styles at once');
      return;
    }

    if (selectedStyles.some(s => s.style.id === style.id)) {
      Alert.alert('Already Selected', 'This style is already in the mix');
      return;
    }

    // Add with equal ratio
    const newRatio = 100 / (selectedStyles.length + 1);
    const updatedStyles = selectedStyles.map(s => ({
      ...s,
      ratio: newRatio,
    }));

    setSelectedStyles([...updatedStyles, { style, ratio: newRatio }]);
  };

  const handleRemoveStyle = (styleId: string) => {
    const filtered = selectedStyles.filter(s => s.style.id !== styleId);
    
    // Redistribute ratios equally
    if (filtered.length > 0) {
      const newRatio = 100 / filtered.length;
      const redistributed = filtered.map(s => ({ ...s, ratio: newRatio }));
      setSelectedStyles(redistributed);
    } else {
      setSelectedStyles([]);
    }
  };

  const handleRatioChange = (styleId: string, newRatio: number) => {
    const updated = selectedStyles.map(s =>
      s.style.id === styleId ? { ...s, ratio: newRatio } : s
    );
    setSelectedStyles(updated);
  };

  const normalizeRatios = () => {
    const total = selectedStyles.reduce((sum, s) => sum + s.ratio, 0);
    if (total === 0) return;

    const normalized = selectedStyles.map(s => ({
      ...s,
      ratio: (s.ratio / total) * 100,
    }));
    setSelectedStyles(normalized);
  };

  const updateMixedPrompt = () => {
    if (selectedStyles.length === 0 || !basePrompt.trim()) {
      setMixedPrompt('');
      return;
    }

    try {
      const styles = selectedStyles.map(s => s.style);
      const ratios = selectedStyles.map(s => s.ratio);
      const mixedFeatures = mixStyles(styles, ratios);
      const prompt = applyMixedStylesToPrompt(basePrompt, mixedFeatures, intensity);
      setMixedPrompt(prompt);
    } catch (error) {
      console.error('Error mixing styles:', error);
    }
  };

  const handleSaveMix = async () => {
    if (!mixName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this style mix');
      return;
    }

    if (selectedStyles.length < 2) {
      Alert.alert('Not Enough Styles', 'Select at least 2 styles to create a mix');
      return;
    }

    try {
      const styles = selectedStyles.map(s => s.style);
      const ratios = selectedStyles.map(s => s.ratio);
      const mixedFeatures = mixStyles(styles, ratios);

      const mixedStyle: StyleReference = {
        id: `mix_${Date.now()}`,
        name: mixName,
        imageUrl: selectedStyles[0].style.imageUrl, // Use first style's image
        extractedFeatures: mixedFeatures,
        createdAt: Date.now(),
        userId: 'demo',
      };

      await saveStyleToLibrary(mixedStyle);
      Alert.alert('Success', 'Style mix saved to library!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save style mix');
    }
  };

  const totalRatio = selectedStyles.reduce((sum, s) => sum + s.ratio, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom + 16, 32),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ fontSize: 28 }}>←</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.title}>
            Style Mixer
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>

        {/* Selected Styles */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Selected Styles ({selectedStyles.length}/4)
          </ThemedText>

          {selectedStyles.length === 0 ? (
            <View style={[styles.emptyCard, { borderColor }]}>
              <ThemedText style={styles.emptyText}>
                Select styles from your library to mix
              </ThemedText>
            </View>
          ) : (
            <>
              {selectedStyles.map((item) => (
                <View key={item.style.id} style={[styles.selectedStyleCard, { borderColor }]}>
                  <View style={styles.styleHeader}>
                    <ThemedText type="defaultSemiBold">{item.style.name}</ThemedText>
                    <Pressable onPress={() => handleRemoveStyle(item.style.id)}>
                      <ThemedText style={styles.removeButton}>✕</ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.ratioControl}>
                    <ThemedText style={styles.ratioLabel}>
                      Ratio: {item.ratio.toFixed(0)}%
                    </ThemedText>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={100}
                      value={item.ratio}
                      onValueChange={(value: number) => handleRatioChange(item.style.id, value)}
                      onSlidingComplete={normalizeRatios}
                      minimumTrackTintColor={tintColor}
                      maximumTrackTintColor={borderColor}
                    />
                  </View>
                </View>
              ))}

              {totalRatio !== 100 && (
                <Pressable
                  style={[styles.normalizeButton, { backgroundColor: tintColor }]}
                  onPress={normalizeRatios}
                >
                  <ThemedText style={styles.normalizeButtonText}>
                    Normalize Ratios (Total: {totalRatio.toFixed(0)}%)
                  </ThemedText>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Style Library */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Style Library
          </ThemedText>

          {library.length === 0 ? (
            <View style={[styles.emptyCard, { borderColor }]}>
              <ThemedText style={styles.emptyText}>
                No styles in library. Add styles from the Style Library screen.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.libraryGrid}>
              {library.map((style) => {
                const isSelected = selectedStyles.some(s => s.style.id === style.id);
                return (
                  <Pressable
                    key={style.id}
                    style={[
                      styles.libraryItem,
                      { borderColor },
                      isSelected && { borderColor: tintColor, borderWidth: 2 },
                    ]}
                    onPress={() => handleSelectStyle(style)}
                    disabled={isSelected}
                  >
                    <ThemedText style={styles.libraryItemName} numberOfLines={1}>
                      {style.name}
                    </ThemedText>
                    {isSelected && (
                      <ThemedText style={styles.selectedBadge}>✓</ThemedText>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Mix Preview */}
        {selectedStyles.length >= 2 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Mix Preview
            </ThemedText>

            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
              placeholder="Enter base prompt..."
              placeholderTextColor={borderColor}
              value={basePrompt}
              onChangeText={setBasePrompt}
              multiline
            />

            <View style={styles.intensityControl}>
              <ThemedText style={styles.label}>
                Style Intensity: {intensity}%
              </ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={intensity}
                onValueChange={setIntensity}
                minimumTrackTintColor={tintColor}
                maximumTrackTintColor={borderColor}
              />
            </View>

            {mixedPrompt && (
              <View style={[styles.previewCard, { borderColor }]}>
                <ThemedText style={styles.previewLabel}>Mixed Prompt:</ThemedText>
                <ThemedText style={styles.previewText}>{mixedPrompt}</ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Save Mix */}
        {selectedStyles.length >= 2 && (
          <View style={styles.section}>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
              placeholder="Name this style mix..."
              placeholderTextColor={borderColor}
              value={mixName}
              onChangeText={setMixName}
            />

            <Pressable
              style={[styles.saveButton, { backgroundColor: tintColor }]}
              onPress={handleSaveMix}
            >
              <ThemedText style={styles.saveButtonText}>
                Save Style Mix
              </ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  selectedStyleCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  styleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeButton: {
    fontSize: 20,
    opacity: 0.6,
  },
  ratioControl: {
    gap: 8,
  },
  ratioLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  normalizeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  normalizeButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  libraryItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minWidth: '30%',
    alignItems: 'center',
  },
  libraryItemName: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedBadge: {
    fontSize: 16,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  intensityControl: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
