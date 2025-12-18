// Core Types for Luxe Vision Creator

export type ImageSize = '1K' | '2K' | '4K';
export type VideoResolution = '720p' | '1080p';
export type AspectRatio = '16:9' | '1:1' | '3:4' | '4:3' | '9:16';
export type MediaType = 'image' | 'video' | 'analyze' | 'speech' | 'animation';
export type AIProvider = 'google' | 'openai' | 'anthropic' | 'xai' | 'deepseek' | 'openrouter';

export type ImageModelId = 'gemini-3-pro-image-preview' | 'gemini-2.5-flash-image';
export type VideoModelId = 'veo-3.1-generate-preview' | 'veo-3.1-fast-generate-preview';
export type VideoDuration = 'auto' | '5' | '10';

export interface GenerationConfig {
  prompt: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface Attachment {
  base64: string;
  mimeType: string;
  name: string;
  preview: string; // Data URL for UI display
}

export interface ApiError {
  message: string;
}

export type SubscriptionTier = 'free' | 'paid' | 'reseller';
export type UserRole = 'user' | 'admin' | 'superuser' | 'beta';

export interface UserApiKeys {
  google?: string;
  openai?: string;
  anthropic?: string;
  xai?: string;
  deepseek?: string;
  openrouter?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionTier: SubscriptionTier;
  role: UserRole;
  joinedAt: number;
  permissions?: AdminPermission[];
  apiKeys?: UserApiKeys;
}

export type AdminPermission = 'manage_users' | 'manage_ads' | 'manage_finance' | 'edit_landing' | 'manage_settings';

// Animation Types
export interface AnimationSettings {
  fps: '24' | '30' | '60';
  duration: '5' | '10';
  motionBlur: 'none' | 'low' | 'high';
}

export interface Creation {
  id: string;
  type: MediaType;
  url: string; // Unified URL for image or video
  thumbnailUrl: string; // Smaller for storage efficiency
  prompt: string;
  timestamp: number;
  size: ImageSize | VideoResolution;
  aspectRatio: AspectRatio;
  modelId?: string;
  animationSettings?: AnimationSettings;
}

// Advertisement Types
export interface Advertisement {
  id: string;
  clientName: string;
  imageUrl: string;
  linkUrl: string;
  placement: 'dashboard-main' | 'studio-sidebar' | 'landing-hero';
  isActive: boolean;
  impressions: number;
  clicks: number;
  revenue: number;
}

// Global Settings
export interface GlobalSettings {
  appName: string;
  brandColor: string;
  inkColor: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  figmaToken: string;
  canvaId: string;
  snapchatAppId: string;
  supabaseUrl: string;
  supabaseKey: string;
  enableFilters: boolean;
  enableAudio: boolean;
  enableSnapLenses: boolean;
  enableCloudImport: boolean;
  enabledProviders: AIProvider[];
  emailRouting: {
    waitlistEmail: string;
    newsEmail: string;
    contactEmail: string;
    abuseEmail: string;
  };
  domainConfig: {
    customDomain: string;
    dnsVerified: boolean;
  };
  socialLinks: SocialLink[];
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

// Landing Page Content
export interface LandingPageContent {
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  features: Feature[];
  footerLinks: FooterLink[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  isVisible: boolean;
}

// Subscription Plans
export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
}

// Waitlist & Beta
export interface WaitlistEntry {
  email: string;
  timestamp: number;
}

export interface BetaInvite {
  code: string;
  maxUses: number;
  usedCount: number;
  createdAt: number;
}

// Affiliate Types
export interface AffiliateSettings {
  enabled: boolean;
  commissionRate: number;
  cookieDuration: number;
}

export interface AffiliatePartner {
  id: string;
  name: string;
  email: string;
  code: string;
  referrals: number;
  earnings: number;
  joinedAt: number;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
}

// Studio State
export interface StudioState {
  mode: MediaType;
  prompt: string;
  attachments: Attachment[];
  imageSize: ImageSize;
  videoResolution: VideoResolution;
  aspectRatio: AspectRatio;
  imageModel: ImageModelId;
  videoModel: VideoModelId;
  videoDuration: VideoDuration;
  animationSettings: AnimationSettings;
  isGenerating: boolean;
  currentGeneration?: Creation;
}

// Generation History
export interface GenerationHistory {
  items: Creation[];
  totalCount: number;
}

// Agent Actions (Muse AI)
export interface AgentActions {
  suggestPrompt: (context: string) => Promise<string[]>;
  refinePrompt: (prompt: string) => Promise<string>;
  analyzeImage: (imageUrl: string) => Promise<string>;
  generateVariations: (prompt: string) => Promise<string[]>;
}

// Storage Connection
export interface StorageConnection {
  isConnected: boolean;
  provider: 'local' | 'supabase';
  lastSyncTime?: number;
}
