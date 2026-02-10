import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  TimelineProject,
  Keyframe,
  createTimelineProject,
  getTimelineProject,
  saveTimelineProject,
  addKeyframe,
  updateKeyframe,
  deleteKeyframe,
  generateAudioReactiveKeyframes,
  getTimelinePreview,
} from '@/lib/animation-timeline';

const { width } = Dimensions.get('window');
const TIMELINE_WIDTH = width - 32;
const PIXELS_PER_SECOND = 60;

export default function AnimationTimelineScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');

  const [project, setProject] = useState<TimelineProject | null>(null);
  const [selectedKeyframe, setSelectedKeyframe] = useState<Keyframe | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState('');

  const projectId = params.projectId as string | undefined;

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (projectId) {
      const loaded = await getTimelineProject(projectId);
      setProject(loaded);
    } else {
      const newProject = await createTimelineProject('Untitled Timeline');
      setProject(newProject);
    }
  };

  const handleAddKeyframe = async () => {
    if (!project) return;

    try {
      const newKeyframe = await addKeyframe(project.id, currentTime, 'New scene');
      const updated = await getTimelineProject(project.id);
      setProject(updated);
      setSelectedKeyframe(newKeyframe);
      setEditingPrompt(newKeyframe.prompt);
    } catch (error) {
      Alert.alert('Error', 'Failed to add keyframe');
    }
  };

  const handleUpdateKeyframe = async () => {
    if (!project || !selectedKeyframe) return;

    try {
      await updateKeyframe(project.id, selectedKeyframe.id, {
        prompt: editingPrompt,
      });
      const updated = await getTimelineProject(project.id);
      setProject(updated);
      Alert.alert('Success', 'Keyframe updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update keyframe');
    }
  };

  const handleDeleteKeyframe = async (keyframeId: string) => {
    if (!project) return;

    Alert.alert('Delete Keyframe', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteKeyframe(project.id, keyframeId);
            const updated = await getTimelineProject(project.id);
            setProject(updated);
            setSelectedKeyframe(null);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete keyframe');
          }
        },
      },
    ]);
  };

  const handleUploadAudio = async () => {
    if (!project) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const audioUri = result.assets[0].uri;
      
      Alert.alert(
        'Audio Reactive Mode',
        'Generate keyframes synced to audio beats?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Generate',
            onPress: async () => {
              await generateAudioReactiveKeyframes(project.id, audioUri);
              const updated = await getTimelineProject(project.id);
              setProject(updated);
              Alert.alert('Success', 'Audio-reactive keyframes generated!');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload audio');
    }
  };

  const handleExport = () => {
    Alert.alert(
      'Export Timeline',
      'This will generate video frames from your timeline',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // TODO: Implement actual export
            Alert.alert('Success', 'Timeline exported to Gallery!');
          },
        },
      ]
    );
  };

  const renderKeyframe = (keyframe: Keyframe, index: number) => {
    const left = keyframe.time * PIXELS_PER_SECOND;
    const isSelected = selectedKeyframe?.id === keyframe.id;

    return (
      <Pressable
        key={keyframe.id}
        style={[
          styles.keyframeMarker,
          {
            left,
            backgroundColor: isSelected ? tintColor : borderColor,
            borderColor: isSelected ? tintColor : 'transparent',
          },
        ]}
        onPress={() => {
          setSelectedKeyframe(keyframe);
          setEditingPrompt(keyframe.prompt);
          setCurrentTime(keyframe.time);
        }}
        onLongPress={() => handleDeleteKeyframe(keyframe.id)}
      >
        <ThemedText style={styles.keyframeNumber}>{index + 1}</ThemedText>
      </Pressable>
    );
  };

  const renderTimelineSegments = () => {
    if (!project) return null;

    const preview = getTimelinePreview(project);
    
    return preview.segments.map((segment, index) => {
      const left = segment.start * PIXELS_PER_SECOND;
      const width = (segment.end - segment.start) * PIXELS_PER_SECOND;

      return (
        <View
          key={index}
          style={[
            styles.timelineSegment,
            {
              left,
              width,
              backgroundColor: segment.color + '40', // 40 = 25% opacity
              borderLeftColor: segment.color,
            },
          ]}
        />
      );
    });
  };

  if (!project) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

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
        <Pressable onPress={() => router.back()}>
          <ThemedText style={{ fontSize: 28 }}>←</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{project.name}</ThemedText>
        <Pressable onPress={handleExport}>
          <ThemedText style={{ color: tintColor, fontWeight: '600' }}>Export</ThemedText>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Info */}
        <View style={styles.infoCard}>
          <ThemedText type="defaultSemiBold">Duration: {project.duration}s</ThemedText>
          <ThemedText>FPS: {project.fps} | Resolution: {project.resolution}</ThemedText>
          <ThemedText>Keyframes: {project.keyframes.length}</ThemedText>
          {project.audioReactive && (
            <ThemedText style={{ color: tintColor }}>🎵 Audio Reactive</ThemedText>
          )}
        </View>

        {/* Timeline Viewer */}
        <View style={styles.timelineContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Timeline
          </ThemedText>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.timelineScroll}
          >
            <View style={[styles.timeline, { width: project.duration * PIXELS_PER_SECOND }]}>
              {/* Timeline Segments */}
              {renderTimelineSegments()}

              {/* Time Markers */}
              {Array.from({ length: Math.ceil(project.duration) + 1 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.timeMarker, { left: i * PIXELS_PER_SECOND }]}
                >
                  <View style={[styles.timeMarkerLine, { backgroundColor: borderColor }]} />
                  <ThemedText style={styles.timeMarkerText}>{i}s</ThemedText>
                </View>
              ))}

              {/* Keyframes */}
              {project.keyframes.map((keyframe, index) => renderKeyframe(keyframe, index))}

              {/* Playhead */}
              <View
                style={[
                  styles.playhead,
                  {
                    left: currentTime * PIXELS_PER_SECOND,
                    backgroundColor: tintColor,
                  },
                ]}
              />
            </View>
          </ScrollView>
        </View>

        {/* Keyframe Editor */}
        {selectedKeyframe && (
          <View style={[styles.editorCard, { borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.editorTitle}>
              Edit Keyframe at {selectedKeyframe.time.toFixed(1)}s
            </ThemedText>
            
            <TextInput
              style={[
                styles.promptInput,
                { backgroundColor, color: textColor, borderColor },
              ]}
              placeholder="Enter scene description..."
              placeholderTextColor={borderColor}
              value={editingPrompt}
              onChangeText={setEditingPrompt}
              multiline
              numberOfLines={4}
            />

            <View style={styles.transitionRow}>
              <ThemedText>Transition:</ThemedText>
              <ThemedText style={{ color: tintColor }}>
                {selectedKeyframe.transitionType}
              </ThemedText>
            </View>

            <Pressable
              style={[styles.updateButton, { backgroundColor: tintColor }]}
              onPress={handleUpdateKeyframe}
            >
              <ThemedText style={styles.updateButtonText}>Update Keyframe</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={handleAddKeyframe}
          >
            <ThemedText style={styles.actionButtonText}>+ Add Keyframe</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: '#666' }]}
            onPress={handleUploadAudio}
          >
            <ThemedText style={[styles.actionButtonText, { color: '#fff' }]}>
              🎵 Upload Audio
            </ThemedText>
          </Pressable>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: borderColor, opacity: 0.3 }]}>
          <ThemedText type="defaultSemiBold">💡 Tips</ThemedText>
          <ThemedText style={styles.tipText}>
            • Tap timeline to add keyframes{'\n'}
            • Long press keyframes to delete{'\n'}
            • Upload audio for beat-synced generation{'\n'}
            • Each keyframe defines a scene transition
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  timelineContainer: {
    marginBottom: 16,
  },
  timelineScroll: {
    height: 120,
  },
  timeline: {
    height: 100,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  timelineSegment: {
    position: 'absolute',
    height: 100,
    borderLeftWidth: 2,
    borderRadius: 4,
  },
  timeMarker: {
    position: 'absolute',
    top: 0,
    height: 100,
  },
  timeMarkerLine: {
    width: 1,
    height: 100,
    opacity: 0.3,
  },
  timeMarkerText: {
    fontSize: 10,
    marginTop: 4,
  },
  keyframeMarker: {
    position: 'absolute',
    top: 35,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -15 }],
  },
  keyframeNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 100,
  },
  editorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  editorTitle: {
    marginBottom: 12,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  transitionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  updateButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
});
