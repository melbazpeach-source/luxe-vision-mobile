export interface PromptComponent {
  id: string;
  category: 'lighting' | 'mood' | 'camera' | 'style' | 'subject' | 'quality';
  label: string;
  value: string;
  icon: string;
}

export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  components: PromptComponent[];
  thumbnail: string;
  category: string;
}

export const PROMPT_COMPONENTS: Record<string, PromptComponent[]> = {
  lighting: [
    { id: 'light_1', category: 'lighting', label: 'Golden Hour', value: 'golden hour lighting, warm sunset glow', icon: '🌅' },
    { id: 'light_2', category: 'lighting', label: 'Studio', value: 'professional studio lighting, soft shadows', icon: '💡' },
    { id: 'light_3', category: 'lighting', label: 'Dramatic', value: 'dramatic lighting, high contrast, chiaroscuro', icon: '🎭' },
    { id: 'light_4', category: 'lighting', label: 'Neon', value: 'neon lighting, vibrant colors, cyberpunk glow', icon: '🌃' },
    { id: 'light_5', category: 'lighting', label: 'Natural', value: 'natural daylight, soft diffused light', icon: '☀️' },
    { id: 'light_6', category: 'lighting', label: 'Moonlight', value: 'moonlight, ethereal blue tones, night scene', icon: '🌙' },
  ],
  mood: [
    { id: 'mood_1', category: 'mood', label: 'Serene', value: 'serene, peaceful, calm atmosphere', icon: '🧘' },
    { id: 'mood_2', category: 'mood', label: 'Dramatic', value: 'dramatic, intense, powerful mood', icon: '⚡' },
    { id: 'mood_3', category: 'mood', label: 'Mysterious', value: 'mysterious, enigmatic, intriguing', icon: '🔮' },
    { id: 'mood_4', category: 'mood', label: 'Joyful', value: 'joyful, vibrant, energetic', icon: '✨' },
    { id: 'mood_5', category: 'mood', label: 'Melancholic', value: 'melancholic, nostalgic, wistful', icon: '🍂' },
    { id: 'mood_6', category: 'mood', label: 'Epic', value: 'epic, grand, awe-inspiring', icon: '🏔️' },
  ],
  camera: [
    { id: 'cam_1', category: 'camera', label: 'Wide Shot', value: 'wide angle shot, expansive view', icon: '📐' },
    { id: 'cam_2', category: 'camera', label: 'Close-Up', value: 'close-up shot, detailed focus', icon: '🔍' },
    { id: 'cam_3', category: 'camera', label: 'Aerial', value: 'aerial view, birds eye perspective, drone shot', icon: '🚁' },
    { id: 'cam_4', category: 'camera', label: 'Low Angle', value: 'low angle shot, looking up, dramatic perspective', icon: '📸' },
    { id: 'cam_5', category: 'camera', label: 'Portrait', value: 'portrait orientation, centered composition', icon: '🖼️' },
    { id: 'cam_6', category: 'camera', label: 'Cinematic', value: 'cinematic composition, 2.39:1 aspect ratio', icon: '🎬' },
  ],
  style: [
    { id: 'style_1', category: 'style', label: 'Photorealistic', value: 'photorealistic, ultra detailed, 8K resolution', icon: '📷' },
    { id: 'style_2', category: 'style', label: 'Oil Painting', value: 'oil painting style, impressionist brushstrokes', icon: '🎨' },
    { id: 'style_3', category: 'style', label: 'Anime', value: 'anime style, vibrant colors, cel shaded', icon: '🎌' },
    { id: 'style_4', category: 'style', label: 'Cyberpunk', value: 'cyberpunk aesthetic, neon lights, futuristic', icon: '🤖' },
    { id: 'style_5', category: 'style', label: 'Minimalist', value: 'minimalist design, clean lines, simple composition', icon: '⬜' },
    { id: 'style_6', category: 'style', label: 'Vintage', value: 'vintage film photography, grain, faded colors', icon: '📼' },
  ],
  quality: [
    { id: 'qual_1', category: 'quality', label: 'Ultra HD', value: '8K ultra HD, highly detailed, sharp focus', icon: '💎' },
    { id: 'qual_2', category: 'quality', label: 'Professional', value: 'professional photography, award winning', icon: '🏆' },
    { id: 'qual_3', category: 'quality', label: 'Masterpiece', value: 'masterpiece, trending on artstation, best quality', icon: '⭐' },
    { id: 'qual_4', category: 'quality', label: 'Ray Traced', value: 'ray traced lighting, realistic reflections', icon: '🔆' },
  ],
};

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'preset_1',
    name: 'Cinematic Portrait',
    description: 'Professional portrait with dramatic lighting',
    category: 'Portrait',
    thumbnail: '',
    components: [
      PROMPT_COMPONENTS.lighting[2], // Dramatic
      PROMPT_COMPONENTS.mood[1], // Dramatic
      PROMPT_COMPONENTS.camera[4], // Portrait
      PROMPT_COMPONENTS.style[0], // Photorealistic
      PROMPT_COMPONENTS.quality[1], // Professional
    ],
  },
  {
    id: 'preset_2',
    name: 'Ethereal Landscape',
    description: 'Dreamy landscape with golden hour lighting',
    category: 'Landscape',
    thumbnail: '',
    components: [
      PROMPT_COMPONENTS.lighting[0], // Golden Hour
      PROMPT_COMPONENTS.mood[0], // Serene
      PROMPT_COMPONENTS.camera[0], // Wide Shot
      PROMPT_COMPONENTS.style[0], // Photorealistic
      PROMPT_COMPONENTS.quality[0], // Ultra HD
    ],
  },
  {
    id: 'preset_3',
    name: 'Cyberpunk City',
    description: 'Futuristic cityscape with neon lights',
    category: 'Urban',
    thumbnail: '',
    components: [
      PROMPT_COMPONENTS.lighting[3], // Neon
      PROMPT_COMPONENTS.mood[2], // Mysterious
      PROMPT_COMPONENTS.camera[2], // Aerial
      PROMPT_COMPONENTS.style[3], // Cyberpunk
      PROMPT_COMPONENTS.quality[0], // Ultra HD
    ],
  },
  {
    id: 'preset_4',
    name: 'Anime Character',
    description: 'Vibrant anime-style character illustration',
    category: 'Character',
    thumbnail: '',
    components: [
      PROMPT_COMPONENTS.lighting[4], // Natural
      PROMPT_COMPONENTS.mood[3], // Joyful
      PROMPT_COMPONENTS.camera[4], // Portrait
      PROMPT_COMPONENTS.style[2], // Anime
      PROMPT_COMPONENTS.quality[2], // Masterpiece
    ],
  },
];

