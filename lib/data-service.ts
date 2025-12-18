import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase, initSupabaseFromStorage } from './supabase';
import {
  User,
  Creation,
  Advertisement,
  GlobalSettings,
  WaitlistEntry,
  BetaInvite,
} from '../types';

// Initialize Supabase on module load
initSupabaseFromStorage();

// --- Users ---
export const fetchUsers = async (): Promise<User[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        console.log('[DataService] Fetched users from Supabase:', data.length);
        return data;
      }
    } catch (e) {
      console.error('[DataService] Error fetching users from Supabase:', e);
    }
  }

  // Fallback to local storage
  const stored = await AsyncStorage.getItem('luxe_users');
  const users = stored ? JSON.parse(stored) : [];
  console.log('[DataService] Fetched users from local storage:', users.length);
  return users;
};

export const syncUser = async (user: User) => {
  // 1. Save to Local Storage (Persistence Guarantee)
  const stored = await AsyncStorage.getItem('luxe_users');
  const users: User[] = stored ? JSON.parse(stored) : [];
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  await AsyncStorage.setItem('luxe_users', JSON.stringify(users));
  console.log('[DataService] User saved to local storage:', user.id);

  // 2. Sync to Supabase if connected
  const supabase = getSupabase();
  if (!supabase) {
    console.log('[DataService] Supabase not connected, skipping sync');
    return;
  }

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription_tier: user.subscriptionTier,
      permissions: user.permissions,
      joined_at: user.joinedAt,
      api_keys: user.apiKeys,
    });
    if (error) {
      console.error('[DataService] Supabase syncUser error:', error);
    } else {
      console.log('[DataService] User synced to Supabase:', user.id);
    }
  } catch (e) {
    console.error('[DataService] Error syncing user to Supabase:', e);
  }
};

// --- Creations ---
export const fetchCreations = async (userId: string): Promise<Creation[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('creations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      if (!error && data) {
        console.log('[DataService] Fetched creations from Supabase:', data.length);
        return data.map((c: any) => ({
          id: c.id,
          type: c.type,
          url: c.url,
          thumbnailUrl: c.thumbnail_url,
          prompt: c.prompt,
          timestamp: c.timestamp,
          size: c.size,
          aspectRatio: c.aspect_ratio,
          modelId: c.model_id,
          animationSettings: c.animation_settings ? JSON.parse(c.animation_settings) : undefined,
        }));
      }
    } catch (e) {
      console.error('[DataService] Error fetching creations from Supabase:', e);
    }
  }

  // Fallback to local storage
  const stored = await AsyncStorage.getItem(`luxe_creations_${userId}`);
  const creations = stored ? JSON.parse(stored) : [];
  console.log('[DataService] Fetched creations from local storage:', creations.length);
  return creations;
};

export const saveCreation = async (creation: Creation, userId: string) => {
  // 1. Save to Local Storage
  const stored = await AsyncStorage.getItem(`luxe_creations_${userId}`);
  const creations: Creation[] = stored ? JSON.parse(stored) : [];
  creations.unshift(creation); // Add to beginning
  await AsyncStorage.setItem(`luxe_creations_${userId}`, JSON.stringify(creations));
  console.log('[DataService] Creation saved to local storage:', creation.id);

  // 2. Sync to Supabase if connected
  const supabase = getSupabase();
  if (!supabase) {
    console.log('[DataService] Supabase not connected, skipping sync');
    return;
  }

  try {
    const { error } = await supabase.from('creations').insert({
      id: creation.id,
      user_id: userId,
      type: creation.type,
      url: creation.url,
      thumbnail_url: creation.thumbnailUrl,
      prompt: creation.prompt,
      timestamp: creation.timestamp,
      size: creation.size,
      aspect_ratio: creation.aspectRatio,
      model_id: creation.modelId,
      animation_settings: creation.animationSettings
        ? JSON.stringify(creation.animationSettings)
        : null,
    });
    if (error) {
      console.error('[DataService] Supabase saveCreation error:', error);
    } else {
      console.log('[DataService] Creation synced to Supabase:', creation.id);
    }
  } catch (e) {
    console.error('[DataService] Error syncing creation to Supabase:', e);
  }
};

