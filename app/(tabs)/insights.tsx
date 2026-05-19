import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { PathLogo } from '../../components/PathLogo';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight, Pause, HandMetal, FileText, Zap, Brain, Clock, ArrowLeft } from 'lucide-react-native';
import { SoftCard } from '../../components/SoftCard';
import { useUserContext } from '../../hooks/useUserContext';
import { useAnalyticsSummary, useTodayPrayer } from '../../hooks/useAnalytics';

type PeriodType = 'Week' | 'Month' | '3 Months' | 'Year';

export default function StatsScreen() {
  const router = useRouter();
  const { user } = useUserContext();
  const [interval, setInterval] = useState<PeriodType>('Week');

  const { data: analytics, isLoading } = useAnalyticsSummary(interval);
  const { data: todayData } = useTodayPrayer();

  const totalPauses = analytics?.totalPauses || 0;
  const totalPrayers = analytics?.totalPrayers || 0;
  const totalReflections = analytics?.totalReflections || 0;
  const activeDays = Object.keys(analytics?.dailyStats || {}).length;

  // Generate dynamic graph data for the last 7 calendar days
  const getLast7Days = () => {
    const days = [];
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayName = labels[date.getDay()];
      const stats = analytics?.dailyStats?.[dateKey] || { pauses: 0, prayers: 0, reflections: 0 };
      days.push({
        label: dayName,
        value: stats.pauses,
      });
    }
    return days;
  };

  const graphData = getLast7Days();
  const maxPauses = Math.max(...graphData.map(d => d.value), 1);

  // Dynamically compute the user's most active day of the week from the logs
  const getMostActiveDay = () => {
    const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    Object.entries(analytics?.dailyStats || {}).forEach(([dateStr, stats]) => {
      const date = new Date(dateStr);
      const day = date.getDay();
      counts[day] += stats.pauses;
    });

    let maxVal = -1;
    let maxIndex = 5; // Default fallback to Friday
    counts.forEach((c, idx) => {
      if (c > maxVal) {
        maxVal = c;
        maxIndex = idx;
      }
    });

    return {
      dayName: labels[maxIndex],
      count: maxVal > 0 ? maxVal : 0,
    };
  };

  const mostActive = getMostActiveDay();
  const displayFirstName = user?.name ? user.name.split(' ')[0] : 'User';
  
  // Custom interactive goal metric
  const pausesGoal = interval === 'Week' ? 30 : interval === 'Month' ? 120 : interval === '3 Months' ? 360 : 1500;
  const progressPercent = Math.min(Math.round((totalPauses / pausesGoal) * 100), 100);

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
            <Calendar size={24} color="#2D4F36" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="font-serif text-3xl text-primary mb-1">Your Journey</Text>
          <Text className="font-sans text-muted text-lg">Awareness. Intention. Growth.</Text>
        </View>

        {/* Period Selector */}
        <View className="bg-[#E8EADE]/40 rounded-full flex-row p-1 mb-6">
          {(['Week', 'Month', '3 Months', 'Year'] as PeriodType[]).map((period) => (
            <TouchableOpacity 
              key={period} 
              onPress={() => setInterval(period)}
              className={`flex-1 py-2 rounded-full items-center ${interval === period ? 'bg-primary' : ''}`}
            >
              <Text className={`font-sans-bold text-sm ${interval === period ? 'text-white' : 'text-primary/60'}`}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#2D4F36" />
          </View>
        ) : (
          <>
            {/* Overview Cards */}
            <SoftCard className="bg-white p-5 mb-6">
              <Text className="font-sans-bold text-primary mb-4">This {interval} Overview</Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                    <Pause size={18} color="#2D4F36" />
                  </View>
                  <Text className="font-serif-bold text-xl text-primary">{totalPauses}</Text>
                  <Text className="font-sans text-muted text-xs">Pauses</Text>
                  <Text className="font-sans text-primary text-[10px] mt-1">↗ Live</Text>
                </View>
                <View className="items-center flex-1">
                  <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                    <HandMetal size={18} color="#2D4F36" />
                  </View>
                  <Text className="font-serif-bold text-xl text-primary">{totalPrayers}</Text>
                  <Text className="font-sans text-muted text-xs">Prayers</Text>
                  <Text className="font-sans text-primary text-[10px] mt-1">↗ Live</Text>
                </View>
                <View className="items-center flex-1">
                  <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                    <FileText size={18} color="#2D4F36" />
                  </View>
                  <Text className="font-serif-bold text-xl text-primary">{totalReflections}</Text>
                  <Text className="font-sans text-muted text-xs">Reflections</Text>
                  <Text className="font-sans text-primary text-[10px] mt-1">↗ Live</Text>
                </View>
                <View className="items-center flex-1">
                  <View className="bg-[#F4F1EA] p-2 rounded-full mb-2">
                    <Zap size={18} color="#2D4F36" />
                  </View>
                  <Text className="font-serif-bold text-xl text-primary">{activeDays}</Text>
                  <Text className="font-sans text-muted text-xs">Days Active</Text>
                  <Text className="font-sans text-primary text-[10px] mt-1">↗ Active</Text>
                </View>
              </View>
            </SoftCard>

            {/* Pauses Per Day Graph */}
            <SoftCard className="bg-white p-5 mb-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-sans-bold text-primary">Pauses Per Day</Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="font-sans text-primary text-xs mr-1">View Details</Text>
                  <ChevronRight size={14} color="#2D4F36" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row items-end justify-between h-40 mb-2 px-2">
                {graphData.map((val, i) => {
                  const percentHeight = Math.max(10, (val.value / maxPauses) * 100);
                  return (
                    <View key={i} className="items-center flex-1">
                      <Text className="font-sans text-muted text-[10px] mb-1">{val.value}</Text>
                      <View className="w-6 bg-primary/60 rounded-t-md" style={{ height: `${percentHeight}%` }} />
                      <Text className="font-sans text-muted text-[10px] mt-2">
                        {val.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
              
              <View className="bg-[#F4F1EA] p-3 rounded-xl flex-row items-center mt-4">
                <Text className="text-xl mr-3">🌿</Text>
                <Text className="font-sans text-primary text-xs flex-1">
                  {"Great consistency! You're showing up for your spiritual health and focus."}
                </Text>
              </View>
            </SoftCard>

            {/* Insights */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-sans-bold text-primary text-lg">Insights</Text>
                <TouchableOpacity>
                  <Text className="font-sans text-primary text-sm">View All</Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row gap-4 mb-4">
                <SoftCard className="bg-white p-4 flex-1">
                  <Text className="font-sans text-muted text-[10px] mb-1">Top Trigger This Week</Text>
                  <Text className="font-serif-bold text-lg text-primary capitalize">
                    {todayData?.topTriggerThisWeek || 'Anxiety'}
                  </Text>
                  <Text className="font-sans text-muted text-[10px] mb-2">Active</Text>
                  <View className="bg-[#F4F1EA] w-10 h-10 rounded-full items-center justify-center self-end">
                    <Brain size={20} color="#2D4F36" />
                  </View>
                </SoftCard>
                <SoftCard className="bg-white p-4 flex-1">
                  <Text className="font-sans text-muted text-[10px] mb-1">Most Active Day</Text>
                  <Text className="font-serif-bold text-lg text-primary">{mostActive.dayName}</Text>
                  <Text className="font-sans text-muted text-[10px] mb-2">{mostActive.count} pauses</Text>
                  <View className="bg-[#F4F1EA] w-10 h-10 rounded-full items-center justify-center self-end">
                    <Calendar size={20} color="#2D4F36" />
                  </View>
                </SoftCard>
              </View>
              
              <SoftCard className="bg-white p-4 flex-row items-center justify-between">
                <View>
                  <Text className="font-sans text-muted text-[10px] mb-1">Average Daily Intercepts</Text>
                  <Text className="font-serif-bold text-lg text-primary">
                    {Math.round((totalPauses / Math.max(activeDays, 1)) * 10) / 10}
                  </Text>
                  <Text className="font-sans text-muted text-[10px]">per active day</Text>
                </View>
                <View className="bg-accent/10 w-12 h-12 rounded-full items-center justify-center">
                  <Clock size={24} color="#2D4F36" />
                </View>
              </SoftCard>
            </View>

            {/* Your Progress */}
            <SoftCard className="bg-white p-5 mb-10">
              <Text className="font-sans-bold text-primary mb-1">Your Progress</Text>
              <Text className="font-sans text-muted text-xs mb-4">Keep going, {displayFirstName}. Small steps lead to big change.</Text>
              
              <View className="bg-[#F4F1EA] h-2 rounded-full overflow-hidden mb-2">
                <View className="bg-primary h-full" style={{ width: `${progressPercent}%` }} />
              </View>
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-sans-bold text-primary text-sm">{totalPauses} / {pausesGoal}</Text>
                  <Text className="font-sans text-muted text-[10px]">Pauses Goal</Text>
                </View>
                <View className="items-end">
                  <Text className="font-sans-bold text-primary text-sm">{progressPercent}%</Text>
                  <Text className="font-sans text-muted text-[10px]">This {interval}</Text>
                </View>
              </View>
            </SoftCard>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