export function buildPromptFromComponents(components: PromptComponent[], customText: string = ''): string {
  const componentText = components.map(c => c.value).join(', ');
  return customText ? `${customText}, ${componentText}` : componentText;
}

export function suggestEnhancements(prompt: string): string[] {
  const suggestions: string[] = [];
  
  if (!prompt.toLowerCase().includes('detailed')) {
    suggestions.push('Add "highly detailed" for better quality');
  }
  
  if (!prompt.toLowerCase().includes('lighting')) {
    suggestions.push('Specify lighting conditions (e.g., golden hour, studio lighting)');
  }
  
  if (!prompt.toLowerCase().includes('8k') && !prompt.toLowerCase().includes('4k')) {
    suggestions.push('Add resolution modifier (8K, 4K) for higher quality');
  }
  
  if (prompt.split(',').length < 3) {
    suggestions.push('Add more descriptive elements for better results');
  }
  
  return suggestions;
}

export function estimatePromptQuality(prompt: string): number {
  let score = 50; // Base score
  
  // Length bonus
  const words = prompt.split(/\s+/).length;
  if (words > 10) score += 15;
  else if (words > 5) score += 10;
  
  // Quality keywords
  const qualityKeywords = ['detailed', '8k', '4k', 'professional', 'masterpiece', 'award winning'];
  qualityKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword)) score += 5;
  });
  
  // Technical keywords
  const technicalKeywords = ['lighting', 'composition', 'perspective', 'focus', 'depth of field'];
  technicalKeywords.forEach(keyword => {
    if (prompt.toLowerCase().includes(keyword)) score += 3;
  });
  
  return Math.min(100, score);
}
