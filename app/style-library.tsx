import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import {
  StyleReference,
  getStyleLibrary,
  createStyleReference,
  deleteStyleFromLibrary,
} from '@/lib/style-transfer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function StyleLibraryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');

  const [styleLibrary, setStyleLibrary] = useState<StyleReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadStyles();
  }, [user]);

  const loadStyles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const library = await getStyleLibrary(String(user.id));
      setStyleLibrary(library);
    } catch (error) {
      console.error('Error loading styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleAnalyzeImage(result.assets[0].uri);
    }
  };

  const handleAnalyzeImage = async (imageUri: string) => {
    if (!user) return;

    setAnalyzing(true);
    try {
      const styleName = `Style ${styleLibrary.length + 1}`;
      const styleRef = await createStyleReference(String(user.id), styleName, imageUri);
      setStyleLibrary([styleRef, ...styleLibrary]);
      
      Alert.alert(
        'Style Analyzed!',
        `"${styleName}" has been added to your library`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image style');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteStyle = (styleId: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Style',
      'Are you sure you want to remove this style from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStyleFromLibrary(String(user.id), styleId);
              setStyleLibrary(styleLibrary.filter(s => s.id !== styleId));
            } catch (error) {
              console.error('Error deleting style:', error);
              Alert.alert('Error', 'Failed to delete style');
            }
          },
        },
      ]
    );
  };

  const renderStyleCard = ({ item }: { item: StyleReference }) => (
    <Pressable
      style={[styles.styleCard, { borderColor }]}
      onLongPress={() => handleDeleteStyle(item.id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.styleThumbnail} />
      <View style={styles.styleInfo}>
        <ThemedText numberOfLines={1} style={styles.styleName}>
          {item.name}
        </ThemedText>
        <View style={styles.colorPalette}>
          {item.extractedFeatures.colorPalette.slice(0, 5).map((color, index) => (
            <View
              key={index}
              style={[styles.colorSwatch, { backgroundColor: color }]}
            />
          ))}
        </View>
        <ThemedText numberOfLines={2} style={styles.styleFeature}>
          {item.extractedFeatures.artStyle}
        </ThemedText>
      </View>
    </Pressable>
  );

  if (!user) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText type="subtitle">Please log in to access Style Library</ThemedText>
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
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ fontSize: 28 }}>←</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.title}>
            Style Library
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>
        <ThemedText style={styles.subtitle}>
          Save and reuse visual styles
        </ThemedText>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : styleLibrary.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Styles Yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Upload a reference image to extract and save its style
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={styleLibrary}
          renderItem={renderStyleCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: Math.max(insets.bottom + 100, 120) },
          ]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Style Button */}
      <View
        style={[
          styles.addButtonContainer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor,
          },
        ]}
      >
        <Pressable
          style={[styles.addButton, { backgroundColor: tintColor }]}
          onPress={handlePickImage}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <ThemedText style={styles.addButtonText}>
              📸 Add Style Reference
            </ThemedText>
          )}
        </Pressable>
        {analyzing && (
          <ThemedText style={styles.analyzingText}>
            Analyzing image style...
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  grid: {
    padding: 16,
  },
  row: {
    gap: 16,
    marginBottom: 16,
  },
  styleCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  styleThumbnail: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  styleInfo: {
    padding: 12,
    gap: 8,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 4,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  styleFeature: {
    fontSize: 11,
    opacity: 0.6,
    lineHeight: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  analyzingText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
