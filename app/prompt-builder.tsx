import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  PromptComponent,
  PromptPreset,
  PROMPT_COMPONENTS,
  PROMPT_PRESETS,
  buildPromptFromComponents,
  suggestEnhancements,
  estimatePromptQuality,
} from '@/lib/prompt-builder';

export default function PromptBuilderScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');

  const [selectedComponents, setSelectedComponents] = useState<PromptComponent[]>([]);
  const [customText, setCustomText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('presets');

  const categories = ['presets', 'lighting', 'mood', 'camera', 'style', 'quality'];

  const fullPrompt = buildPromptFromComponents(selectedComponents, customText);
  const suggestions = suggestEnhancements(fullPrompt);
  const qualityScore = estimatePromptQuality(fullPrompt);

  const handleAddComponent = (component: PromptComponent) => {
    if (!selectedComponents.find(c => c.id === component.id)) {
      setSelectedComponents([...selectedComponents, component]);
    }
  };

  const handleRemoveComponent = (componentId: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.id !== componentId));
  };

  const handleApplyPreset = (preset: PromptPreset) => {
    setSelectedComponents(preset.components);
    setActiveCategory('lighting');
  };

  const handleUsePrompt = () => {
    // Navigate back to Studio with the built prompt
    router.back();
    // TODO: Pass prompt back to Studio screen
  };

  const renderComponentCard = ({ item }: { item: PromptComponent }) => {
    const isSelected = selectedComponents.some(c => c.id === item.id);
    return (
      <Pressable
        style={[
          styles.componentCard,
          { borderColor },
          isSelected && { backgroundColor: tintColor, borderColor: tintColor },
        ]}
        onPress={() => isSelected ? handleRemoveComponent(item.id) : handleAddComponent(item)}
      >
        <ThemedText style={styles.componentIcon}>{item.icon}</ThemedText>
        <ThemedText
          style={[
            styles.componentLabel,
            isSelected && { color: '#000000' },
          ]}
          numberOfLines={2}
        >
          {item.label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderPresetCard = ({ item }: { item: PromptPreset }) => (
    <Pressable
      style={[styles.presetCard, { borderColor }]}
      onPress={() => handleApplyPreset(item)}
    >
      <View style={styles.presetInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.presetDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <ThemedText style={styles.presetCategory}>{item.category}</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
            borderBottomColor: borderColor,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ fontSize: 28 }}>←</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.title}>
            Smart Prompt Builder
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>

        {/* Quality Score */}
        <View style={styles.qualityBadge}>
          <ThemedText style={styles.qualityLabel}>Quality Score:</ThemedText>
          <View style={[styles.qualityBar, { borderColor }]}>
            <View
              style={[
                styles.qualityFill,
                {
                  width: `${qualityScore}%`,
                  backgroundColor: qualityScore > 70 ? '#4CAF50' : qualityScore > 40 ? '#FFC107' : '#FF5722',
                },
              ]}
            />
          </View>
          <ThemedText style={styles.qualityScore}>{qualityScore}%</ThemedText>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.categoryTab,
              { borderColor },
              activeCategory === cat && { backgroundColor: tintColor, borderColor: tintColor },
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <ThemedText
              style={[
                styles.categoryTabText,
                activeCategory === cat && { color: '#000000' },
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Components Grid */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom + 200, 220) },
        ]}
      >
        {activeCategory === 'presets' ? (
          <FlatList
            data={PROMPT_PRESETS}
            renderItem={renderPresetCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.presetsGrid}
          />
        ) : (
          <FlatList
            data={PROMPT_COMPONENTS[activeCategory] || []}
            renderItem={renderComponentCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.componentRow}
            contentContainerStyle={styles.componentsGrid}
          />
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={[styles.suggestionsBox, { borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.suggestionsTitle}>
              💡 AI Suggestions
            </ThemedText>
            {suggestions.map((suggestion, index) => (
              <ThemedText key={index} style={styles.suggestion}>
                • {suggestion}
              </ThemedText>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Panel */}
      <View
        style={[
          styles.bottomPanel,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor,
            borderTopColor: borderColor,
          },
        ]}
      >
        {/* Selected Components */}
        {selectedComponents.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedComponents}
          >
            {selectedComponents.map((component) => (
              <Pressable
                key={component.id}
                style={[styles.selectedChip, { backgroundColor: tintColor }]}
                onPress={() => handleRemoveComponent(component.id)}
              >
                <ThemedText style={styles.selectedChipText}>
                  {component.icon} {component.label} ×
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Custom Text Input */}
        <TextInput
          style={[
            styles.customInput,
            { backgroundColor, color: textColor, borderColor },
          ]}
          placeholder="Add custom details..."
          placeholderTextColor={borderColor}
          value={customText}
          onChangeText={setCustomText}
          multiline
          maxLength={200}
        />

        {/* Final Prompt Preview */}
        <View style={[styles.promptPreview, { borderColor }]}>
          <ThemedText style={styles.promptPreviewLabel}>Final Prompt:</ThemedText>
          <ThemedText style={styles.promptPreviewText} numberOfLines={3}>
            {fullPrompt || 'Build your prompt using components above'}
          </ThemedText>
        </View>

        {/* Use Button */}
        <Pressable
          style={[styles.useButton, { backgroundColor: tintColor }]}
          onPress={handleUsePrompt}
          disabled={!fullPrompt}
        >
          <ThemedText style={styles.useButtonText}>
            Use This Prompt in Studio
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  qualityBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
  },
  qualityScore: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  categoryTabs: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  presetsGrid: {
    gap: 12,
  },
  presetCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  presetInfo: {
    gap: 6,
  },
  presetDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  presetCategory: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  componentsGrid: {
    gap: 12,
  },
  componentRow: {
    gap: 12,
    marginBottom: 12,
  },
  componentCard: {
    flex: 1,
    aspectRatio: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  componentIcon: {
    fontSize: 32,
  },
  componentLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionsBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  suggestionsTitle: {
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  selectedComponents: {
    maxHeight: 40,
  },
  selectedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedChipText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 44,
    maxHeight: 80,
  },
  promptPreview: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  promptPreviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
  },
  promptPreviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  useButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
