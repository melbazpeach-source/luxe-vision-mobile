import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  fetchUsers,
  fetchAds,
  fetchGlobalSettings,
  saveGlobalSettings,
  fetchWaitlist,
  createBetaInvite,
} from '@/lib/data-service';
import { User, Advertisement, GlobalSettings, WaitlistEntry } from '@/types';

type AdminTab = 'users' | 'ads' | 'settings' | 'waitlist' | 'beta';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'icon');

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || (user as any).role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have permission to access the admin panel', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, adsData, settingsData, waitlistData] = await Promise.all([
        fetchUsers(),
        fetchAds(),
        fetchGlobalSettings(),
        fetchWaitlist(),
      ]);
      setUsers(usersData);
      setAds(adsData);
      setSettings(settingsData);
      setWaitlist(waitlistData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBetaCode = async () => {
    Alert.prompt(
      'Create Beta Invite',
      'Enter maximum number of uses:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (maxUses?: string) => {
            const uses = parseInt(maxUses || '10', 10);
            const invite = await createBetaInvite(uses);
            Alert.alert('Beta Code Created', `Code: ${invite.code}\nMax Uses: ${invite.maxUses}`);
          },
        },
      ],
      'plain-text',
      '10'
    );
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await saveGlobalSettings(settings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const renderTabButton = (tab: AdminTab, label: string) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabButton,
        { borderColor },
        activeTab === tab && { backgroundColor: tintColor, borderColor: tintColor },
      ]}
    >
      <ThemedText
        style={[styles.tabButtonText, activeTab === tab && { color: '#fff' }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.tabTitle}>
        Users ({users.length})
      </ThemedText>
      {users.map((u) => (
        <View key={u.id} style={[styles.listItem, { borderColor }]}>
          <View style={styles.listItemContent}>
            <ThemedText style={styles.listItemTitle}>{u.name || u.email}</ThemedText>
            <ThemedText style={styles.listItemSubtitle}>
              {u.email} • {(u as any).role || 'user'}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAdsTab = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.tabTitle}>
        Advertisements ({ads.length})
      </ThemedText>
      {ads.map((ad) => (
        <View key={ad.id} style={[styles.listItem, { borderColor }]}>
          <View style={styles.listItemContent}>
            <ThemedText style={styles.listItemTitle}>{ad.clientName}</ThemedText>
            <ThemedText style={styles.listItemSubtitle}>
              {ad.placement} • {ad.impressions} impressions • {ad.clicks} clicks
            </ThemedText>
            <ThemedText style={styles.listItemSubtitle}>Revenue: ${ad.revenue}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.tabTitle}>
        Global Settings
      </ThemedText>
      {settings && (
        <View style={[styles.card, { borderColor }]}>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>App Name</ThemedText>
            <TextInput
              style={[styles.settingInput, { borderColor, color: textColor }]}
              value={settings.appName}
              onChangeText={(text) => setSettings({ ...settings, appName: text })}
            />
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Brand Color</ThemedText>
            <TextInput
              style={[styles.settingInput, { borderColor, color: textColor }]}
              value={settings.brandColor}
              onChangeText={(text) => setSettings({ ...settings, brandColor: text })}
            />
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Supabase URL</ThemedText>
            <TextInput
              style={[styles.settingInput, { borderColor, color: textColor }]}
              value={settings.supabaseUrl}
              onChangeText={(text) => setSettings({ ...settings, supabaseUrl: text })}
              placeholder="https://your-project.supabase.co"
            />
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Supabase Key</ThemedText>
            <TextInput
              style={[styles.settingInput, { borderColor, color: textColor }]}
              value={settings.supabaseKey}
              onChangeText={(text) => setSettings({ ...settings, supabaseKey: text })}
              placeholder="Your Supabase anon key"
              secureTextEntry
            />
          </View>
          <Pressable
            style={[styles.saveButton, { backgroundColor: tintColor }]}
            onPress={handleSaveSettings}
          >
            <ThemedText style={styles.saveButtonText}>Save Settings</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderWaitlistTab = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.tabTitle}>
        Waitlist ({waitlist.length})
      </ThemedText>
      {waitlist.map((entry, index) => (
        <View key={index} style={[styles.listItem, { borderColor }]}>
          <View style={styles.listItemContent}>
            <ThemedText style={styles.listItemTitle}>{entry.email}</ThemedText>
            <ThemedText style={styles.listItemSubtitle}>
              {new Date(entry.timestamp).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBetaTab = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.tabTitle}>
        Beta Program
      </ThemedText>
      <Pressable
        style={[styles.createButton, { backgroundColor: tintColor }]}
        onPress={handleCreateBetaCode}
      >
        <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
        <ThemedText style={styles.createButtonText}>Create Beta Code</ThemedText>
      </Pressable>
      <ThemedText style={styles.infoText}>
        Beta codes allow users to access the app during the beta period. Each code can be used a
        limited number of times.
      </ThemedText>
    </View>
  );

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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={tintColor} />
        </Pressable>
        <ThemedText type="title" style={styles.title}>
          Admin Panel
        </ThemedText>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabs}>
          {renderTabButton('users', 'Users')}
          {renderTabButton('ads', 'Ads')}
          {renderTabButton('settings', 'Settings')}
          {renderTabButton('waitlist', 'Waitlist')}
          {renderTabButton('beta', 'Beta')}
        </View>
      </ScrollView>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 40) },
        ]}
      >
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : (
          <>
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'ads' && renderAdsTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'waitlist' && renderWaitlistTab()}
            {activeTab === 'beta' && renderBetaTab()}
          </>
        )}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
  },
  tabsScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  tabTitle: {
    marginBottom: 8,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  listItemContent: {
    gap: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  settingRow: {
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
});
