import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { PathLogo } from '../../components/PathLogo';
import { Play, Pause, X, ArrowLeft } from 'lucide-react-native';
import { SoftCard } from '../../components/SoftCard';
import { useInterceptMutation, useLogActionMutation } from '../../hooks/useAnalytics';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '../../services/url';

export default function PrayerCardScreen() {
  const router = useRouter();
  const { trigger } = useLocalSearchParams<{ trigger: string }>();

  const interceptMutation = useInterceptMutation();
  const logActionMutation = useLogActionMutation();

  // Audio Playback State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch the designated relevant prayer for this trigger from the backend Core Intervention Engine
  useEffect(() => {
    if (trigger) {
      interceptMutation.mutate(trigger);
    } else {
      interceptMutation.mutate('Anxious'); // Fallback trigger
    }
  }, [trigger]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch((err) => console.log('Error unloading sound on unmount:', err));
      }
    };
  }, [sound]);

  // Handle cleanup when navigating away
  const cleanUpAndNavigate = async (navigateAction: () => void) => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {
        console.error('Failed to cleanup sound during navigation:', e);
      }
      setSound(null);
      setIsPlaying(false);
    }
    navigateAction();
  };

  const handleGoToReflection = async () => {
    await cleanUpAndNavigate(async () => {
      try {
        await logActionMutation.mutateAsync({
          actionType: 'prayer',
          triggerContext: trigger || 'Anxious',
        });
      } catch (e) {
        console.error('Failed to log prayer action:', e);
      }
      router.push({
        pathname: '/intercept/reflection' as any,
        params: { trigger }
      });
    });
  };

  const playSound = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const urlToPlay = interceptMutation.data?.audioPath 
          ? `${API_BASE_URL}${interceptMutation.data.audioPath}` 
          : null;
        
        if (!urlToPlay) return;

        console.log('Loading sound from:', urlToPlay);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: urlToPlay },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || (interceptMutation.data?.prayer?.durationSeconds || 0) * 1000);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
              newSound.setPositionAsync(0);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isLoading = interceptMutation.isPending || logActionMutation.isPending;

  return (
    <ScreenWrapper className="px-5">
      <View className="flex-row justify-between items-center pt-2 mb-10">
        <TouchableOpacity 
          onPress={() => cleanUpAndNavigate(() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/intercept' as any);
            }
          })} 
          disabled={isLoading}
        >
          <ArrowLeft size={24} color="#2D4F36" />
        </TouchableOpacity>
        <PathLogo size={60} />
        <TouchableOpacity 
          onPress={() => cleanUpAndNavigate(() => router.replace('/(tabs)'))} 
          disabled={isLoading}
        >
          <X size={24} color="#2D4F36" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center">
        <Text className="font-serif text-3xl text-primary text-center mb-12">
          {interceptMutation.data?.instructions || 'Take a moment to reset'}
        </Text>
        
        <SoftCard className="bg-white p-10 mb-10 items-center min-h-[340px] justify-center border border-black/5 shadow-sm">
          {interceptMutation.isPending ? (
            <ActivityIndicator size="large" color="#2D4F36" />
          ) : (
            <>
              <TouchableOpacity 
                onPress={playSound}
                className="bg-[#F4F1EA] w-16 h-16 rounded-full items-center justify-center mb-6 shadow-sm active:scale-95"
              >
                {isPlaying ? (
                  <Pause size={24} color="#2D4F36" fill="#2D4F36" />
                ) : (
                  <Play size={24} color="#2D4F36" fill="#2D4F36" />
                )}
              </TouchableOpacity>

              {/* Custom interactive look progress bar */}
              <View className="w-full px-4 mb-6">
                <View className="h-1.5 w-full bg-[#E8E4D9] rounded-full overflow-hidden mb-2">
                  <View 
                    className="h-full bg-[#2D4F36] rounded-full" 
                    style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                  />
                </View>
                <View className="flex-row justify-between px-0.5">
                  <Text className="font-sans text-[10px] text-primary/60">{formatTime(position)}</Text>
                  <Text className="font-sans text-[10px] text-primary/60">
                    {formatTime(duration || (interceptMutation.data?.prayer?.durationSeconds || 0) * 1000)}
                  </Text>
                </View>
              </View>
              
              <Text className="font-sans-bold text-primary text-xs uppercase tracking-widest mb-3">
                Category: {interceptMutation.data?.prayer?.category || 'General'}
              </Text>
              <Text className="font-serif text-2xl text-primary text-center leading-relaxed mb-6 font-semibold">
                {interceptMutation.data?.prayer?.title || 'Finding Peace'}
              </Text>
              <Text className="font-sans text-primary/80 text-center text-[16px] leading-relaxed italic">
                "{interceptMutation.data?.prayer?.content || 'Lord, guide my thoughts and my steps.'}"
              </Text>
            </>
          )}
        </SoftCard>

        <View className="gap-4">
          <TouchableOpacity 
            className={`bg-primary p-5 rounded-2xl flex-row items-center justify-center shadow-sm ${isLoading ? 'opacity-80' : ''}`}
            onPress={handleGoToReflection}
            disabled={isLoading}
          >
            <Text className="text-white font-sans-bold text-lg">
              {logActionMutation.isPending ? 'Logging Prayer...' : 'Go to Reflection'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="p-4 items-center"
            onPress={handleGoToReflection}
            disabled={isLoading}
          >
            <Text className="text-primary/60 font-sans text-base">Reflect first</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
