import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBreakpoint } from '@/hooks/use-breakpoint';

const NAV_ITEMS = [
  { label: 'Studio', icon: '✦', route: '/(tabs)/' },
  { label: 'Gallery', icon: '⊞', route: '/(tabs)/gallery' },
  { label: 'Muse AI', icon: '✦', route: '/(tabs)/muse' },
  { label: 'Profile', icon: '◎', route: '/(tabs)/profile' },
];

const FEATURE_ITEMS = [
  { label: 'Prompt Builder', icon: '🎨', route: '/prompt-builder' },
  { label: 'Style Library', icon: '🎭', route: '/style-library' },
  { label: 'Style Mixer', icon: '🎛', route: '/style-mixer' },
  { label: 'Animation Timeline', icon: '🎬', route: '/animation-timeline' },
  { label: 'AR Preview', icon: '🥽', route: '/ar-preview' },
  { label: 'Collaboration', icon: '👥', route: '/workspace' },
  { label: 'Prompt History', icon: '📜', route: '/prompt-history' },
];

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { sidebarWidth, isDesktop } = useBreakpoint();
  const borderColor = useThemeColor({ light: '#222', dark: '#222' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const bgColor = useThemeColor({}, 'background');

  const isActive = (route: string) => {
    if (route === '/(tabs)/') return pathname === '/' || pathname === '/index';
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: sidebarWidth,
          borderRightColor: borderColor,
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          backgroundColor: bgColor,
        },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {isDesktop && (
          <ThemedText style={styles.logoText}>LUXE</ThemedText>
        )}
      </View>

      {/* Main Nav */}
      <View style={styles.navSection}>
        <ThemedText style={styles.sectionLabel}>MAIN</ThemedText>
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.route}
            style={[
              styles.navItem,
              isActive(item.route) && { backgroundColor: 'rgba(229,228,226,0.1)' },
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <ThemedText style={[styles.navIcon, isActive(item.route) && { color: tintColor }]}>
              {item.icon}
            </ThemedText>
            {isDesktop && (
              <ThemedText
                style={[styles.navLabel, isActive(item.route) && { color: tintColor, fontWeight: '600' }]}
              >
                {item.label}
              </ThemedText>
            )}
            {isActive(item.route) && (
              <View style={[styles.activeIndicator, { backgroundColor: tintColor }]} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Features Nav */}
      {isDesktop && (
        <View style={styles.navSection}>
          <ThemedText style={styles.sectionLabel}>FEATURES</ThemedText>
          {FEATURE_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              style={[
                styles.navItem,
                isActive(item.route) && { backgroundColor: 'rgba(229,228,226,0.1)' },
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <ThemedText style={styles.navIconSmall}>{item.icon}</ThemedText>
              <ThemedText
                style={[
                  styles.navLabelSmall,
                  isActive(item.route) && { color: tintColor },
                ]}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {/* Version */}
      {isDesktop && (
        <View style={styles.footer}>
          <ThemedText style={styles.version}>Luxe Vision v3.0</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    flexShrink: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
  },
  navSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0.4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
    gap: 12,
    position: 'relative',
  },
  navIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  navIconSmall: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  navLabelSmall: {
    fontSize: 13,
    opacity: 0.7,
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 3,
    height: 20,
    borderRadius: 2,
    marginTop: -10,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  version: {
    fontSize: 11,
    opacity: 0.3,
  },
});
