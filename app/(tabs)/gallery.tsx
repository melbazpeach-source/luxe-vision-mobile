import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { fetchCreations } from '@/lib/data-service';
import { Creation } from '@/types';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding and 16px gap

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    loadCreations();
  }, [user]);

  const loadCreations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCreations(String(user.id));
      setCreations(data);
    } catch (error) {
      console.error('Error loading creations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreations = creations.filter((c) => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  const renderCreation = ({ item }: { item: Creation }) => (
    <Pressable
      style={[styles.card, { borderColor }]}
      onPress={() => {
        // Navigate to detail screen (to be implemented)
        console.log('View creation:', item.id);
      }}
    >
      <Image source={{ uri: item.thumbnailUrl || item.url }} style={styles.thumbnail} />
      <View style={styles.cardInfo}>
        <ThemedText numberOfLines={2} style={styles.prompt}>
          {item.prompt}
        </ThemedText>
        <ThemedText style={styles.meta}>
          {item.type} • {item.size}
        </ThemedText>
      </View>
    </Pressable>
  );

  if (!user) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText type="subtitle">Please log in to view your gallery</ThemedText>
        <Pressable
          style={[styles.loginButton, { backgroundColor: tintColor }]}
          onPress={() => router.push('/profile' as any)}
        >
          <ThemedText style={styles.loginButtonText}>Go to Profile</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Loading your creations...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
          },
        ]}
      >
        <ThemedText type="title" style={styles.title}>
          Gallery
        </ThemedText>
        <View style={styles.filterRow}>
          {['all', 'image', 'video'].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.filterButton,
                { borderColor },
                filter === f && { backgroundColor: tintColor, borderColor: tintColor },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  filter === f && { color: '#fff' },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {filteredCreations.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No creations yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Start creating in the Studio tab
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredCreations}
          renderItem={renderCreation}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: Math.max(insets.bottom + 80, 100) },
          ]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    padding: 16,
  },
  row: {
    gap: 16,
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: 12,
  },
  prompt: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  meta: {
    fontSize: 10,
    opacity: 0.6,
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
  loginButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
});
