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
import { generateImage, generateVideo, analyzeImage, generateSpeech } from '@/lib/gemini-service';
import { saveCreation } from '@/lib/data-service';
import { useAuth } from '@/hooks/use-auth';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function StudioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'icon');

  const [mode, setMode] = useState<MediaType>('image');
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('4K');
  const [videoResolution, setVideoResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

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
        });
      } else if (mode === 'video') {
        result = await generateVideo({
          prompt,
          resolution: videoResolution,
          duration: '5',
          modelId: 'veo-3.1-generate-preview',
        });
      } else if (mode === 'analyze') {
        if (!generatedUrl) {
          alert('Please generate an image first to analyze');
          setIsGenerating(false);
          return;
        }
        const analysis = await analyzeImage(generatedUrl);
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom + 80, 100),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Luxe Studio
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Create with AI-powered tools
          </ThemedText>
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Mode
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
            {modes.map((m) => (
              <Pressable
                key={m.type}
                onPress={() => setMode(m.type)}
                style={[
                  styles.modeButton,
                  { borderColor },
                  mode === m.type && { backgroundColor: tintColor, borderColor: tintColor },
                ]}
              >
                <ThemedText
                  style={[
                    styles.modeButtonText,
                    mode === m.type && { color: '#fff' },
                  ]}
                >
                  {m.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Prompt Input */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Prompt
          </ThemedText>
          <TextInput
            style={[
              styles.promptInput,
              { backgroundColor, color: textColor, borderColor },
            ]}
            placeholder="Describe what you want to create..."
            placeholderTextColor={borderColor}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Settings */}
        {mode === 'image' && (
          <>
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Size
              </ThemedText>
              <View style={styles.optionRow}>
                {imageSizes.map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => setImageSize(size)}
                    style={[
                      styles.optionButton,
                      { borderColor },
                      imageSize === size && { backgroundColor: tintColor, borderColor: tintColor },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        imageSize === size && { color: '#fff' },
                      ]}
                    >
                      {size}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Aspect Ratio
              </ThemedText>
              <View style={styles.optionRow}>
                {aspectRatios.map((ratio) => (
                  <Pressable
                    key={ratio}
                    onPress={() => setAspectRatio(ratio)}
                    style={[
                      styles.optionButton,
                      { borderColor },
                      aspectRatio === ratio && { backgroundColor: tintColor, borderColor: tintColor },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        aspectRatio === ratio && { color: '#fff' },
                      ]}
                    >
                      {ratio}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {mode === 'video' && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Resolution
            </ThemedText>
            <View style={styles.optionRow}>
              {videoResolutions.map((res) => (
                <Pressable
                  key={res}
                  onPress={() => setVideoResolution(res)}
                  style={[
                    styles.optionButton,
                    { borderColor },
                    videoResolution === res && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.optionButtonText,
                      videoResolution === res && { color: '#fff' },
                    ]}
                  >
                    {res}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Preview Area */}
        {generatedUrl && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Preview
            </ThemedText>
            <View style={[styles.previewContainer, { borderColor }]}>
              <Image source={{ uri: generatedUrl }} style={styles.previewImage} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Generate Button (Fixed at bottom) */}
      <View
        style={[
          styles.generateButtonContainer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor,
          },
        ]}
      >
        <Pressable
          onPress={handleGenerate}
          disabled={isGenerating}
          style={[
            styles.generateButton,
            { backgroundColor: tintColor },
            isGenerating && styles.generateButtonDisabled,
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.generateButtonText}>Generate</ThemedText>
          )}
        </Pressable>
      </View>
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
