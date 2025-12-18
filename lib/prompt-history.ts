import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  category: 'image' | 'video' | 'animation' | 'analysis' | 'speech';
  timestamp: number;
  isFavorite: boolean;
  metadata?: {
    size?: string;
    aspectRatio?: string;
    model?: string;
    generationTime?: number;
    resultUrl?: string;
  };
  tags?: string[];
}

const HISTORY_KEY = 'luxe_prompt_history';
const MAX_HISTORY_ITEMS = 500;

// Add prompt to history
export async function addPromptToHistory(
  prompt: string,
  category: PromptHistoryItem['category'],
  metadata?: PromptHistoryItem['metadata']
): Promise<PromptHistoryItem> {
  const item: PromptHistoryItem = {
    id: `prompt_${Date.now()}`,
    prompt,
    category,
    timestamp: Date.now(),
    isFavorite: false,
    metadata,
    tags: extractTags(prompt),
  };

  try {
    const history = await getPromptHistory();
    
    // Add to beginning of array
    history.unshift(item);
    
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return item;
  } catch (error) {
    console.error('Error adding prompt to history:', error);
    throw error;
  }
}

// Get all prompt history
export async function getPromptHistory(): Promise<PromptHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading prompt history:', error);
    return [];
  }
}

// Search prompt history
export async function searchPromptHistory(query: string): Promise<PromptHistoryItem[]> {
  const history = await getPromptHistory();
  const lowerQuery = query.toLowerCase();

  return history.filter(item => {
    const promptMatch = item.prompt.toLowerCase().includes(lowerQuery);
    const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    return promptMatch || tagMatch;
  });
}

// Get favorites
export async function getFavoritePrompts(): Promise<PromptHistoryItem[]> {
  const history = await getPromptHistory();
  return history.filter(item => item.isFavorite);
}

// Toggle favorite
export async function togglePromptFavorite(promptId: string): Promise<void> {
  try {
    const history = await getPromptHistory();
    const index = history.findIndex(item => item.id === promptId);

    if (index >= 0) {
      history[index].isFavorite = !history[index].isFavorite;
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

// Delete prompt from history
export async function deletePromptFromHistory(promptId: string): Promise<void> {
  try {
    const history = await getPromptHistory();
    const filtered = history.filter(item => item.id !== promptId);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
}

// Filter by category
export async function getPromptsByCategory(
  category: PromptHistoryItem['category']
): Promise<PromptHistoryItem[]> {
  const history = await getPromptHistory();
  return history.filter(item => item.category === category);
}

// Filter by date range
export async function getPromptsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<PromptHistoryItem[]> {
  const history = await getPromptHistory();
  const start = startDate.getTime();
  const end = endDate.getTime();

  return history.filter(item => item.timestamp >= start && item.timestamp <= end);
}

// Get recent prompts (last N items)
export async function getRecentPrompts(count: number = 10): Promise<PromptHistoryItem[]> {
  const history = await getPromptHistory();
  return history.slice(0, count);
}

// Extract tags from prompt
function extractTags(prompt: string): string[] {
  const tags: string[] = [];
  const words = prompt.toLowerCase().split(/[\s,]+/);

  // Common keywords to extract as tags
  const keywords = [
    'portrait', 'landscape', 'cinematic', 'anime', 'realistic', 'abstract',
    'cyberpunk', 'fantasy', 'nature', 'urban', 'vintage', 'modern',
    'dramatic', 'serene', 'vibrant', 'dark', 'light', 'colorful',
    'detailed', 'minimalist', 'professional', 'artistic'
  ];

  words.forEach(word => {
    if (keywords.includes(word) && !tags.includes(word)) {
      tags.push(word);
    }
  });

  return tags;
}

// Get popular tags
export async function getPopularTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
  const history = await getPromptHistory();
  const tagCounts: Record<string, number> = {};

  history.forEach(item => {
    item.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Clear all history
export async function clearPromptHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
}

// Export history as JSON
export async function exportPromptHistory(): Promise<string> {
  const history = await getPromptHistory();
  return JSON.stringify(history, null, 2);
}

// Import history from JSON
export async function importPromptHistory(jsonData: string): Promise<void> {
  try {
    const imported: PromptHistoryItem[] = JSON.parse(jsonData);
    const existing = await getPromptHistory();
    
    // Merge and deduplicate
    const merged = [...imported, ...existing];
    const unique = merged.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(unique));
  } catch (error) {
    console.error('Error importing history:', error);
    throw error;
  }
}
