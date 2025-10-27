'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { createClient } from '@/src/lib/supabase/client';

interface UserSettings {
  id?: string;
  buy_price: number;
  sell_price: number;
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (buyPrice: number, sellPrice: number) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({
    buy_price: 0,
    sell_price: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              buy_price: 0,
              sell_price: 0,
            })
            .select()
            .single();

          if (!insertError && newSettings) {
            setSettings(newSettings);
          }
        }
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (buyPrice: number, sellPrice: number) => {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Silently ignore if no user (happens during initial load)
        console.warn('Cannot update settings: No user found');
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .update({
          buy_price: buyPrice,
          sell_price: sellPrice,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, updateSettings, refreshSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
