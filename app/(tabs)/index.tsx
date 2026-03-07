import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MediaType, ImageSize, VideoResolution, AspectRatio, ImageModelId, VideoModelId, Creation } from '@/types';
import { router } from 'expo-router';
import { generateImage, generateVideo, analyzeImage, generateSpeech } from '@/lib/gemini-service';
import { saveCreation } from '@/lib/data-service';
import { useAuth } from '@/hooks/use-auth';
import * as Haptics from 'expo-haptics';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { ReferenceUploader, ReferenceImage } from '@/components/reference-uploader';

export default function StudioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'icon');
  const { isWide, isDesktop, contentMaxWidth } = useBreakpoint();

  const [mode, setMode] = useState<MediaType>('image');
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('4K');
  const [videoResolution, setVideoResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [references, setReferences] = useState<ReferenceImage[]>([]);

  const modes: { type: MediaType; label: string }[] = [
    { type: 'image', label: 'Image' },
    { type: 'video', label: 'Video' },
    { type: 'animation', label: 'Animation' },
    { type: 'analyze', label: 'Analyze' },
    { type: 'speech', label: 'Speech' },
  ];

  const imageSizes: ImageSize[] = ['1K', '2K', '4K'];
  const videoResolutions: VideoResolution[] = ['720p', '1080p'];
  const aspectRatios: AspectRatio[] = ['16:9', '1:1', '3:4', '4:3', '9:16'];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    if (!user) {
      alert('Please log in to generate content');
      return;
    }

    try {
      setIsGenerating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let result;
      if (mode === 'image') {
        result = await generateImage({
          prompt,
          size: imageSize,
          aspectRatio,
          modelId: 'gemini-3-pro-image-preview',
          references,
        });
      } else if (mode === 'video') {
        result = await generateVideo({
          prompt,
          resolution: videoResolution,
          duration: '5',
          references,
          modelId: 'veo-3.1-generate-preview',
        });
      } else if (mode === 'analyze') {
        const analyzeUrl = references[0]?.uri || generatedUrl;
        if (!analyzeUrl) {
          alert('Please add a reference image or generate an image first to analyze');
          setIsGenerating(false);
          return;
        }
        const analysis = await analyzeImage(analyzeUrl);
        alert(analysis);
        setIsGenerating(false);
        return;
      } else if (mode === 'speech') {
        result = await generateSpeech(prompt);
      } else {
        alert('This mode is not yet implemented');
        setIsGenerating(false);
        return;
      }

      if (result?.success && result.url) {
        setGeneratedUrl(result.url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Save creation to database
        const creation: Creation = {
          id: Date.now().toString(),
          type: mode,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl || result.url,
          prompt,
          timestamp: Date.now(),
          size: mode === 'image' ? imageSize : videoResolution,
          aspectRatio,
          modelId: mode === 'image' ? 'gemini-3-pro-image-preview' : 'veo-3.1-generate-preview',
        };
        await saveCreation(creation, String(user.id));
      } else {
        alert('Generation failed. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('An error occurred during generation');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const Controls = () => (
    <>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Luxe Studio</ThemedText>
        <ThemedText style={styles.subtitle}>Create with AI-powered tools</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Mode</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
          {modes.map((m) => (
            <Pressable key={m.type} onPress={() => setMode(m.type)}
              style={[styles.modeButton, { borderColor }, mode === m.type && { backgroundColor: tintColor, borderColor: tintColor }]}>
              <ThemedText style={[styles.modeButtonText, mode === m.type && { color: '#000' }]}>{m.label}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.promptHeader}>
          <ThemedText style={styles.label}>Prompt</ThemedText>
          <Pressable style={[styles.builderButton, { backgroundColor: tintColor }]} onPress={() => router.push('/prompt-builder' as any)}>
            <ThemedText style={styles.builderButtonText}>✨ Smart Builder</ThemedText>
          </Pressable>
        </View>
        <TextInput
          style={[styles.promptInput, { backgroundColor, color: textColor, borderColor }]}
          placeholder="Describe what you want to create..."
          placeholderTextColor={borderColor}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={isWide ? 6 : 4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <ReferenceUploader
          references={references}
          onReferencesChange={setReferences}
          maxCount={3}
          label={mode === 'speech' ? 'Reference Audio/Script' : mode === 'analyze' ? 'Images to Analyze' : 'Reference Images'}
        />
      </View>

      {mode === 'image' && (
        <>
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Size</ThemedText>
            <View style={styles.optionRow}>
              {imageSizes.map((size) => (
                <Pressable key={size} onPress={() => setImageSize(size)}
                  style={[styles.optionButton, { borderColor }, imageSize === size && { backgroundColor: tintColor, borderColor: tintColor }]}>
                  <ThemedText style={[styles.optionButtonText, imageSize === size && { color: '#000' }]}>{size}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Aspect Ratio</ThemedText>
            <View style={styles.optionRow}>
              {aspectRatios.map((ratio) => (
                <Pressable key={ratio} onPress={() => setAspectRatio(ratio)}
                  style={[styles.optionButton, { borderColor }, aspectRatio === ratio && { backgroundColor: tintColor, borderColor: tintColor }]}>
                  <ThemedText style={[styles.optionButtonText, aspectRatio === ratio && { color: '#000' }]}>{ratio}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      )}
      {mode === 'video' && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Resolution</ThemedText>
          <View style={styles.optionRow}>
            {videoResolutions.map((res) => (
              <Pressable key={res} onPress={() => setVideoResolution(res)}
                style={[styles.optionButton, { borderColor }, videoResolution === res && { backgroundColor: tintColor, borderColor: tintColor }]}>
                <ThemedText style={[styles.optionButtonText, videoResolution === res && { color: '#000' }]}>{res}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </>
  );

  return (
    <ThemedView style={styles.container}>
      {isWide ? (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 32, paddingBottom: 40, paddingHorizontal: 40 }]}>
          <View style={styles.desktopGrid}>
            <View style={styles.desktopLeft}>
              <Controls />
              <Pressable onPress={handleGenerate} disabled={isGenerating}
                style={[styles.generateButton, { backgroundColor: tintColor }, isGenerating && styles.generateButtonDisabled]}>
                {isGenerating ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.generateButtonText}>Generate</ThemedText>}
              </Pressable>
            </View>
            <View style={styles.desktopRight}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { marginBottom: 16 }]}>Preview</ThemedText>
              <View style={[styles.desktopPreview, { borderColor }]}>
                {generatedUrl ? (
                  <Image source={{ uri: generatedUrl }} style={styles.previewImage} />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <ThemedText style={{ fontSize: 56 }}>✦</ThemedText>
                    <ThemedText style={{ opacity: 0.4, marginTop: 16, textAlign: 'center' }}>Your creation will appear here</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          },
        ]}
      >
        <Controls />
        {generatedUrl && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Preview</ThemedText>
            <View style={[styles.previewContainer, { borderColor }]}>
              <Image source={{ uri: generatedUrl }} style={styles.previewImage} />
            </View>
          </View>
        )}
      </ScrollView>
      )}

      {/* Generate Button (Fixed at bottom, mobile only) */}
      {!isWide && (
        <View style={[styles.generateButtonContainer, { paddingBottom: Math.max(insets.bottom, 16), backgroundColor }]}>
          <Pressable onPress={handleGenerate} disabled={isGenerating}
            style={[styles.generateButton, { backgroundColor: tintColor }, isGenerating && styles.generateButtonDisabled]}>
            {isGenerating ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.generateButtonText}>Generate</ThemedText>}
          </Pressable>
        </View>
      )}
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
    marginBottom: 24,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  builderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  builderButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  modeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  generateButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'flex-start',
  },
  desktopLeft: {
    flex: 1,
    minWidth: 320,
    maxWidth: 480,
  },
  desktopRight: {
    flex: 1,
  },
  desktopPreview: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    minHeight: 300,
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});
