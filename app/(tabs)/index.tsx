import { Image } from "expo-image";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getLoginUrl } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("[HomeScreen] Auth state:", {
      hasUser: !!user,
      loading,
      isAuthenticated,
      user: user ? { id: user.id, openId: user.openId, name: user.name, email: user.email } : null,
    });
  }, [user, loading, isAuthenticated]);

  const handleLogin = async () => {
    try {
      console.log("[Auth] Login button clicked");
      setIsLoggingIn(true);
      const loginUrl = getLoginUrl();
      console.log("[Auth] Generated login URL:", loginUrl);

      // On web, use direct redirect in same tab
      // On mobile, use WebBrowser to open OAuth in a separate context
      if (Platform.OS === "web") {
        console.log("[Auth] Web platform: redirecting to OAuth in same tab...");
        window.location.href = loginUrl;
        return;
      }

      // Mobile: Open OAuth URL in browser
      // The OAuth server will redirect to our deep link (manusapp://oauth/callback?code=...&state=...)
      console.log("[Auth] Opening OAuth URL in browser...");
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        undefined, // Deep link is already configured in getLoginUrl, so no need to specify here
        {
          preferEphemeralSession: false,
          showInRecents: true,
        },
      );

      console.log("[Auth] WebBrowser result:", result);
      if (result.type === "cancel") {
        console.log("[Auth] OAuth cancelled by user");
      } else if (result.type === "dismiss") {
        console.log("[Auth] OAuth dismissed");
      } else if (result.type === "success" && result.url) {
        console.log("[Auth] OAuth session successful, navigating to callback:", result.url);
        // Extract code and state from the URL
        try {
          // Parse the URL - it might be exp:// or a regular URL
          let url: URL;
          if (result.url.startsWith("exp://") || result.url.startsWith("exps://")) {
            // For exp:// URLs, we need to parse them differently
            // Format: exp://192.168.31.156:8081/--/oauth/callback?code=...&state=...
            const urlStr = result.url.replace(/^exp(s)?:\/\//, "http://");
            url = new URL(urlStr);
          } else {
            url = new URL(result.url);
          }

          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const error = url.searchParams.get("error");

          console.log("[Auth] Extracted params from callback URL:", {
            code: code?.substring(0, 20) + "...",
            state: state?.substring(0, 20) + "...",
            error,
          });

          if (error) {
            console.error("[Auth] OAuth error in callback:", error);
            return;
          }

          if (code && state) {
            // Navigate to callback route with params
            console.log("[Auth] Navigating to callback route with params...");
            router.push({
              pathname: "/oauth/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[Auth] Missing code or state in callback URL");
          }
        } catch (err) {
          console.error("[Auth] Failed to parse callback URL:", err, result.url);
          // Fallback: try parsing with regex
          const codeMatch = result.url.match(/[?&]code=([^&]+)/);
          const stateMatch = result.url.match(/[?&]state=([^&]+)/);

          if (codeMatch && stateMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            const state = decodeURIComponent(stateMatch[1]);
            console.log("[Auth] Fallback: extracted params via regex, navigating...");
            router.push({
              pathname: "/oauth/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[Auth] Could not extract code/state from URL");
          }
        }
      }
    } catch (error) {
      console.error("[Auth] Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.authContainer}>
        {loading ? (
          <ActivityIndicator />
        ) : isAuthenticated && user ? (
          <ThemedView style={styles.userInfo}>
            <ThemedText type="subtitle">Logged in as</ThemedText>
            <ThemedText type="defaultSemiBold">{user.name || user.email || user.openId}</ThemedText>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <Pressable
            onPress={handleLogin}
            disabled={isLoggingIn}
            style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginText}>Login</ThemedText>
            )}
          </Pressable>
        )}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert("Action pressed")} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  authContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  userInfo: {
    gap: 8,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
});