// --- Ads ---
export const fetchAds = async (): Promise<Advertisement[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('advertisements').select('*');
      if (!error && data) {
        console.log('[DataService] Fetched ads from Supabase:', data.length);
        return data.map((ad: any) => ({
          id: ad.id,
          clientName: ad.client_name,
          imageUrl: ad.image_url,
          linkUrl: ad.link_url,
          placement: ad.placement,
          isActive: ad.is_active,
          impressions: ad.impressions,
          clicks: ad.clicks,
          revenue: ad.revenue,
        }));
      }
    } catch (e) {
      console.error('[DataService] Error fetching ads from Supabase:', e);
    }
  }

  // Fallback to local storage
  const stored = await AsyncStorage.getItem('luxe_ads');
  const ads = stored ? JSON.parse(stored) : [];
  console.log('[DataService] Fetched ads from local storage:', ads.length);
  return ads;
};

export const trackAdImpression = async (adId: string) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('advertisements')
        .select('impressions')
        .eq('id', adId)
        .single();
      if (data) {
        await supabase
          .from('advertisements')
          .update({ impressions: (data.impressions || 0) + 1 })
          .eq('id', adId);
        console.log('[DataService] Ad impression tracked:', adId);
      }
    } catch (e) {
      console.error('[DataService] Error tracking ad impression:', e);
    }
  }
};

export const trackAdClick = async (adId: string) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('advertisements')
        .select('clicks')
        .eq('id', adId)
        .single();
      if (data) {
        await supabase
          .from('advertisements')
          .update({ clicks: (data.clicks || 0) + 1 })
          .eq('id', adId);
        console.log('[DataService] Ad click tracked:', adId);
      }
    } catch (e) {
      console.error('[DataService] Error tracking ad click:', e);
    }
  }
};

// --- Settings ---
export const fetchGlobalSettings = async (): Promise<GlobalSettings | null> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        console.log('[DataService] Fetched global settings from Supabase');
        return {
          appName: data.app_name,
          brandColor: data.brand_color,
          inkColor: data.ink_color,
          stripePublicKey: data.stripe_public_key,
          stripeSecretKey: data.stripe_secret_key,
          figmaToken: data.figma_token,
          canvaId: data.canva_id,
          snapchatAppId: data.snapchat_app_id,
          supabaseUrl: data.supabase_url,
          supabaseKey: data.supabase_key,
          enableFilters: data.enable_filters,
          enableAudio: data.enable_audio,
          enableSnapLenses: data.enable_snap_lenses,
          enableCloudImport: data.enable_cloud_import,
          enabledProviders: data.enabled_providers,
          emailRouting: data.email_routing,
          domainConfig: data.domain_config,
          socialLinks: data.social_links,
        };
      }
    } catch (e) {
      console.error('[DataService] Error fetching global settings from Supabase:', e);
    }
  }

  // Fallback to local storage
  const stored = await AsyncStorage.getItem('luxe_global_settings');
  if (stored) {
    console.log('[DataService] Fetched global settings from local storage');
    return JSON.parse(stored);
  }

  return null;
};

