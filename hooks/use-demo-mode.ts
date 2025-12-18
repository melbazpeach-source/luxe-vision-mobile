import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_KEY = 'luxe_demo_mode';

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoMode();
  }, []);

  const loadDemoMode = async () => {
    try {
      const stored = await AsyncStorage.getItem(DEMO_MODE_KEY);
      setIsDemoMode(stored === 'true');
    } catch (error) {
      console.error('Error loading demo mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableDemoMode = async () => {
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      setIsDemoMode(true);
    } catch (error) {
      console.error('Error enabling demo mode:', error);
    }
  };

  const disableDemoMode = async () => {
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'false');
      setIsDemoMode(false);
    } catch (error) {
      console.error('Error disabling demo mode:', error);
    }
  };

  return {
    isDemoMode,
    loading,
    enableDemoMode,
    disableDemoMode,
  };
}

// Mock demo user
export const DEMO_USER = {
  id: 999,
  openId: 'demo_user',
  name: 'Demo User',
  email: 'demo@luxevision.app',
  loginMethod: 'demo',
  lastSignedIn: new Date(),
};
