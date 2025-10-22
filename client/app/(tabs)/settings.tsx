import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LogOut, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <User size={32} color={Colors.accent.primary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.userMeta}>
              {user?.user_metadata?.business_name || 'No business assigned'}
            </Text>
            <Text style={styles.userRole}>
              {user?.user_metadata?.role || 'Member'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <View style={styles.settingItemLeft}>
            <LogOut size={20} color={Colors.accent.primary} />
            <Text style={[styles.settingItemText, styles.signOutText]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  section: {
    marginTop: 20,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginLeft: 10,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  signOutText: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.primary,
    marginHorizontal: 10,
    marginVertical: 5,
  },
});
