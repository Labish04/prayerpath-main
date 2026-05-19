import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { PathLogo } from '../../components/PathLogo';
import { X, Lock, Brain, Cloud, Frown, RefreshCcw, Footprints, MoreHorizontal, Clock, ArrowLeft, Heart, Zap, Repeat, Ghost, PlusCircle } from 'lucide-react-native';
import { SoftCard } from '../../components/SoftCard';
import { useLogActionMutation } from '../../hooks/useAnalytics';

const EMOTIONS = [
  { id: 'stress', label: 'Stress', icon: Zap, color: '#F2F0F7' },
  { id: 'overthinking', label: 'Overthinking', icon: Cloud, color: '#F0F7F7' },
  { id: 'anxiety', label: 'Anxiety', icon: Frown, color: '#FFF5F0' },
  { id: 'habit', label: 'Habit', icon: Repeat, color: '#F0F7F1' },
  { id: 'avoiding', label: 'Avoiding something', icon: Ghost, color: '#F7F0F0' },
  { id: 'else', label: 'Something else', icon: MoreHorizontal, color: '#F2F2F2' },
];

export default function ReflectionScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const logActionMutation = useLogActionMutation();

  const handleSave = async () => {
    const emotionLabel = EMOTIONS.find(e => e.id === selectedEmotion)?.label || 'avoiding';
    try {
      await logActionMutation.mutateAsync({
        actionType: 'reflection',
        triggerContext: emotionLabel,
      });
    } catch (e) {
      console.error('Failed to log reflection action:', e);
    }
    router.push('/intercept/unlock');
  };

  const isLoading = logActionMutation.isPending;

  return (
    <ScreenWrapper className="px-6">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="flex-row justify-between items-center pt-2 mb-6">
            <View style={{ width: 24 }} />
            <PathLogo size={60} />
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} disabled={isLoading}>
              <X size={24} color="#3E5846" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-8">
            <Text className="font-sans text-[#3E5846]/40 text-[10px] uppercase tracking-widest mb-4">Reflection</Text>
            <Text className="font-serif text-[32px] text-[#3E5846] text-center leading-[40px]">
              What were you trying to escape or avoid just now?
            </Text>
            <View className="flex-row items-center mt-4">
              <Lock size={12} color="rgba(62, 88, 70, 0.4)" />
              <Text className="font-sans text-[#3E5846]/40 text-xs ml-1">
                Be honest with yourself. This is just for you.
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 mb-8 border border-[#E8E4D9]">
            <TextInput
              multiline
              placeholder="Type your thoughts..."
              placeholderTextColor="rgba(62, 88, 70, 0.3)"
              className="font-sans text-[#3E5846] text-lg h-32"
              textAlignVertical="top"
              maxLength={200}
              value={text}
              onChangeText={setText}
              editable={!isLoading}
            />
            <Text className="font-sans text-[#3E5846]/40 text-xs self-end mt-2">
              {text.length}/200
            </Text>
          </View>

          <Text className="font-serif text-lg text-[#3E5846] mb-4">Or choose what fits best</Text>
          
          <View className="flex-row flex-wrap justify-between mb-8">
            {EMOTIONS.map(emotion => (
              <TouchableOpacity 
                key={emotion.id}
                onPress={() => setSelectedEmotion(emotion.id)}
                className="w-[31%] mb-4"
                disabled={isLoading}
              >
                <View 
                  className={`p-4 aspect-square items-center justify-center rounded-2xl ${
                    selectedEmotion === emotion.id ? 'border-2 border-[#3E5846]' : ''
                  }`}
                  style={{ backgroundColor: emotion.color }}
                >
                  <emotion.icon size={24} color={selectedEmotion === emotion.id ? '#3E5846' : 'rgba(62, 88, 70, 0.6)'} className="mb-2" />
                  <Text className="font-sans text-[#3E5846] text-[10px] text-center">{emotion.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-[#3E5846]/5 rounded-2xl p-4 flex-row items-center mb-8">
            <View className="bg-[#3E5846] w-10 h-10 rounded-full items-center justify-center mr-4">
              <Lock size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-bold text-[#3E5846] text-sm">Your reflection is private</Text>
              <Text className="font-sans text-[#3E5846]/60 text-xs">Only you can see this. It helps you grow.</Text>
            </View>
          </View>

          <TouchableOpacity 
            className={`bg-[#3E5846] p-5 rounded-3xl flex-row items-center justify-center mb-6 ${
              isLoading ? 'opacity-85' : ''
            }`}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Lock size={20} color="white" className="mr-2" />
            <Text className="text-white font-sans-bold text-lg">
              {isLoading ? 'Saving Reflection...' : 'Save Reflection'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center mb-10"
            onPress={() => router.push('/intercept/unlock')}
            disabled={isLoading}
          >
            <Text className="font-sans text-[#3E5846]/60 text-sm">You can always <Text className="underline">skip</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
