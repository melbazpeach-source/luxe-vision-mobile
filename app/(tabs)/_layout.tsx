import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SidebarNav } from "@/components/sidebar-nav";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isWide, isMobile } = useBreakpoint();

  if (isWide) {
    // Desktop / Tablet: sidebar + content
    return (
      <View style={styles.desktopContainer}>
        <SidebarNav />
        <View style={styles.mainContent}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarStyle: { display: 'none' }, // Hide bottom tabs on desktop
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Studio",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="wand.and.stars" color={color} />,
              }}
            />
            <Tabs.Screen
              name="gallery"
              options={{
                title: "Gallery",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="photo.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="muse"
              options={{
                title: "Muse",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profile",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
              }}
            />
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile: standard bottom tab bar
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom,
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderTopColor: '#222',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Studio",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wand.and.stars" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="photo.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="muse"
        options={{
          title: "Muse",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
});
