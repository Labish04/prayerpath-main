import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { PathLogo } from '../../components/PathLogo';
import { useRouter } from 'expo-router';
import { Bell, Pause, HandMetal, FileText, ChevronRight, Sun, BookOpen, PlayCircle, Activity, X, Clock } from 'lucide-react-native';
import { useUserContext } from '../../hooks/useUserContext';
import { useAnalyticsSummary, useTodayPrayer } from '../../hooks/useAnalytics';
import { usePrayers } from '../../hooks/usePrayers';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserContext();

  const [showAllPrayersModal, setShowAllPrayersModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedPrayerId, setExpandedPrayerId] = useState<string | null>(null);

  // Load live statistics and today's prayer information dynamically from the backend
  const { data: analytics } = useAnalyticsSummary('Week');
  const { data: todayData } = useTodayPrayer();
  
  // Load prayers dynamically from backend using the filtered category API
  const { data: prayers, isLoading: isPrayersLoading } = usePrayers(
    selectedCategory === 'All' ? undefined : selectedCategory
  );

  const todayKey = new Date().toISOString().split('T')[0];
  const todayStats = analytics?.dailyStats?.[todayKey] || { pauses: 0, prayers: 0, reflections: 0 };
  const displayFirstName = user?.name ? user.name.split(' ')[0] : 'User';

  const categories = ['All', 'Anxiety', 'Morning', 'Focus', 'Discipline', 'Gratitude'];

  const filteredPrayers = prayers || [];

  return (
    <ScreenWrapper className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} className="pt-2">
        <View className="flex-row justify-between items-center mb-6">
          <View style={{ width: 24 }} />
          <PathLogo size={60} />
          <TouchableOpacity className="bg-white/50 p-2 rounded-full">
            <Bell size={24} color="#2D4F36" />
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="font-serif text-3xl text-[#3E5846] mb-1">Good morning, {displayFirstName}.</Text>
          <Text className="font-sans text-[#3E5846]/60 text-lg">{"You're building something that lasts."}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} className="mb-8">
          <View className="bg-[#3E5846] rounded-[32px] p-8 shadow-2xl shadow-[#3E5846]/40 relative overflow-hidden">
            {/* Decorative elements for glassmorphism feel */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#D98A6C]/20 rounded-full" />
            
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white font-serif text-xl">{"Today's Progress"}</Text>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white/90 font-sans text-xs">Keep going 🌿</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-8">
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-3 border border-white/20">
                  <Pause size={28} color="white" />
                </View>
                <Text className="text-white font-serif text-2xl">{todayStats.pauses}</Text>
                <Text className="text-white/60 font-sans text-[10px] uppercase tracking-widest mt-1">Pauses</Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-3 border border-white/20">
                  <HandMetal size={28} color="white" />
                </View>
                <Text className="text-white font-serif text-2xl">{todayStats.prayers}</Text>
                <Text className="text-white/60 font-sans text-[10px] uppercase tracking-widest mt-1">Prayers</Text>
              </View>
              
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-3 border border-white/20">
                  <FileText size={28} color="white" />
                </View>
                <Text className="text-white font-serif text-2xl">{todayStats.reflections}</Text>
                <Text className="text-white/60 font-sans text-[10px] uppercase tracking-widest mt-1">Reflections</Text>
              </View>
            </View>
            
            <Text className="text-white/50 font-sans text-center text-sm italic">
              {"\"Every pause is a step closer to growth.\""}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="mb-8">
          <View className="flex-row items-center mb-4 justify-between">
            <View className="flex-row items-center">
              <Sun size={20} color="#D98A6C" />
              <Text className="font-serif text-2xl text-[#3E5846] ml-2">{"Today's Prayer"}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAllPrayersModal(true)}>
              <Text className="text-[#3E5846]/60 font-sans text-sm">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white rounded-3xl p-6 flex-row border border-[#E8E4D9]">
            <View className="flex-1 pr-4">
              <Text className="font-sans-bold text-[#3E5846] text-lg mb-2">
                {todayData?.todaysPrayer?.title || 'Finding Peace in Chaos'}
              </Text>
              <Text className="font-sans text-[#3E5846]/70 text-sm leading-relaxed mb-6">
                {todayData?.todaysPrayer?.content 
                  ? todayData.todaysPrayer.content.substring(0, 85) + '...' 
                  : 'A short prayer to center your heart and mind today.'}
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  className="bg-[#3E5846] px-5 py-2.5 rounded-xl flex-row items-center"
                  onPress={() => router.push('/intercept')}
                >
                  <BookOpen size={16} color="white" />
                  <Text className="text-white font-sans-bold ml-2">Read</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#F4F1EA] px-5 py-2.5 rounded-xl flex-row items-center">
                  <PlayCircle size={16} color="#3E5846" />
                  <Text className="text-[#3E5846] font-sans-bold ml-2">Listen</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="w-20 h-20 items-center justify-center bg-[#F9F7F2] rounded-2xl border border-[#E8E4D9]">
              <BookOpen size={32} color="#D98A6C" />
            </View>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 mb-8 flex-row items-center justify-between border border-[#E8E4D9]">
          <View className="flex-row items-center flex-1">
            <View className="bg-[#F9F1E8] w-14 h-14 rounded-2xl items-center justify-center mr-4">
              <Activity size={28} color="#D98A6C" />
            </View>
            <View className="flex-1">
              <Text className="font-sans text-[#3E5846]/40 text-xs uppercase tracking-widest mb-1">Top Trigger This Week</Text>
              <View className="flex-row items-baseline">
                <Text className="font-serif text-2xl text-[#3E5846] capitalize">
                  {todayData?.topTriggerThisWeek || 'Anxiety'}
                </Text>
                <Text className="font-sans text-[#3E5846]/60 text-sm ml-2">
                  {todayData?.stats?.weeklyPauses 
                    ? `(${todayData.stats.weeklyPauses} pauses this week)` 
                    : todayData?.topTriggerThisWeek 
                      ? '(Active this week)' 
                      : '(No logs recorded)'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="bg-[#F4F1EA] p-3 rounded-xl">
            <ChevronRight size={20} color="#3E5846" />
          </TouchableOpacity>
        </View>

        <View className="mb-12">
          <Text className="font-serif text-xl text-[#3E5846] mb-4">Quick Start</Text>
          <TouchableOpacity 
            className="bg-white rounded-3xl p-6 flex-row items-center justify-between border border-[#E8E4D9]"
            onPress={() => router.push('/intercept')}
          >
            <View className="flex-row items-center">
              <View className="bg-[#3E5846]/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                <HandMetal size={24} color="#3E5846" />
              </View>
              <View>
                <Text className="text-[#3E5846] font-sans-bold text-lg">Start a Prayer</Text>
                <Text className="text-[#3E5846]/60 font-sans text-sm">Take a moment anytime</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#3E5846" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* All Prayers Catalog Modal */}
      <Modal
        visible={showAllPrayersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllPrayersModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#FDFCF7] rounded-t-[32px] p-6 max-h-[85%] border-t border-[#E8E4D9]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="font-serif text-2xl text-[#3E5846] mb-1">Prayers Library</Text>
                <Text className="font-sans text-[#3E5846]/60 text-xs">Explore guided prayers to anchor your day</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowAllPrayersModal(false);
                  setExpandedPrayerId(null);
                }} 
                className="bg-[#F4F1EA] p-2 rounded-full"
              >
                <X size={20} color="#3E5846" />
              </TouchableOpacity>
            </View>

            {/* Category Scroll Tabs */}
            <View className="mb-6">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setExpandedPrayerId(null);
                    }}
                    className={`px-5 py-2.5 rounded-full mr-2.5 border ${
                      selectedCategory === cat
                        ? 'bg-[#3E5846] border-[#3E5846]'
                        : 'bg-white border-[#E8E4D9]'
                    }`}
                  >
                    <Text className={`font-sans-bold text-xs ${
                      selectedCategory === cat ? 'text-white' : 'text-[#3E5846]/70'
                    }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Content Loading State */}
            {isPrayersLoading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#3E5846" />
                <Text className="font-sans text-[#3E5846]/50 text-sm mt-4">Loading prayers...</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                className="mb-4"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {filteredPrayers.length === 0 ? (
                  <View className="py-20 items-center justify-center">
                    <Text className="font-sans text-[#3E5846]/50 text-sm">No prayers found in this category.</Text>
                  </View>
                ) : (
                  filteredPrayers.map((prayer) => {
                    const isExpanded = expandedPrayerId === prayer.id;
                    return (
                      <TouchableOpacity
                        key={prayer.id}
                        onPress={() => setExpandedPrayerId(isExpanded ? null : prayer.id)}
                        activeOpacity={0.9}
                        className="bg-white rounded-3xl p-5 border border-[#E8E4D9] mb-4 shadow-sm"
                      >
                        {/* Card Top */}
                        <View className="flex-row justify-between items-start mb-2">
                          <View className="flex-1 pr-3">
                            <Text className="font-sans-bold text-[#3E5846] text-base mb-1">
                              {prayer.title}
                            </Text>
                            <View className="flex-row items-center gap-2">
                              <View className="bg-[#F4F1EA] px-2 py-0.5 rounded-md">
                                <Text className="text-[#3E5846]/70 text-[10px] font-sans-bold capitalize">
                                  {prayer.category}
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Clock size={10} color="rgba(62, 88, 70, 0.5)" style={{ marginRight: 4 }} />
                                <Text className="text-[#3E5846]/50 text-[10px] font-sans">
                                  {Math.floor(prayer.durationSeconds / 60)} min
                                </Text>
                              </View>
                            </View>
                          </View>
                          <ChevronRight 
                            size={18} 
                            color="#3E5846" 
                            style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} 
                          />
                        </View>

                        {/* Card Content (Expandable) */}
                        {isExpanded ? (
                          <View className="mt-4 pt-4 border-t border-[#F4F1EA]">
                            <Text className="font-serif text-[#3E5846]/80 text-base leading-relaxed mb-5 italic">
                              {prayer.content}
                            </Text>
                            <View className="flex-row gap-3">
                              <TouchableOpacity 
                                className="bg-[#3E5846] px-5 py-2.5 rounded-xl flex-row items-center"
                                onPress={() => {
                                  setShowAllPrayersModal(false);
                                  router.push('/intercept');
                                }}
                              >
                                <BookOpen size={16} color="white" />
                                <Text className="text-white font-sans-bold ml-2">Read Guided</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <Text className="font-sans text-[#3E5846]/50 text-xs mt-1" numberOfLines={1}>
                            {prayer.content}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => {
                setShowAllPrayersModal(false);
                setExpandedPrayerId(null);
              }}
              className="bg-[#3E5846] h-14 rounded-2xl items-center justify-center mb-4 shadow-sm"
            >
              <Text className="text-white font-sans-bold text-base">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
