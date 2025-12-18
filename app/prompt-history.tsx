import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  PromptHistoryItem,
  getPromptHistory,
  searchPromptHistory,
  getFavoritePrompts,
  togglePromptFavorite,
  deletePromptFromHistory,
  getPopularTags,
} from '@/lib/prompt-history';

type FilterMode = 'all' | 'favorites' | 'image' | 'video';

export default function PromptHistoryScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E5E4E2', dark: '#333333' }, 'icon');

  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PromptHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    loadPopularTags();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, searchQuery, filterMode]);

  const loadHistory = async () => {
    try {
      const data = await getPromptHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularTags = async () => {
    const tags = await getPopularTags(8);
    setPopularTags(tags);
  };

  const applyFilters = async () => {
    let filtered = history;

    // Apply search
    if (searchQuery.trim()) {
      filtered = await searchPromptHistory(searchQuery);
    }

    // Apply category filter
    if (filterMode === 'favorites') {
      filtered = filtered.filter(item => item.isFavorite);
    } else if (filterMode !== 'all') {
      filtered = filtered.filter(item => item.category === filterMode);
    }

    setFilteredHistory(filtered);
  };

  const handleToggleFavorite = async (promptId: string) => {
    try {
      await togglePromptFavorite(promptId);
      await loadHistory();
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const handleDeletePrompt = (promptId: string) => {
    Alert.alert(
      'Delete Prompt',
      'Are you sure you want to remove this prompt from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePromptFromHistory(promptId);
              await loadHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete prompt');
            }
          },
        },
      ]
    );
  };

  const handleUsePrompt = (prompt: string) => {
    // TODO: Pass prompt back to Studio screen
    Alert.alert('Prompt Copied', `"${prompt.substring(0, 50)}..." will be used in Studio`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
  };

  const renderHistoryItem = ({ item }: { item: PromptHistoryItem }) => {
    const date = new Date(item.timestamp);
    const timeAgo = getTimeAgo(date);

    return (
      <Pressable
        style={[styles.historyCard, { borderColor }]}
        onPress={() => handleUsePrompt(item.prompt)}
        onLongPress={() => handleDeletePrompt(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <ThemedText style={styles.categoryBadge}>{item.category}</ThemedText>
            <ThemedText style={styles.timestamp}>{timeAgo}</ThemedText>
          </View>
          <Pressable
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={8}
          >
            <ThemedText style={styles.favoriteIcon}>
              {item.isFavorite ? '⭐' : '☆'}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.promptText} numberOfLines={3}>
          {item.prompt}
        </ThemedText>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {item.metadata?.resultUrl && (
          <View style={styles.metadataRow}>
            <ThemedText style={styles.metadataText}>✓ Generated</ThemedText>
          </View>
        )}
      </Pressable>
    );
  };

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
            Prompt History
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>

        {/* Search Bar */}
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor, color: textColor, borderColor },
          ]}
          placeholder="Search prompts..."
          placeholderTextColor={borderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['all', 'favorites', 'image', 'video'] as FilterMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[
                styles.filterTab,
                { borderColor },
                filterMode === mode && { backgroundColor: tintColor, borderColor: tintColor },
              ]}
              onPress={() => setFilterMode(mode)}
            >
              <ThemedText
                style={[
                  styles.filterTabText,
                  filterMode === mode && { color: '#000000' },
                ]}
              >
                {mode === 'all' ? 'All' : mode === 'favorites' ? '⭐ Favorites' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Popular Tags */}
        {popularTags.length > 0 && !searchQuery && (
          <View style={styles.popularTagsSection}>
            <ThemedText style={styles.popularTagsTitle}>Popular:</ThemedText>
            <View style={styles.popularTags}>
              {popularTags.map((item, index) => (
                <Pressable
                  key={index}
                  style={[styles.popularTag, { borderColor }]}
                  onPress={() => handleTagPress(item.tag)}
                >
                  <ThemedText style={styles.popularTagText}>
                    {item.tag} ({item.count})
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {searchQuery ? 'No Results' : 'No Prompts Yet'}
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            {searchQuery
              ? 'Try a different search term'
              : 'Your prompt history will appear here'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
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
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  popularTagsSection: {
    marginTop: 8,
  },
  popularTagsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.6,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  popularTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  popularTagText: {
    fontSize: 11,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  promptText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
  },
  metadataRow: {
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
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
});
