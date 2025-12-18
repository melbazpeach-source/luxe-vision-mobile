import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StyleReference {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  extractedFeatures: {
    colorPalette: string[];
    lighting: string;
    composition: string;
    mood: string;
    artStyle: string;
  };
  createdAt: number;
}

export interface RemixVariation {
  promptModifier?: string;
  styleIntensity?: number; // 0-100
  variationType: 'subtle' | 'moderate' | 'dramatic';
}

const STYLE_LIBRARY_KEY = 'luxe_style_library';

// Analyze image and extract style features (mock implementation)
export async function analyzeStyleFromImage(imageUrl: string): Promise<StyleReference['extractedFeatures']> {
  // In production, this would call an AI vision API (Gemini Vision, GPT-4V, etc.)
  // For now, return mock extracted features
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    colorPalette: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB', '#F39C12'],
    lighting: 'dramatic side lighting with high contrast',
    composition: 'rule of thirds, centered subject with negative space',
    mood: 'mysterious and contemplative',
    artStyle: 'cinematic photography with film grain',
  };
}

// Create style reference from analyzed image
export async function createStyleReference(
  userId: string,
  name: string,
  imageUrl: string
): Promise<StyleReference> {
  const features = await analyzeStyleFromImage(imageUrl);
  
  const styleRef: StyleReference = {
    id: `style_${Date.now()}`,
    userId,
    name,
    imageUrl,
    extractedFeatures: features,
    createdAt: Date.now(),
  };
  
  // Save to library
  await saveStyleToLibrary(styleRef);
  
  return styleRef;
}

// Save style to local library
export async function saveStyleToLibrary(style: StyleReference): Promise<void> {
  try {
    const library = await getStyleLibrary(style.userId);
    library.push(style);
    await AsyncStorage.setItem(
      `${STYLE_LIBRARY_KEY}_${style.userId}`,
      JSON.stringify(library)
    );
  } catch (error) {
    console.error('Error saving style to library:', error);
    throw error;
  }
}