export const saveGlobalSettings = async (settings: GlobalSettings) => {
  // Save to local storage for bootstrapping
  await AsyncStorage.setItem('luxe_global_settings', JSON.stringify(settings));
  console.log('[DataService] Global settings saved to local storage');

  // Re-init client if keys changed
  if (settings.supabaseUrl && settings.supabaseKey) {
    const { initSupabase } = await import('./supabase');
    await initSupabase(settings.supabaseUrl, settings.supabaseKey);
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.log('[DataService] Supabase not connected, skipping sync');
    return;
  }

  try {
    await supabase.from('global_settings').upsert({
      id: 1,
      app_name: settings.appName,
      brand_color: settings.brandColor,
      ink_color: settings.inkColor,
      stripe_public_key: settings.stripePublicKey,
      stripe_secret_key: settings.stripeSecretKey,
      figma_token: settings.figmaToken,
      canva_id: settings.canvaId,
      snapchat_app_id: settings.snapchatAppId,
      supabase_url: settings.supabaseUrl,
      supabase_key: settings.supabaseKey,
      enable_filters: settings.enableFilters,
      enable_audio: settings.enableAudio,
      enable_snap_lenses: settings.enableSnapLenses,
      enable_cloud_import: settings.enableCloudImport,
      enabled_providers: settings.enabledProviders,
      email_routing: settings.emailRouting,
      domain_config: settings.domainConfig,
      social_links: settings.socialLinks,
    });
    console.log('[DataService] Global settings synced to Supabase');
  } catch (e) {
    console.error('[DataService] Error syncing global settings to Supabase:', e);
  }
};

// --- Waitlist ---
export const saveWaitlistEmail = async (email: string) => {
  const entry: WaitlistEntry = { email, timestamp: Date.now() };

  // Always save local backup
  const existing = await AsyncStorage.getItem('luxe_waitlist');
  const list: WaitlistEntry[] = existing ? JSON.parse(existing) : [];
  if (!list.find((e) => e.email === email)) {
    list.push(entry);
    await AsyncStorage.setItem('luxe_waitlist', JSON.stringify(list));
    console.log('[DataService] Waitlist email saved to local storage:', email);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('waitlist').insert(entry);
      if (error) {
        console.error('[DataService] Waitlist DB Error', error);
      } else {
        console.log('[DataService] Waitlist email synced to Supabase:', email);
      }
    } catch (e) {
      console.error('[DataService] Error syncing waitlist email to Supabase:', e);
    }
  }
};

export const fetchWaitlist = async (): Promise<WaitlistEntry[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('waitlist').select('*');
      if (!error && data) {
        console.log('[DataService] Fetched waitlist from Supabase:', data.length);
        return data as WaitlistEntry[];
      }
    } catch (e) {
      console.error('[DataService] Error fetching waitlist from Supabase:', e);
    }
  }

  const existing = await AsyncStorage.getItem('luxe_waitlist');
  const list = existing ? JSON.parse(existing) : [];
  console.log('[DataService] Fetched waitlist from local storage:', list.length);
  return list;
};

// --- Beta Program ---
export const fetchBetaInvites = async (): Promise<BetaInvite[]> => {
  // Local storage only for MVP
  const stored = await AsyncStorage.getItem('luxe_beta_invites');
  const invites = stored ? JSON.parse(stored) : [];
  console.log('[DataService] Fetched beta invites from local storage:', invites.length);
  return invites;
};

export const createBetaInvite = async (maxUses: number): Promise<BetaInvite> => {
  const code = 'BETA-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const invite: BetaInvite = {
    code,
    maxUses,
    usedCount: 0,
    createdAt: Date.now(),
  };
  const current = await fetchBetaInvites();
  const updated = [...current, invite];
  await AsyncStorage.setItem('luxe_beta_invites', JSON.stringify(updated));
  console.log('[DataService] Beta invite created:', code);
  return invite;
};

export const validateBetaInvite = async (code: string): Promise<boolean> => {
  const current = await fetchBetaInvites();
  const invite = current.find((i) => i.code === code);
  if (!invite) {
    console.log('[DataService] Beta invite not found:', code);
    return false;
  }
  if (invite.usedCount >= invite.maxUses) {
    console.log('[DataService] Beta invite exhausted:', code);
    return false;
  }

  // Increment usage
  invite.usedCount++;
  await AsyncStorage.setItem('luxe_beta_invites', JSON.stringify(current));
  console.log('[DataService] Beta invite validated:', code, 'uses:', invite.usedCount);
  return true;
};
