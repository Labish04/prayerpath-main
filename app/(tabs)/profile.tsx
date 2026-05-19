import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { PathLogo } from '../../components/PathLogo';
import { Settings, Shield, Clock, Volume2, PenTool, User as UserIcon, Bell, HelpCircle, ChevronRight, Pause, HandMetal, FileText, Calendar, Heart, ArrowLeft, LogOut, X } from 'lucide-react-native';
import { SoftCard } from '../../components/SoftCard';
import { useUserContext } from '../../hooks/useUserContext';
import { useAnalyticsSummary } from '../../hooks/useAnalytics';
import { useLogout, useUpdateBlockedApps, useUpdateSettings } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUserContext();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [reflectionEnabled, setReflectionEnabled] = useState(true);

  const [showAppsModal, setShowAppsModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  
  const { mutateAsync: updateBlockedApps, isPending: isUpdatingApps } = useUpdateBlockedApps();
  const { mutateAsync: updateSettings, isPending: isUpdatingSettings } = useUpdateSettings();

  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useLogout();

  const handleSelectMode = async (mode: 'soft' | 'strict') => {
    try {
      await updateSettings({ mode });
      setShowModeModal(false);
    } catch (e) {
      console.error('Failed to update mode:', e);
    }
  };

  const handleSelectFrequency = async (frequency: string) => {
    try {
      await updateSettings({ frequency });
      setShowFrequencyModal(false);
    } catch (e) {
      console.error('Failed to update frequency:', e);
    }
  };

  // All supported apps in the system
  const appOptions = [
    { name: 'Instagram', label: 'Instagram' },
    { name: 'TikTok', label: 'TikTok' },
    { name: 'YouTube', label: 'YouTube' },
    { name: 'Facebook', label: 'Facebook' },
    { name: 'X', label: 'X (Twitter)' },
    { name: 'Snapchat', label: 'Snapchat' },
    { name: 'Safari', label: 'Safari' },
  ];

  const handleToggleApp = async (appName: string, currentEnabled: boolean) => {
    const currentList = user?.blockedApps || [];
    const existingIndex = currentList.findIndex(a => a.appName === appName);
    
    let newList = [...currentList];
    if (existingIndex > -1) {
      newList[existingIndex] = {
        ...newList[existingIndex],
        isEnabled: !currentEnabled,
      };
    } else {
      newList.push({
        appName,
        isEnabled: !currentEnabled,
      });
    }

    try {
      await updateBlockedApps(newList);
    } catch (e) {
      console.error('Failed to update blocked apps:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation();
      router.replace('/onboarding');
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  };

  // Fetch active analytics summary dynamically from the backend
  const { data: analytics } = useAnalyticsSummary('Week');

  const displayInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const activeDaysThisMonth = analytics?.dailyStats ? Object.keys(analytics.dailyStats).length : 0;

  return (
    <ScreenWrapper className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} className="pt-2">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
            <ArrowLeft size={24} color="#2D4F36" />
          </TouchableOpacity>
          <PathLogo size={60} />
          <TouchableOpacity className="bg-white/50 p-2 rounded-full">
            <Settings size={24} color="#2D4F36" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="flex-row items-center mb-8">
          <View className="w-20 h-20 bg-[#E8EADE] rounded-full items-center justify-center mr-5 border-2 border-white">
            <Text className="font-serif-bold text-3xl text-primary">{displayInitial}</Text>
            <View className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
              <Text className="text-xs">🌿</Text>
            </View>
          </View>
          <View>
            <Text className="font-serif text-3xl text-primary mb-1">{user?.name || 'User'}</Text>
            <Text className="font-sans text-muted text-sm mb-2">Walking in faith. Growing in purpose.</Text>
            <View className="bg-[#F4F1EA] px-3 py-1 rounded-full flex-row items-center self-start">
              <Text className="text-sm mr-1">🔥</Text>
              <Text className="font-sans-bold text-primary text-xs">{user?.streak?.count ?? 0} Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Your Progress All Time */}
        <SoftCard className="bg-white p-5 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-sans-bold text-primary">Your Progress</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="font-sans text-primary text-xs mr-1">View Stats</Text>
              <ChevronRight size={14} color="#2D4F36" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                <Pause size={18} color="#2D4F36" />
              </View>
              <Text className="font-serif-bold text-xl text-primary">{analytics?.totalPauses ?? 0}</Text>
              <Text className="font-sans text-muted text-[10px]">Pauses</Text>
              <Text className="font-sans text-muted text-[10px]">All time</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                <HandMetal size={18} color="#2D4F36" />
              </View>
              <Text className="font-serif-bold text-xl text-primary">{analytics?.totalPrayers ?? 0}</Text>
              <Text className="font-sans text-muted text-[10px]">Prayers</Text>
              <Text className="font-sans text-muted text-[10px]">All time</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                <FileText size={18} color="#2D4F36" />
              </View>
              <Text className="font-serif-bold text-xl text-primary">{analytics?.totalReflections ?? 0}</Text>
              <Text className="font-sans text-muted text-[10px]">Reflections</Text>
              <Text className="font-sans text-muted text-[10px]">All time</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                <Calendar size={18} color="#2D4F36" />
              </View>
              <Text className="font-serif-bold text-xl text-primary">{activeDaysThisMonth}</Text>
              <Text className="font-sans text-muted text-[10px]">Days Active</Text>
              <Text className="font-sans text-muted text-[10px]">This month</Text>
            </View>
          </View>
        </SoftCard>

        {/* Settings Sections */}
        <View className="mb-8">
          <Text className="font-sans-bold text-muted text-xs uppercase tracking-wider mb-4 px-1">App Control</Text>
          <TouchableOpacity 
            onPress={() => setShowAppsModal(true)} 
            activeOpacity={0.8}
            className="mb-6"
          >
            <SoftCard className="bg-white p-4 flex-row items-center">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <Settings size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Manage Apps</Text>
                <Text className="font-sans text-muted text-xs">
                  {user?.blockedApps?.filter(a => a.isEnabled).length || 0} apps currently blocked
                </Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </SoftCard>
          </TouchableOpacity>

          <Text className="font-sans-bold text-muted text-xs uppercase tracking-wider mb-4 px-1">Mode & Frequency</Text>
          <SoftCard className="bg-white p-0 overflow-hidden mb-6">
            <TouchableOpacity 
              onPress={() => setShowModeModal(true)} 
              className="flex-row items-center p-4 border-b border-[#F4F1EA]"
              activeOpacity={0.7}
            >
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <Shield size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Mode</Text>
                <Text className="font-sans text-muted text-xs">{"You're in"} {user?.mode === 'strict' ? 'Strict Mode' : 'Soft Mode'}</Text>
              </View>
              <View className="bg-[#F4F1EA] px-2 py-1 rounded-full flex-row items-center mr-2">
                <View className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5" />
                <Text className="font-sans-bold text-primary text-[10px] capitalize">{user?.mode || 'Soft'} Mode</Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowFrequencyModal(true)} 
              className="flex-row items-center p-4"
              activeOpacity={0.7}
            >
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <Clock size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Frequency</Text>
                <Text className="font-sans text-muted text-xs">{user?.frequency || 'Every time you open selected apps'}</Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </TouchableOpacity>
          </SoftCard>

          <Text className="font-sans-bold text-muted text-xs uppercase tracking-wider mb-4 px-1">Preferences</Text>
          <SoftCard className="bg-white p-0 overflow-hidden mb-6">
            <View className="flex-row items-center p-4 border-b border-[#F4F1EA]">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <Volume2 size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Audio</Text>
                <Text className="font-sans text-muted text-xs">Play audio for prayers</Text>
              </View>
              <Switch 
                value={audioEnabled} 
                onValueChange={setAudioEnabled} 
                trackColor={{ false: '#D1D1D1', true: '#2D4F36' }}
              />
            </View>
            <TouchableOpacity className="flex-row items-center p-4 border-b border-[#F4F1EA]">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <Clock size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Prayer Length</Text>
                <Text className="font-sans text-muted text-xs">Short (10-20 seconds)</Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </TouchableOpacity>
            <View className="flex-row items-center p-4">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <PenTool size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Reflection</Text>
                <Text className="font-sans text-muted text-xs">Ask for reflection after prayer</Text>
              </View>
              <Switch 
                value={reflectionEnabled} 
                onValueChange={setReflectionEnabled} 
                trackColor={{ false: '#D1D1D1', true: '#2D4F36' }}
              />
            </View>
          </SoftCard>

          <Text className="font-sans-bold text-muted text-xs uppercase tracking-wider mb-4 px-1">Account</Text>
          <SoftCard className="bg-white p-0 overflow-hidden mb-10">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-[#F4F1EA]">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <UserIcon size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Account & Profile</Text>
                <Text className="font-sans text-muted text-xs">Update your name and email</Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4 border-b border-[#F4F1EA]">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <Bell size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Notifications</Text>
                <Text className="font-sans text-muted text-xs">Manage reminders and updates</Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4 border-b border-[#F4F1EA]">
              <View className="bg-[#F4F1EA] p-2 rounded-xl mr-4">
                <HelpCircle size={20} color="#2D4F36" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-primary">Help & Support</Text>
                <Text className="font-sans text-muted text-xs">FAQs, contact us, and resources</Text>
              </View>
              <ChevronRight size={20} color="#2D4F36" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogout}
              disabled={isLoggingOut}
              className="flex-row items-center p-4"
            >
              <View className="bg-[#FEF2F2] p-2 rounded-xl mr-4">
                <LogOut size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-[#EF4444]">Logout</Text>
                <Text className="font-sans text-muted text-xs">Sign out of your account</Text>
              </View>
              <ChevronRight size={20} color="#EF4444" />
            </TouchableOpacity>
          </SoftCard>
        </View>

        {/* Bottom Progress Card */}
        <SoftCard className="bg-[#E8EADE] p-5 mb-10 flex-row items-center">
          <View className="bg-white/50 p-2 rounded-full mr-4">
            <Heart size={24} color="#2D4F36" fill="#2D4F36" />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-primary text-sm">{"You're making progress"}</Text>
            <Text className="font-sans text-muted text-xs">Keep choosing intention over impulse.</Text>
          </View>
          <View className="w-16 h-12 items-center justify-center">
            <SunIcon />
          </View>
        </SoftCard>
      </ScrollView>

      {/* Blocked Apps Modal */}
      <Modal
        visible={showAppsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAppsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[80%] border-t border-[#E8E4D9]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="font-serif text-2xl text-primary mb-1">Blocked Apps</Text>
                <Text className="font-sans text-muted text-xs">Choose which apps Prayer Path will interrupt</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowAppsModal(false)} 
                className="bg-[#F4F1EA] p-2 rounded-full"
              >
                <X size={20} color="#2D4F36" />
              </TouchableOpacity>
            </View>

            {isUpdatingApps && (
              <View className="absolute top-6 right-16">
                <ActivityIndicator size="small" color="#2D4F36" />
              </View>
            )}

            {/* List */}
            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              <View>
                {appOptions.map((app) => {
                  const dbApp = user?.blockedApps?.find((a) => a.appName === app.name);
                  const isEnabled = dbApp ? dbApp.isEnabled : false;

                  return (
                    <View 
                      key={app.name} 
                      className="flex-row justify-between items-center p-4 bg-[#F8F7F3] rounded-2xl border border-[#E8E4D9] mb-3"
                    >
                      <View className="flex-row items-center">
                        <View className="w-2.5 h-2.5 bg-primary rounded-full mr-3 opacity-60" />
                        <Text className="font-sans-bold text-primary text-base">{app.label}</Text>
                      </View>
                      <Switch
                        value={isEnabled}
                        onValueChange={() => handleToggleApp(app.name, isEnabled)}
                        trackColor={{ false: '#D1D1D1', true: '#2D4F36' }}
                        disabled={isUpdatingApps}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Mode Selection Modal */}
      <Modal
        visible={showModeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[80%] border-t border-[#E8E4D9]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="font-serif text-2xl text-primary mb-1">Intervention Mode</Text>
                <Text className="font-sans text-muted text-xs">Choose how strictly Prayer Path enforces blocks</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowModeModal(false)} 
                className="bg-[#F4F1EA] p-2 rounded-full"
              >
                <X size={20} color="#2D4F36" />
              </TouchableOpacity>
            </View>

            {isUpdatingSettings && (
              <View className="absolute top-6 right-16">
                <ActivityIndicator size="small" color="#2D4F36" />
              </View>
            )}

            {/* Options */}
            <View className="mb-6">
              {/* Soft Mode Option */}
              <TouchableOpacity
                onPress={() => handleSelectMode('soft')}
                disabled={isUpdatingSettings}
                className={`p-5 rounded-2xl border mb-4 flex-row justify-between items-center ${
                  user?.mode === 'soft' || !user?.mode
                    ? 'bg-primary/5 border-primary'
                    : 'bg-[#F8F7F3] border-[#E8E4D9]'
                }`}
              >
                <View className="flex-1 mr-4">
                  <Text className="font-sans-bold text-primary text-base mb-1">Soft Mode</Text>
                  <Text className="font-sans text-muted text-xs leading-relaxed">
                    Provides a gentle pause. You can choose to skip the prayer if you are in a rush.
                  </Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  user?.mode === 'soft' || !user?.mode ? 'border-primary' : 'border-[#D1D1D1]'
                }`}>
                  {(user?.mode === 'soft' || !user?.mode) && (
                    <View className="w-2.5 h-2.5 bg-primary rounded-full" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Strict Mode Option */}
              <TouchableOpacity
                onPress={() => handleSelectMode('strict')}
                disabled={isUpdatingSettings}
                className={`p-5 rounded-2xl border flex-row justify-between items-center ${
                  user?.mode === 'strict'
                    ? 'bg-primary/5 border-primary'
                    : 'bg-[#F8F7F3] border-[#E8E4D9]'
                }`}
              >
                <View className="flex-1 mr-4">
                  <Text className="font-sans-bold text-primary text-base mb-1">Strict Mode</Text>
                  <Text className="font-sans text-muted text-xs leading-relaxed">
                    Full commitment. Blocks are locked until you complete a designated prayer. No skips.
                  </Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  user?.mode === 'strict' ? 'border-primary' : 'border-[#D1D1D1]'
                }`}>
                  {user?.mode === 'strict' && (
                    <View className="w-2.5 h-2.5 bg-primary rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Frequency Selection Modal */}
      <Modal
        visible={showFrequencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[80%] border-t border-[#E8E4D9]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="font-serif text-2xl text-primary mb-1">Interception Frequency</Text>
                <Text className="font-sans text-muted text-xs">How often should Prayer Path trigger?</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowFrequencyModal(false)} 
                className="bg-[#F4F1EA] p-2 rounded-full"
              >
                <X size={20} color="#2D4F36" />
              </TouchableOpacity>
            </View>

            {isUpdatingSettings && (
              <View className="absolute top-6 right-16">
                <ActivityIndicator size="small" color="#2D4F36" />
              </View>
            )}

            {/* Options */}
            <View className="mb-6">
              {[
                'Every time you open selected apps',
                'Once every hour',
                'Twice a day',
              ].map((freqOption) => {
                const isSelected = user?.frequency === freqOption || (!user?.frequency && freqOption === 'Every time you open selected apps');
                return (
                  <TouchableOpacity
                    key={freqOption}
                    onPress={() => handleSelectFrequency(freqOption)}
                    disabled={isUpdatingSettings}
                    className={`p-4 rounded-2xl border mb-3 flex-row justify-between items-center ${
                      isSelected
                        ? 'bg-primary/5 border-primary'
                        : 'bg-[#F8F7F3] border-[#E8E4D9]'
                    }`}
                  >
                    <Text className="font-sans-bold text-primary text-sm">{freqOption}</Text>
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-[#D1D1D1]'
                    }`}>
                      {isSelected && (
                        <View className="w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const SunIcon = () => (
  <View className="items-center justify-center">
    <View className="w-8 h-8 bg-white/40 rounded-full border border-primary/10 items-center justify-center">
      <View className="w-4 h-4 bg-[#F2994A]/20 rounded-full" />
    </View>
  </View>
);
