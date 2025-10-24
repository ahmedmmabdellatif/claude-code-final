import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Target,
  Dumbbell,
  MapPin,
  LogOut,
  ChevronRight,
  FileText,
} from 'lucide-react-native';
import { Card, Button } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProfileRow({ icon, label, value }: ProfileItem) {
  return (
    <View style={styles.profileRow}>
      <View style={styles.profileRowLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.profileLabel}>{label}</Text>
      </View>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingRowLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <ChevronRight size={20} color={colors.text.secondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .join('') || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Card style={styles.infoCard}>
            <ProfileRow
              icon={<User size={20} color={colors.accent.primary} />}
              label="Name"
              value={user?.name || 'Ahmed Hassan'}
            />
            <ProfileRow
              icon={<Mail size={20} color={colors.accent.primary} />}
              label="Email"
              value={user?.email || 'ahmed@example.com'}
            />
            <ProfileRow
              icon={<Calendar size={20} color={colors.accent.primary} />}
              label="Age"
              value="39 years"
            />
            <ProfileRow
              icon={<Target size={20} color={colors.accent.primary} />}
              label="Goal"
              value="Body Recomposition"
            />
            <ProfileRow
              icon={<Dumbbell size={20} color={colors.accent.primary} />}
              label="Experience"
              value="Beginner"
            />
            <ProfileRow
              icon={<MapPin size={20} color={colors.accent.primary} />}
              label="Location"
              value="Gym"
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Card style={styles.settingsCard}>
            <SettingRow
              icon={<User size={20} color={colors.text.secondary} />}
              label="Edit Profile"
              onPress={() => {}}
            />
            <SettingRow
              icon={<Target size={20} color={colors.text.secondary} />}
              label="Goals & Preferences"
              onPress={() => {}}
            />
            <SettingRow
              icon={<FileText size={20} color={colors.text.secondary} />}
              label="Monthly Check-In"
              onPress={() => router.push('/client/questionnaire' as never)}
            />
          </Card>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="LOGOUT"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.screen,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  userName: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoCard: {
    padding: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  profileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  profileLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  profileValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  settingsCard: {
    padding: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  logoutSection: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  logoutButton: {
    borderColor: colors.semantic.error,
  },
});
