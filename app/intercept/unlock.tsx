import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { PathLogo } from '../../components/PathLogo';
import { CheckCircle, Lock, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useUserContext } from '../../hooks/useUserContext';

export default function UnlockScreen() {
  const router = useRouter();
  const { user } = useUserContext();

  const displayFirstName = user?.name ? user.name.split(' ')[0] : 'User';
  const targetApp = user?.blockedApps?.find(a => a.isEnabled)?.appName || 'TikTok';

  return (
    <ScreenWrapper className="px-8 justify-between py-20 bg-[#F9F7F2]">
      <View style={{ height: 24 }} />

      <View className="items-center">
        <PathLogo size={100} />
      </View>
      
      <View className="items-center">
        <View className="w-24 h-24 rounded-full items-center justify-center mb-8" style={{ backgroundColor: '#D98A6C20' }}>
          <View className="bg-[#D98A6C] w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-[#D98A6C]/40">
            <CheckCircle size={32} color="white" />
          </View>
        </View>
        
        <Text className="font-serif text-4xl text-[#3E5846] text-center leading-tight mb-4">
          Well done, {displayFirstName}.
        </Text>
        <Text className="font-sans text-[#3E5846]/60 text-xl text-center leading-relaxed">
          You paused before scrolling.{"\n"}That matters.
        </Text>
      </View>

      <View className="gap-4">
        <TouchableOpacity 
          className="bg-[#3E5846] p-5 rounded-3xl flex-row items-center justify-center shadow-md"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-white font-sans-bold text-lg">Continue to {targetApp}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="p-5 rounded-3xl border border-[#3E5846]/20 items-center justify-center"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-[#3E5846] font-sans text-base">Go back Home</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