// Get user's style library
export async function getStyleLibrary(userId: string): Promise<StyleReference[]> {
  try {
    const data = await AsyncStorage.getItem(`${STYLE_LIBRARY_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading style library:', error);
    return [];
  }
}

// Delete style from library
export async function deleteStyleFromLibrary(userId: string, styleId: string): Promise<void> {
  try {
    const library = await getStyleLibrary(userId);
    const filtered = library.filter(s => s.id !== styleId);
    await AsyncStorage.setItem(
      `${STYLE_LIBRARY_KEY}_${userId}`,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Error deleting style:', error);
    throw error;
  }
}

// Apply style to prompt
export function applyStyleToPrompt(
  basePrompt: string,
  style: StyleReference,
  intensity: number = 100
): string {
  const { extractedFeatures } = style;
  
  // Build style modifiers based on intensity
  const intensityFactor = intensity / 100;
  const styleModifiers: string[] = [];
  
  if (intensityFactor > 0.3) {
    styleModifiers.push(extractedFeatures.lighting);
  }
  
  if (intensityFactor > 0.5) {
    styleModifiers.push(extractedFeatures.mood);
    styleModifiers.push(extractedFeatures.composition);
  }
  
  if (intensityFactor > 0.7) {
    styleModifiers.push(extractedFeatures.artStyle);
    styleModifiers.push(`color palette: ${extractedFeatures.colorPalette.join(', ')}`);
  }
  
  return `${basePrompt}, ${styleModifiers.join(', ')}`;
}

// Generate remix variations
export function generateRemixVariations(originalPrompt: string): RemixVariation[] {
  return [
    {
      promptModifier: 'at golden hour with warm lighting',
      styleIntensity: 70,
      variationType: 'moderate',
    },
    {
      promptModifier: 'in cyberpunk style with neon lights',
      styleIntensity: 85,
      variationType: 'dramatic',
    },
    {
      promptModifier: 'as oil painting with impressionist brushstrokes',
      styleIntensity: 80,
      variationType: 'dramatic',
    },
    {
      promptModifier: 'with subtle color grading and film grain',
      styleIntensity: 50,
      variationType: 'subtle',
    },
    {
      promptModifier: 'in minimalist style with clean composition',
      styleIntensity: 60,
      variationType: 'moderate',
    },
    {
      promptModifier: 'with dramatic lighting and high contrast',
      styleIntensity: 75,
      variationType: 'dramatic',
    },
  ];
}

// Apply remix variation to prompt
export function applyRemixVariation(
  originalPrompt: string,
  variation: RemixVariation
): string {
  if (variation.promptModifier) {
    return `${originalPrompt} ${variation.promptModifier}`;
  }
  return originalPrompt;
}

// Get suggested styles based on prompt
// Mix multiple styles with blend ratios
export interface StyleMix {
  styles: { styleId: string; ratio: number }[];
  name: string;
}

export function mixStyles(
  styles: StyleReference[],
  ratios: number[]
): StyleReference['extractedFeatures'] {
  if (styles.length !== ratios.length) {
    throw new Error('Styles and ratios arrays must have the same length');
  }

  // Normalize ratios to sum to 100
  const total = ratios.reduce((sum, r) => sum + r, 0);
  const normalizedRatios = ratios.map(r => r / total);

  // Mix color palettes
  const allColors: string[] = [];
  styles.forEach((style, index) => {
    const count = Math.round(style.extractedFeatures.colorPalette.length * normalizedRatios[index]);
    allColors.push(...style.extractedFeatures.colorPalette.slice(0, count));
  });

  // Mix text features (weighted by ratio)
  const mixedFeatures: StyleReference['extractedFeatures'] = {
    colorPalette: allColors.slice(0, 5),
    lighting: '',
    composition: '',
    mood: '',
    artStyle: '',
  };

  // Find dominant style (highest ratio)
  const dominantIndex = normalizedRatios.indexOf(Math.max(...normalizedRatios));
  const dominantStyle = styles[dominantIndex];

  // Use dominant style's text features as base
  mixedFeatures.lighting = dominantStyle.extractedFeatures.lighting;
  mixedFeatures.composition = dominantStyle.extractedFeatures.composition;
  mixedFeatures.mood = dominantStyle.extractedFeatures.mood;

  // Blend art styles
  const artStyles = styles.map((s, i) => {
    if (normalizedRatios[i] > 0.2) {
      return s.extractedFeatures.artStyle;
    }
    return null;
  }).filter(Boolean);
  mixedFeatures.artStyle = artStyles.join(' mixed with ');

  return mixedFeatures;
}

export function applyMixedStylesToPrompt(
  basePrompt: string,
  mixedFeatures: StyleReference['extractedFeatures'],
  intensity: number = 100
): string {
  const intensityFactor = intensity / 100;
  const styleModifiers: string[] = [];

  if (intensityFactor > 0.3) {
    styleModifiers.push(mixedFeatures.lighting);
  }

  if (intensityFactor > 0.5) {
    styleModifiers.push(mixedFeatures.mood);
    styleModifiers.push(mixedFeatures.composition);
  }

  if (intensityFactor > 0.7) {
    styleModifiers.push(mixedFeatures.artStyle);
    styleModifiers.push(`color palette: ${mixedFeatures.colorPalette.join(', ')}`);
  }

  return `${basePrompt}, ${styleModifiers.join(', ')}`;
}

export function suggestStylesForPrompt(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const suggestions: string[] = [];
  
  if (lowerPrompt.includes('portrait') || lowerPrompt.includes('person')) {
    suggestions.push('Cinematic Portrait', 'Studio Photography', 'Film Noir');
  }
  
  if (lowerPrompt.includes('landscape') || lowerPrompt.includes('nature')) {
    suggestions.push('Golden Hour', 'Misty Morning', 'Dramatic Sunset');
  }
  
  if (lowerPrompt.includes('city') || lowerPrompt.includes('urban')) {
    suggestions.push('Cyberpunk', 'Night Photography', 'Street Photography');
  }
  
  if (lowerPrompt.includes('fantasy') || lowerPrompt.includes('magic')) {
    suggestions.push('Ethereal', 'Mystical', 'Epic Fantasy');
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Photorealistic', 'Artistic', 'Cinematic');
  }
  
  return suggestions;
}
