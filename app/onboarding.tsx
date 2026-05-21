import { useRouter, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Cloud,
  EyeOff,
  Flower,
  Heart,
  Leaf,
  Lock,
  MapPin,
  Meh,
  Mountain,
  RotateCw,
  Smartphone,
  Star,
  Sun,
  Target,
  Trees,
  User,
  Zap,
} from "lucide-react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FooterIllustration } from "../components/FooterIllustration";
import { RadioOption } from "../components/RadioOption";
import { Colors } from "../shared/constants/theme";
import { useUserContext } from "../hooks/useUserContext";
import { useUpdateOnboarding } from "../hooks/useAuth";

const { width, height } = Dimensions.get("window");

const ONBOARDING_STEPS = [
  "welcome",
  "val_1",
  "val_2",
  "profile_intro",
  "age",
  "usage",
  "hook_usage",
  "val_3",
  "goals_1",
  "goals_2",
  "commitment",
  "plan_intro",
  "plan_details",
  "screen_time",
  "hook_limit",
  "apps",
  "notifications",
  "comparison",
  "paywall",
  "mode",
  "success",
];

// NativeWind shadow-* classes can crash on toggle (navigation context error).
const UNSELECTED_CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
} as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const { userData, setUserData, user } = useUserContext();
  const searchParams = useLocalSearchParams();
  const startStep = searchParams.startStep ? parseInt(searchParams.startStep as string) : 0;
  const [activePage, setActivePage] = useState(startStep);
  const updateOnboardingMutation = useUpdateOnboarding();

  const totalSteps = ONBOARDING_STEPS.length;

  // Pre-fill name from user context if available and not already set
  useEffect(() => {
    if (user?.name && !userData.name) {
      setUserData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user?.name, userData.name, setUserData]);

  const nextStep = () => {
    if (activePage < totalSteps - 1) {
      pagerRef.current?.setPage(activePage + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = useCallback(() => {
    // Navigate immediately without waiting for API call
    router.replace("/(tabs)" as any);
    
    // Save data in background without blocking navigation
    setTimeout(async () => {
      try {
        const blockedApps = [
          { appName: "Instagram", isEnabled: userData.apps?.includes("Instagram") ?? false },
          { appName: "TikTok", isEnabled: userData.apps?.includes("TikTok") ?? false },
          { appName: "YouTube", isEnabled: userData.apps?.includes("YouTube") ?? false },
          { appName: "Facebook", isEnabled: userData.apps?.includes("Facebook") ?? false },
          { appName: "X", isEnabled: userData.apps?.includes("X") ?? false },
          { appName: "Snapchat", isEnabled: userData.apps?.includes("Snapchat") ?? false },
          { appName: "Safari", isEnabled: userData.apps?.includes("Safari") ?? false },
        ];

        const onboardingData = {
          name: userData.name || user?.name || "",
          ageRange: userData.age || "",
          dailyScreenTimeGoal: userData.phoneUsage || "",
          improvementGoals: userData.goals || [],
          triggers: userData.triggers || [],
          commitmentLevel: userData.commitment || "Very committed",
          blockedApps,
          mode: userData.mode || "soft",
        };

        await updateOnboardingMutation.mutateAsync(onboardingData);
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
      }
    }, 100);
  }, [userData, user, updateOnboardingMutation]);

  const prevStep = () => {
    if (activePage > 0) {
      // Don't allow going back from hook screen as per instructions
      if (ONBOARDING_STEPS[activePage] === "hook_usage") return;
      pagerRef.current?.setPage(activePage - 1);
    }
  };

  const handleSelection = (key: string, value: any, autoNext = false) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
    if (autoNext) {
      setTimeout(() => nextStep(), 300);
    }
  };

  const toggleApp = (id: string) => {
    const currentApps = userData.apps || [];
    const newApps = currentApps.includes(id)
      ? currentApps.filter((a) => a !== id)
      : [...currentApps, id];
    setUserData((prev) => ({ ...prev, apps: newApps }));
  };

  const APPS = [
    {
      id: "TikTok",
      name: "TikTok",
      icon: "https://img.icons8.com/ios-filled/512/tiktok.png",
    },
    {
      id: "Instagram",
      name: "Instagram",
      icon: "https://img.icons8.com/color/512/instagram-new--v1.png",
    },
    {
      id: "YouTube",
      name: "YouTube",
      icon: "https://img.icons8.com/color/512/youtube-play.png",
    },
    {
      id: "Facebook",
      name: "Facebook",
      icon: "https://img.icons8.com/color/512/facebook-new.png",
    },
    {
      id: "X",
      name: "X / Twitter",
      icon: "https://cdn-icons-png.flaticon.com/512/5969/5969020.png",
    },
    {
      id: "Snapchat",
      name: "Snapchat",
      icon: "https://cdn-icons-png.flaticon.com/512/3670/3670325.png",
    },
    {
      id: "Safari",
      name: "Safari / browser",
      icon: "https://img.icons8.com/color/512/safari--v1.png",
    },
  ];

  return (
    <View className="flex-1 bg-[#F5F1E9]">
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {/* Top Header with Progress and Back */}
        <View
          className="px-6 flex-row items-center justify-between"
          style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
        >
          <View className="w-10">
            {activePage > 0 && ONBOARDING_STEPS[activePage] !== "welcome" && (
              <TouchableOpacity onPress={prevStep} style={{ padding: 4 }}>
                <ArrowLeft size={24} color="#3A5244" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-1 flex-row justify-center gap-1">
            {activePage > 0 &&
              ONBOARDING_STEPS[activePage] !== "welcome" &&
              Array.from({ length: 10 }).map((_, i) => {
                const threshold = Math.floor(
                  (activePage / (ONBOARDING_STEPS.length - 1)) * 10,
                );
                const isFilled = i <= threshold;
                return (
                  <View
                    key={i}
                    className={`w-6 h-1.5 rounded-full ${isFilled ? "bg-primary" : "bg-primary/20"}`}
                  />
                );
              })}
          </View>

          <View className="w-10" />
        </View>

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={startStep}
          onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
          scrollEnabled={false} // Disable swiping to force sequential flow
        >
          {/* 1. Welcome */}
          <View
            key="welcome"
            className="flex-1 bg-[#F5F1E9] items-center justify-start pt-16 px-8 relative overflow-hidden"
          >
            {/* Background Illustration - Watercolor path */}
            <View className="absolute bottom-0 left-0 right-0 h-[550px] -z-10">
              <Image
                source={require("../assets/images/path_bg.jpg")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>

            <View className="items-center z-10 w-full mt-10">
              {/* Logo directly on background */}
              <View className="mb-14">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[32px] text-[#2D4739] text-center leading-[38px] mb-6">
                Welcome to{"\n"}Prayer Path
              </Text>

              {/* Subtle Separator */}
              <View className="w-12 h-[1px] bg-[#2D4739]/20 mb-8" />

              <Text className="font-sans text-[#2D4739]/60 text-[18px] text-center leading-[28px] px-4">
                A calmer way to stop{"\n"}doom scrolling and{"\n"}return to
                prayer.
              </Text>
            </View>
          </View>

          {/* 2. Value Prop 1 */}
          <View
            key="val_1"
            className="flex-1 items-center justify-start pt-10 px-8 relative"
          >
            <View className="items-center z-10 w-full">
              <View className="mb-10 items-center justify-center">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[32px] text-primary text-center leading-[38px] mb-8">
                Your attention is{"\n"}
                <Text className="text-primary">valuable.{"\n"}</Text>
                Where it goes <Text className="text-[#D98A6C]">matters.</Text>
              </Text>

              <View className="px-4">
                <Text className="font-sans text-primary/70 text-lg text-center leading-relaxed mb-6">
                  It is easy to lose hours scrolling{"\n"}without realizing how
                  {"\n"}disconnected we have become.
                </Text>

                <Text className="font-sans text-primary/70 text-lg text-center leading-relaxed">
                  Prayer Path helps create small{"\n"}moments to pause, reflect,
                  and{"\n"}return to peace.
                </Text>
              </View>
            </View>
            <FooterIllustration />
          </View>

          {/* 3. Value Prop 2 */}
          <View
            key="val_2"
            className="flex-1 items-center justify-start pt-6 px-8 relative"
          >
            <View className="items-center z-10 w-full">
              <View className="mb-10 items-center justify-center">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[32px] text-primary text-center leading-[38px] mb-10">
                Prayer Path helps you{"\n"}
                put <Text className="text-[#D98A6C]">God first.</Text>
              </Text>

              <View className="w-full gap-6 px-2">
                {/* Feature 1 */}
                <View className="flex-row items-start">
                  <View className="w-12 h-12 bg-primary/5 rounded-full items-center justify-center mr-4 border border-primary/10">
                    <Heart size={22} color={Colors.light.primary} />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="font-sans text-lg text-primary leading-tight">
                      It is{" "}
                      <Text className="text-[#D98A6C] font-sans-bold">
                        simple.
                      </Text>
                    </Text>
                    <Text className="font-sans text-primary/60 text-sm mt-1">
                      Built for real life and real moments.
                    </Text>
                  </View>
                </View>

                {/* Feature 2 */}
                <View className="flex-row items-start">
                  <View className="w-12 h-12 bg-primary/5 rounded-full items-center justify-center mr-4 border border-primary/10">
                    <Calendar size={22} color={Colors.light.primary} />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="font-sans text-lg text-primary leading-tight">
                      Every{" "}
                      <Text className="text-[#D98A6C] font-sans-bold">
                        day.
                      </Text>
                    </Text>
                    <Text className="font-sans text-primary/60 text-sm mt-1">
                      Small steps lead to a stronger connection.
                    </Text>
                  </View>
                </View>

                {/* Feature 3 */}
                <View className="flex-row items-start">
                  <View className="w-12 h-12 bg-primary/5 rounded-full items-center justify-center mr-4 border border-primary/10">
                    <Lock size={22} color={Colors.light.primary} />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="font-sans text-lg text-primary leading-tight">
                      You{" "}
                      <Text className="text-[#D98A6C] font-sans-bold">
                        pray
                      </Text>{" "}
                      to unlock your apps.
                    </Text>
                    <Text className="font-sans text-primary/60 text-sm mt-1">
                      A gentle reminder to pause, pray, and refocus.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <FooterIllustration />
          </View>

          {/* 4. Profile Intro */}
          <View
            key="profile_intro"
            className="flex-1 items-center justify-start pt-10 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-6">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[36px] text-primary text-center leading-[42px] mb-4">
                Lets get to{"\n"}know you
              </Text>

              <Text className="font-sans text-primary/50 text-sm text-center leading-relaxed mb-8 px-10">
                This helps us personalize your experience and support your
                journey.
              </Text>

              <Text className="font-serif text-2xl text-primary text-center mb-1">
                What should we call you?
              </Text>
              <Text className="font-sans text-primary/40 text-sm text-center mb-8">
                You can always change this later.
              </Text>

              <View className="w-full bg-white/50 rounded-2xl border border-tan/30 flex-row items-center px-5 h-16">
                <User size={20} color={Colors.light.primary} opacity={0.6} />
                <TextInput
                  className="flex-1 ml-4 font-sans text-xl text-primary"
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(45, 71, 57, 0.3)"
                  value={userData.name}
                  onChangeText={(text) => handleSelection("name", text)}
                  style={{ height: "100%", paddingVertical: 0 }}
                  selectionColor={Colors.light.primary}
                  cursorColor={Colors.light.primary}
                  autoCapitalize="words"
                  autoFocus={true}
                />
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 5. Age Quiz */}
          <View
            key="age"
            className="flex-1 items-center justify-start pt-10 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-6">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[28px] text-primary text-center leading-[34px] mb-4">
                How old are you?
              </Text>

              <Text className="font-sans text-primary/50 text-sm text-center mb-10">
                This helps us tailor your experience.
              </Text>

              <View className="w-full">
                {["14-24", "25-34", "35-44", "45-54", "55+"].map((range) => (
                  <RadioOption
                    key={range}
                    label={range}
                    selected={userData.age === range}
                    onSelect={() => handleSelection("age", range)}
                  />
                ))}
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 6. Phone Usage Quiz */}
          <View
            key="usage"
            className="flex-1 items-center justify-start pt-10 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-6">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[28px] text-primary text-center leading-[34px] mb-4">
                How long are you on{"\n"}your phone each day?
              </Text>

              <Text className="font-sans text-primary/50 text-sm text-center mb-10 italic">
                Be honest with yourself.
              </Text>

              <View className="w-full">
                {[
                  "1-2 hours",
                  "2-3 hours",
                  "3-4 hours",
                  "4-5 hours",
                  "5-6 hours",
                  "6+ hours",
                ].map((time) => (
                  <RadioOption
                    key={time}
                    label={time}
                    selected={userData.phoneUsage === time}
                    onSelect={() => handleSelection("phoneUsage", time)}
                  />
                ))}
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 7. Hook Usage Screen */}
          <View
            key="hook_usage"
            className="flex-1 items-center justify-start pt-10 px-8 relative"
          >
            <View className="items-center z-10 w-full">
              <Text className="text-[80px] mb-10">🤯</Text>

              <Text className="font-serif text-[26px] text-primary text-center leading-[32px] mb-8">
                That is{" "}
                <Text className="text-[#D98A6C]">
                  {userData.phoneUsage || "2-3 hours"}
                </Text>
                {"\n"}
                each day, or <Text className="text-[#D98A6C]">15 hours</Text>
                {"\n"}
                every week.
              </Text>

              <Text className="font-sans text-primary/60 text-lg text-center leading-relaxed px-6">
                Small changes today can{"\n"}save years of your life.
              </Text>
            </View>

            <FooterIllustration />
          </View>

          {/* 8. Value Prop 3 */}
          <View
            key="val_3"
            className="flex-1 items-center justify-start pt-6 px-8 relative"
          >
            <View className="items-center z-10 w-full">
              <View className="mb-10 items-center justify-center">
                <Image
                  source={require("../assets/images/value_prop_3.jpg")}
                  style={{ width: 180, height: 180 }}
                  resizeMode="contain"
                />
              </View>

              <View className="gap-6">
                <Text className="font-serif text-[28px] text-primary text-center leading-[34px]">
                  You do not need a{"\n"}perfect routine.
                </Text>

                <Text className="font-serif text-[28px] text-primary text-center leading-[34px]">
                  Start with just{" "}
                  <Text className="text-[#D98A6C]">2 minutes</Text>
                  {"\n"}
                  for <Text className="text-[#D98A6C]">God</Text> today.
                </Text>

                <Text className="font-serif text-[28px] text-primary text-center leading-[34px]">
                  Small moments.{"\n"}
                  <Text className="text-[#D98A6C]">Big</Text> impact.
                </Text>

                <Text className="font-serif text-[28px] text-primary text-center leading-[34px]">
                  Lets grow closer{"\n"}
                  <Text className="text-[#D98A6C]">together.</Text>
                </Text>
              </View>
            </View>

            <FooterIllustration />
          </View>

          {/* 9. Goals 1 */}
          <View
            key="goals_1"
            className="flex-1 items-center justify-start pt-2 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-4">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[22px] text-primary text-center leading-[28px] mb-2 px-4">
                What are you hoping to improve?
              </Text>

              <Text className="font-sans text-primary/40 text-[13px] text-center mb-8 px-6">
                Choose what matters most to you.
              </Text>

              <View className="w-full">
                {[
                  {
                    label: "Reduce doom scrolling",
                    icon: <Smartphone size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Pray more consistently",
                    icon: <Heart size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Feel less distracted",
                    icon: <Brain size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Build better habits",
                    icon: <Leaf size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Start the day with God",
                    icon: <Sun size={20} color={Colors.light.primary} />,
                  },
                ].map((item) => (
                  <RadioOption
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    selected={(userData.goals || []).includes(item.label)}
                    onSelect={() => {
                      const current = userData.goals || [];
                      const next = current.includes(item.label)
                        ? current.filter((g) => g !== item.label)
                        : [...current, item.label];
                      handleSelection("goals", next);
                    }}
                  />
                ))}
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 10. Goals 2 */}
          <View
            key="goals_2"
            className="flex-1 items-center justify-start pt-2 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-4">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[22px] text-primary text-center leading-[28px] mb-2 px-4">
                What usually pulls you into scrolling?
              </Text>

              <Text className="font-sans text-primary/40 text-[13px] text-center mb-8 px-6">
                Understanding your triggers helps us guide you better.
              </Text>

              <View className="w-full">
                {[
                  {
                    label: "Boredom",
                    icon: <Meh size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Anxiety",
                    icon: <Flower size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Overthinking",
                    icon: <Cloud size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Procrastination",
                    icon: <Clock size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Habit",
                    icon: <RotateCw size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Avoiding something",
                    icon: <EyeOff size={20} color={Colors.light.primary} />,
                  },
                ].map((item) => (
                  <RadioOption
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    selected={(userData.triggers || []).includes(item.label)}
                    onSelect={() => {
                      const current = userData.triggers || [];
                      const next = current.includes(item.label)
                        ? current.filter((g: string) => g !== item.label)
                        : [...current, item.label];
                      handleSelection("triggers", next);
                    }}
                  />
                ))}
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 11. Commitment */}
          <View
            key="commitment"
            className="flex-1 items-center justify-start pt-2 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-4">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[22px] text-primary text-center leading-[28px] mb-2 px-4">
                How committed are you to improving your goals?
              </Text>

              <Text className="font-sans text-primary/40 text-[13px] text-center mb-8 px-10 leading-relaxed">
                Your honesty helps Prayer Path personalize your journey.
              </Text>

              <View className="w-full">
                {[
                  {
                    label: "Fully committed",
                    sub: "This is a top priority in my life.",
                    icon: <Mountain size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Very committed",
                    sub: "I'm focused and stays on track most days.",
                    icon: <Trees size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Moderately committed",
                    sub: "I'm making an effort and showing up.",
                    icon: <Leaf size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Slightly committed",
                    sub: "I want to, but I'm not consistent.",
                    icon: <Cloud size={20} color={Colors.light.primary} />,
                  },
                  {
                    label: "Not ready yet",
                    sub: "I'm just exploring right now.",
                    icon: (
                      <Leaf
                        size={20}
                        color={Colors.light.primary}
                        opacity={0.6}
                      />
                    ),
                  },
                ].map((item) => (
                  <RadioOption
                    key={item.label}
                    label={item.label}
                    subLabel={item.sub}
                    icon={item.icon}
                    selected={userData.commitment === item.label}
                    onSelect={() => handleSelection("commitment", item.label)}
                  />
                ))}
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 12. Plan Intro */}
          <View
            key="plan_intro"
            className="flex-1 items-center justify-start pt-2 px-8 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-4">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              {/* Success Icon with Leaves */}
              <View className="flex-row items-center justify-center mb-6 mt-4 relative">
                <View
                  style={{ transform: [{ rotate: "-35deg" }] }}
                  className="absolute -left-12"
                >
                  <Leaf size={32} color={Colors.light.primary} opacity={0.2} />
                </View>
                <View className="w-16 h-16 bg-[#1E4D3B] rounded-full items-center justify-center mx-4 shadow-md">
                  <Check size={32} color="white" strokeWidth={3} />
                </View>
                <View
                  style={{ transform: [{ rotate: "35deg" }, { scaleX: -1 }] }}
                  className="absolute -right-12"
                >
                  <Leaf size={32} color={Colors.light.primary} opacity={0.2} />
                </View>
              </View>

              <Text className="font-serif text-[28px] text-primary text-center leading-[34px] mb-2">
                You are all set!
              </Text>
              <Text className="font-sans text-primary/40 text-[13px] text-center mb-8">
                Your answer has been saved.
              </Text>

              {/* Selection Summary Card */}
              <View className="w-full bg-white rounded-3xl p-5 flex-row items-center shadow-sm border border-black/5">
                <View className="w-14 h-14 bg-[#F2EFE9] rounded-full items-center justify-center mr-4">
                  <Target size={28} color="#1E4D3B" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-primary/40 text-[11px] mb-0.5 uppercase tracking-wider">
                    You selected:
                  </Text>
                  <Text className="font-serif text-[18px] text-[#1E4D3B] font-bold mb-0.5">
                    {userData.commitment || "Very committed"}
                  </Text>
                  <Text className="font-sans text-primary/60 text-[12px] leading-[16px]">
                    {userData.commitment === "Fully committed"
                      ? "This is a top priority in my life."
                      : userData.commitment === "Slightly committed"
                        ? "I want to, but I'm not consistent."
                        : "I'm focused and stays on track most days."}
                  </Text>
                </View>
              </View>

              <Text className="font-sans text-primary/60 text-[14px] text-center mt-10 px-6 leading-[22px]">
                Great choice! Small steps lead to big transformation. We are
                excited to walk this journey with you.
              </Text>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 13. Journey Plan Details */}
          <View
            key="plan_details"
            className="flex-1 items-center justify-start pt-2 px-6 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-6">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[22px] text-primary text-center leading-[28px] mb-2 px-4">
                Here is your journey,{"\n"}
                {userData.name || "John"}.
              </Text>
              <Text className="font-sans text-primary/40 text-[13px] text-center mb-6 px-10">
                Based on your answers, here is a personalized summary of where
                you are and where you want to be.
              </Text>

              {/* Section 1: Now */}
              <View className="w-full bg-[#F2EFE9] rounded-2xl p-4 mb-3 flex-row border border-black/5">
                <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm">
                  <MapPin size={24} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-orange-700/60 text-[10px] uppercase tracking-widest font-bold mb-1">
                    WHERE YOU ARE NOW
                  </Text>
                  <Text className="font-serif text-[15px] text-primary font-bold mb-1">
                    Life feels busy and distracting.
                  </Text>
                  <Text className="font-sans text-primary/60 text-[11px] leading-[17px]">
                    You are dealing with ups and downs, feeling low on motivation
                    and focus. It is hard to find time for prayer consistently.
                  </Text>
                </View>
              </View>

              {/* Section 2: Future */}
              <View className="w-full bg-[#EBF1ED] rounded-2xl p-4 mb-6 flex-row border border-primary/5">
                <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm">
                  <Mountain size={24} color="#1E4D3B" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-green-700/60 text-[10px] uppercase tracking-widest font-bold mb-1">
                    WHERE YOU WANT TO BE
                  </Text>
                  <Text className="font-serif text-[15px] text-primary font-bold mb-1">
                    Closer to God and living with purpose.
                  </Text>
                  <Text className="font-sans text-primary/60 text-[11px] leading-[17px]">
                    You want to build consistent prayer habits, find peace, stay
                    focused, and grow in your faith daily.
                  </Text>
                </View>
              </View>

              {/* Section 3: Path */}
              <View className="w-full">
                <Text className="font-sans text-primary/50 text-[11px] uppercase tracking-widest font-bold mb-4">
                  YOUR PERSONAL PRAYER PATH
                </Text>
                <View className="flex-row">
                  <View className="flex-1 gap-4">
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 bg-[#F2EFE9] rounded-full items-center justify-center mr-3">
                        <Leaf size={16} color={Colors.light.primary} />
                      </View>
                      <View>
                        <Text className="font-serif text-[13px] text-primary font-bold">
                          Build a daily prayer habit
                        </Text>
                        <Text className="font-sans text-primary/40 text-[11px]">
                          Start small. Stay consistent.
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 bg-[#F2EFE9] rounded-full items-center justify-center mr-3">
                        <BookOpen size={16} color={Colors.light.primary} />
                      </View>
                      <View>
                        <Text className="font-serif text-[13px] text-primary font-bold">
                          Grow in Gods Word
                        </Text>
                        <Text className="font-sans text-primary/40 text-[11px]">
                          Read, reflect, and apply.
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 bg-[#F2EFE9] rounded-full items-center justify-center mr-3">
                        <Heart size={16} color={Colors.light.primary} />
                      </View>
                      <View>
                        <Text className="font-serif text-[13px] text-primary font-bold">
                          Find peace and stay focused
                        </Text>
                        <Text className="font-sans text-primary/40 text-[11px]">
                          Let prayer quiet your mind.
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Scripture Card */}
                  <View className="w-[120px] bg-[#EBF1ED] p-4 rounded-2xl border border-primary/5 ml-6 shadow-sm">
                    <Text className="font-serif text-[11px] text-primary italic leading-[18px] text-center">
                      I can do all things through Christ who strengthens me.
                    </Text>
                    <Text className="font-sans text-primary/40 text-[9px] text-center mt-3">
                      Philippians 4:13
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="font-sans text-primary/40 text-[12px] text-center mt-8 px-6 italic">
                You do not have to figure it all out today. Prayer Path is here
                to walk with you.
              </Text>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 14. Screen Time Connectivity */}
          <View
            key="screen_time"
            className="flex-1 items-center justify-start pt-2 px-6 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="items-center justify-center mb-6">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              <View className="bg-[#EBF1ED] px-3 py-1 rounded-full mb-4">
                <Text className="text-green-800 text-[10px] font-sans-bold uppercase tracking-widest">
                  STEP 1 OF 2
                </Text>
              </View>

              <Text className="font-serif text-[26px] text-primary text-center leading-[32px] mb-3 px-4">
                Connect Screen Time{"\n"}to support your journey
              </Text>
              <Text className="font-sans text-primary/40 text-[13px] text-center mb-8 px-8 leading-[20px]">
                This helps Prayer Path understand how you use your device so we
                can help you build healthier habits and focus on what matters
                most.
              </Text>

              {/* How it works Card */}
              <View className="w-full bg-white rounded-3xl p-5 mb-4 border border-black/5 shadow-sm">
                <Text className="text-green-800 text-[12px] font-sans-bold text-center mb-4">
                  How it works
                </Text>

                {/* Mock UI */}
                <View className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <ChevronRight
                      size={16}
                      color="#007AFF"
                      style={{ transform: [{ rotate: "180deg" }] }}
                    />
                    <Text className="text-[#007AFF] text-[13px] ml-1">
                      Screen Time
                    </Text>
                    <Text className="flex-1 text-center font-sans-bold text-[13px] mr-8">
                      Screen Time
                    </Text>
                  </View>

                  <View className="bg-white rounded-xl p-4 items-center mb-4">
                    <View className="w-10 h-10 bg-[#5856D6] rounded-lg items-center justify-center mb-2">
                      <Clock size={20} color="white" />
                    </View>
                    <Text className="font-sans-bold text-[14px] mb-1">
                      Screen Time
                    </Text>
                    <Text className="text-gray-400 text-[10px] text-center">
                      Get insights about your screen time and set limits for
                      what you want to manage.
                    </Text>
                  </View>

                  <Text className="text-gray-400 text-[9px] uppercase mb-2 px-1">
                    SHARE SCREEN TIME DATA
                  </Text>
                  <View className="bg-white rounded-xl p-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full border border-primary/20 items-center justify-center mr-3">
                        <Image
                          source={require("../assets/wel.png")}
                          style={{ width: 24, height: 24 }}
                          resizeMode="contain"
                        />
                      </View>
                      <Text className="font-sans-bold text-[13px]">
                        Prayer Path
                      </Text>
                    </View>
                    <View className="w-10 h-6 bg-green-500 rounded-full items-end justify-center px-1">
                      <View className="w-4 h-4 bg-white rounded-full" />
                    </View>
                  </View>
                </View>
              </View>

              {/* Benefits Card */}
              <View className="w-full bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
                <Text className="text-green-800 text-[12px] font-sans-bold text-center mb-6">
                  What this helps you do
                </Text>

                <View className="gap-6">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-[#F2EFE9] rounded-full items-center justify-center mr-4">
                      <Zap size={24} color="#1E4D3B" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[15px] text-primary font-bold mb-0.5">
                        Understand your habits
                      </Text>
                      <Text className="font-sans text-primary/40 text-[11px] leading-[16px]">
                        See how you spend your time so you can make intentional
                        changes.
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-[#F2EFE9] rounded-full items-center justify-center mr-4">
                      <Target size={24} color="#1E4D3B" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[15px] text-primary font-bold mb-0.5">
                        Stay focused
                      </Text>
                      <Text className="font-sans text-primary/40 text-[11px] leading-[16px]">
                        We will help you minimize distractions and stay aligned
                        with your goals.
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-[#F2EFE9] rounded-full items-center justify-center mr-4">
                      <Leaf size={24} color="#1E4D3B" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[15px] text-primary font-bold mb-0.5">
                        Build better habits
                      </Text>
                      <Text className="font-sans text-primary/40 text-[11px] leading-[16px]">
                        Small changes today lead to a stronger walk with God.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-center mt-8 opacity-40">
                <Lock size={12} color={Colors.light.primary} />
                <Text className="font-sans text-[11px] ml-2">
                  Your data is private and never shared.
                </Text>
                <Text className="font-sans text-[11px] ml-1 underline">
                  Learn more
                </Text>
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 15. Hook Limit Screen */}
          <View
            key="hook_limit"
            className="flex-1 items-center justify-center px-8"
          >
            <View className="bg-orange-100 p-6 rounded-full mb-8">
              <AlertTriangle size={48} color="#F2994A" />
            </View>
            <Text className="font-serif text-3xl text-primary text-center leading-tight">
              Screen Time Limit
            </Text>
            <Text className="font-sans text-muted text-lg text-center mt-6">
              You have already spent <Text className="font-bold">42 minutes</Text>{" "}
              on Instagram today. Would you like to switch to prayer?
            </Text>
          </View>

          {/* 16. App Selection */}
          <View
            key="apps"
            className="flex-1 items-center justify-start pt-2 px-6 relative"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 160,
              }}
            >
              <View className="w-24 h-24 rounded-full items-center justify-center border border-primary/20 mb-2 overflow-hidden bg-white/50">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 85, height: 85 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[28px] text-primary text-center leading-[34px] mb-3 px-4">
                Which apps would you like{"\n"}Prayer Path to interrupt?
              </Text>
              <Text className="font-sans text-primary/40 text-[14px] text-center mb-10 px-10 leading-[20px]">
                We will gently remind you to pause and{"\n"}turn to prayer
                instead.
              </Text>

              <Text className="font-sans text-primary/30 text-[10px] uppercase tracking-widest font-bold mb-4 self-start px-2">
                SELECT THE APPS YOU WANT TO LIMIT
              </Text>

              <View className="w-full gap-2">
                {APPS.map((app) => {
                  const isSelected = (userData.apps || []).includes(app.id);
                  return (
                    <TouchableOpacity
                      key={app.id}
                      onPress={() => toggleApp(app.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: isSelected
                            ? "white"
                            : "rgba(255, 255, 255, 0.4)",
                          borderWidth: 1,
                          borderColor: isSelected
                            ? "rgba(45, 71, 57, 0.08)"
                            : "transparent",
                          marginBottom: 6,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isSelected ? 0.04 : 0,
                          shadowRadius: 2,
                          elevation: isSelected ? 1 : 0,
                        }}
                      >
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 shadow-sm overflow-hidden border border-black/5">
                            <Image
                              source={{ uri: app.icon }}
                              style={{ width: 24, height: 24 }}
                              resizeMode="contain"
                            />
                          </View>
                          <Text className="font-serif text-[15px] text-primary">
                            {app.name}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: isSelected
                              ? "#3A5244"
                              : "rgba(58, 82, 68, 0.2)",
                            backgroundColor: isSelected
                              ? "#3A5244"
                              : "transparent",
                          }}
                        >
                          {isSelected && (
                            <Check size={14} color="white" strokeWidth={3} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <FooterIllustration />
          </View>

          {/* 17. Notifications Permission */}
          <View key="notifications" className="flex-1 bg-[#F5F1E9] relative">
            <FooterIllustration />

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{ paddingBottom: 160 }}
            >
              <View className="items-center justify-start pt-16 px-8 z-10 w-full">
                <View className="items-center justify-center mb-6">
                  <Image
                    source={require("../assets/wel.png")}
                    style={{ width: 65, height: 65 }}
                    resizeMode="contain"
                  />
                </View>

                <Text className="font-serif text-[28px] text-primary text-center leading-[34px] mb-3 px-2">
                  Allow Prayer Path{"\n"}to send you notifications
                </Text>
                <Text className="font-sans text-primary/40 text-[14px] text-center mb-12 px-6 leading-[22px]">
                  We use this to allow you to unblock your apps when you need to
                  pray.
                </Text>

                {/* Mock Notification Card - Sanity check for fidelity */}
                <View className="w-full bg-white rounded-3xl p-3 flex-row items-center border border-black/5 shadow-sm mb-12">
                  <View className="w-11 h-11 bg-[#2D4739] rounded-xl items-center justify-center mr-3 overflow-hidden">
                    <Image
                      source={require("../assets/wel.png")}
                      style={{ width: 28, height: 28, tintColor: "white" }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans-bold text-[13px] text-primary">
                        Your apps are blocked!
                      </Text>
                      <Text className="text-[11px] text-primary/30 font-sans">
                        now
                      </Text>
                    </View>
                    <Text className="text-[12px] text-primary/60 font-sans">
                      Time to pray 🙏
                    </Text>
                  </View>
                </View>

                <View className="w-full gap-10 px-2">
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 bg-primary/5 rounded-full items-center justify-center mr-4">
                      <Bell
                        size={20}
                        color={Colors.light.primary}
                        fill={Colors.light.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[16px] text-primary font-bold">
                        Timely reminders
                      </Text>
                      <Text className="font-sans text-primary/40 text-[12px]">
                        We will remind you when it is time to pray.
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 bg-primary/5 rounded-full items-center justify-center mr-4">
                      <Lock
                        size={20}
                        color={Colors.light.primary}
                        fill={Colors.light.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[16px] text-primary font-bold">
                        Stay focused
                      </Text>
                      <Text className="font-sans text-primary/40 text-[12px]">
                        Block distractions and stay focused on what matters.
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 bg-primary/5 rounded-full items-center justify-center mr-4">
                      <Heart
                        size={20}
                        color={Colors.light.primary}
                        fill={Colors.light.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[16px] text-primary font-bold">
                        Build a stronger habit
                      </Text>
                      <Text className="font-sans text-primary/40 text-[12px]">
                        Consistent prayer helps you grow closer to God.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* 18. Comparison Screen */}
          <View
            key="comparison"
            className="flex-1 items-center justify-center px-8"
          >
            <Text className="font-serif text-3xl text-primary text-center leading-tight mb-10">
              After Prayer Path
            </Text>
            <View className="flex-row justify-between w-full">
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-2xl">📱</Text>
                </View>
                <Text className="text-primary text-center font-sans">
                  Scrolling{"\n"}Endlessly
                </Text>
              </View>
              <View className="items-center justify-center">
                <ChevronRight size={32} color={Colors.light.primary} />
              </View>
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-2xl">🙏</Text>
                </View>
                <Text className="text-primary text-center font-sans">
                  Peaceful{"\n"}Prayer
                </Text>
              </View>
            </View>
          </View>

          {/* 19. Paywall */}
          <View key="paywall" className="flex-1 bg-[#F5F1E9] relative">
            <FooterIllustration />

            <View className="absolute top-12 left-6 z-20">
              <TouchableOpacity onPress={nextStep}>
                <Text className="text-[#3A5244] text-2xl font-sans opacity-40">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 z-10"
              contentContainerStyle={{ paddingBottom: 160 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="items-center justify-start pt-12 px-8">
                <View className="items-center justify-center mb-6">
                  <Image
                    source={require("../assets/wel.png")}
                    style={{ width: 65, height: 65 }}
                    resizeMode="contain"
                  />
                </View>

                <View className="relative">
                  <Text className="font-serif text-[30px] text-[#3A5244] text-center leading-[36px] mb-3 px-2">
                    Unlock your full{"\n"}Prayer Path
                  </Text>
                  <View className="absolute -top-1 -right-6">
                    <Star
                      size={20}
                      color="#D4AF37"
                      fill="#D4AF37"
                      opacity={0.6}
                    />
                  </View>
                  <View className="absolute top-8 -left-6">
                    <Star
                      size={14}
                      color="#D4AF37"
                      fill="#D4AF37"
                      opacity={0.4}
                    />
                  </View>
                </View>

                <Text className="font-sans text-[#3A5244]/60 text-[14px] text-center mb-8 px-4 leading-[22px]">
                  Go deeper in your prayer life with personalized plans,
                  powerful tools, and content designed to help you grow closer
                  to God.
                </Text>

                {/* Feature Card */}
                <View className="w-full bg-white rounded-[32px] p-6 mb-4 shadow-sm">
                  <View className="gap-6">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-[#F5F1E9] rounded-full items-center justify-center mr-4">
                        <Calendar size={18} color="#3A5244" fill="#3A5244" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-bold text-[15px] text-[#3A5244]">
                          Personalized Prayer Plans
                        </Text>
                        <Text className="font-sans text-[#3A5244]/40 text-[11px]">
                          Custom plans tailored to your goals and where you are
                          in your journey.
                        </Text>
                      </View>
                    </View>
                    <View className="w-full h-[1px] bg-black/5" />
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-[#F5F1E9] rounded-full items-center justify-center mr-4">
                        <BarChart2 size={18} color="#3A5244" fill="#3A5244" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-bold text-[15px] text-[#3A5244]">
                          Track Progress & Build Habits
                        </Text>
                        <Text className="font-sans text-[#3A5244]/40 text-[11px]">
                          Stay motivated with insights, streaks, and daily
                          encouragement.
                        </Text>
                      </View>
                    </View>
                    <View className="w-full h-[1px] bg-black/5" />
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-[#F5F1E9] rounded-full items-center justify-center mr-4">
                        <Bell size={18} color="#3A5244" fill="#3A5244" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-bold text-[15px] text-[#3A5244]">
                          Smart Reminders & Notifications
                        </Text>
                        <Text className="font-sans text-[#3A5244]/40 text-[11px]">
                          Timely reminders to help you pray, reflect, and
                          grow—every day.
                        </Text>
                      </View>
                    </View>
                    <View className="w-full h-[1px] bg-black/5" />
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-[#F5F1E9] rounded-full items-center justify-center mr-4">
                        <BookOpen size={18} color="#3A5244" fill="#3A5244" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-bold text-[15px] text-[#3A5244]">
                          Exclusive Content
                        </Text>
                        <Text className="font-sans text-[#3A5244]/40 text-[11px]">
                          Access guided prayers, devotionals, and premium
                          content.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Pricing Card */}
                <View className="w-full bg-[#F5F1E9]/50 rounded-[32px] p-8 border border-primary/10 items-center">
                  <View className="bg-[#3A5244] px-4 py-1.5 rounded-full mb-4">
                    <Text className="text-white text-[10px] font-sans-bold uppercase tracking-widest">
                      7-DAY FREE TRIAL
                    </Text>
                  </View>
                  <Text className="font-serif text-[42px] text-[#3A5244] mb-1">
                    $4.99{" "}
                    <Text className="text-[20px] text-[#3A5244]/60 font-sans">
                      / month
                    </Text>
                  </Text>
                  <Text className="text-[#3A5244]/40 text-[12px] mb-6">
                    Billed monthly after trial
                  </Text>

                  <View className="w-full h-[1px] bg-black/5 mb-6" />

                  <View className="w-full gap-3 mb-8 px-4">
                    <View className="flex-row items-center">
                      <Check size={16} color="#3A5244" strokeWidth={3} />
                      <Text className="text-[14px] text-[#3A5244]/80 ml-3 font-sans-bold">
                        Full access to all features
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Check size={16} color="#3A5244" strokeWidth={3} />
                      <Text className="text-[14px] text-[#3A5244]/80 ml-3 font-sans-bold">
                        Cancel anytime
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Check size={16} color="#3A5244" strokeWidth={3} />
                      <Text className="text-[14px] text-[#3A5244]/80 ml-3 font-sans-bold">
                        Secure and private
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="w-full bg-[#2D4739] h-14 rounded-2xl items-center justify-center mb-5 shadow-sm"
                    onPress={nextStep}
                  >
                    <Text className="text-white font-sans-bold text-lg">
                      Start 7-Day Free Trial
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-[10px] text-[#3A5244]/40 text-center px-6 leading-[14px] mb-4">
                    Trial ends May 28, 2024. You will be charged $4.99/month
                    unless you cancel before the trial ends.
                  </Text>

                  <TouchableOpacity className="mb-6">
                    <Text className="text-[12px] text-[#3A5244]/60 underline font-sans-bold">
                      Restore Purchase
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-center mt-6 opacity-40">
                    <Text className="text-[10px] text-[#3A5244] text-center">
                      By continuing, you agree to our{" "}
                      <Text className="underline" onPress={() => {}}>
                        Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text className="underline" onPress={() => {}}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* 20. Mode Selection */}
          <View key="mode" className="flex-1 bg-transparent px-8 relative">
            <View className="items-center z-10 w-full pt-12">
              <Text className="font-serif text-[28px] text-[#3A5244] text-center leading-[34px] mb-2">
                How would you like{"\n"}Prayer Path to work?
              </Text>
              <Text className="font-sans text-[#3A5244]/40 text-[14px] text-center mb-10 px-6">
                Choose the experience that fits you best.
              </Text>

              <View className="w-full gap-4">
                <TouchableOpacity
                  onPress={() => handleSelection("mode", "soft")}
                  activeOpacity={0.9}
                >
                  <View
                    className={`p-6 rounded-[32px] flex-row items-center border ${userData.mode === "soft" ? "bg-[#F5F1E9] border-[#3A5244]/10" : "bg-white border-black/5"}`}
                    style={userData.mode !== "soft" ? UNSELECTED_CARD_SHADOW : undefined}
                  >
                    <View className="w-14 h-14 rounded-full bg-white items-center justify-center mr-5 border border-black/5">
                      <Leaf
                        size={24}
                        color="#3A5244"
                        fill="#3A5244"
                        opacity={0.6}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[18px] text-[#3A5244] mb-1">
                        Soft Mode
                      </Text>
                      <Text className="font-sans text-[#3A5244]/60 text-[12px] leading-[18px]">
                        You will be encouraged to pause and pray before unlocking.
                        {"\n"}
                        <Text className="text-[#3A5244]/40">
                          Gentle reminders to help you choose prayer.
                        </Text>
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border items-center justify-center ${userData.mode === "soft" ? "bg-[#3A5244] border-[#3A5244]" : "border-black/10"}`}
                    >
                      {userData.mode === "soft" && (
                        <Check size={12} color="white" strokeWidth={4} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelection("mode", "strict")}
                  activeOpacity={0.9}
                >
                  <View
                    className={`p-6 rounded-[32px] flex-row items-center border ${userData.mode === "strict" ? "bg-[#F5F1E9] border-[#3A5244]/10" : "bg-white border-black/5"}`}
                    style={userData.mode !== "strict" ? UNSELECTED_CARD_SHADOW : undefined}
                  >
                    <View className="w-14 h-14 rounded-full bg-white items-center justify-center mr-5 border border-black/5">
                      <Lock
                        size={24}
                        color="#3A5244"
                        fill="#3A5244"
                        opacity={0.6}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-[18px] text-[#3A5244] mb-1">
                        Strict Mode
                      </Text>
                      <Text className="font-sans text-[#3A5244]/60 text-[12px] leading-[18px]">
                        You must complete the prayer step before unlocking.
                        {"\n"}
                        <Text className="text-[#3A5244]/40">
                          Stronger boundaries for deeper focus.
                        </Text>
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border items-center justify-center ${userData.mode === "strict" ? "bg-[#3A5244] border-[#3A5244]" : "border-black/10"}`}
                    >
                      {userData.mode === "strict" && (
                        <Check size={12} color="white" strokeWidth={4} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-center mt-12 opacity-40">
                <Leaf size={14} color="#3A5244" />
                <Text className="font-sans text-[12px] text-[#3A5244] ml-2">
                  You can change this anytime in settings.
                </Text>
              </View>
            </View>

            <FooterIllustration />
          </View>

          {/* 21. Success / Final Step */}
          <View
            key="success"
            className="flex-1 items-center justify-start pt-2 px-6 relative"
          >
            <View className="items-center z-10 w-full">
              <View className="items-center justify-center mb-4">
                <Image
                  source={require("../assets/wel.png")}
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="font-serif text-[26px] text-primary text-center leading-[32px] mb-2 px-4">
                Lets take your{"\n"}first step together.
              </Text>
              <Text className="font-sans text-primary/40 text-[13px] text-center mb-10 px-10">
                Here is a short prayer to calm your heart.
              </Text>

              <View className="w-full bg-[#F2EFE9]/60 rounded-[32px] p-8 items-center border border-primary/5">
                <Text className="text-[32px] text-primary/20 font-serif mb-2">
                  “
                </Text>
                <Text className="font-serif text-[18px] text-primary text-center italic leading-[28px] mb-6 px-4">
                  Heavenly Father, help me to pause, turn away from
                  distractions, and draw near to You.{"\n\n"}
                  Guide my mind, calm my heart, and fill me with Your peace.
                  {"\n\n"}I choose to walk this path with You today.
                </Text>
                <Text className="font-sans text-primary/60 text-[14px] text-center">
                  In Jesus name,{"\n"}Amen.
                </Text>
                <View className="mt-8">
                  <Leaf size={24} color={Colors.light.primary} opacity={0.3} />
                </View>
              </View>
            </View>

            <FooterIllustration />
          </View>
        </PagerView>

        {/* Persistent Bottom Action - Floating above the background */}
        <View className="absolute bottom-0 left-0 right-0 px-10 pb-16 pt-0 bg-transparent z-20">
          <TouchableOpacity
            className="bg-[#3A5244] h-[64px] rounded-[24px] items-center justify-center flex-row shadow-xl relative"
            onPress={activePage === 0 ? () => router.push("/auth" as any) : ONBOARDING_STEPS[activePage] === "success" ? completeOnboarding : nextStep}
            activeOpacity={0.9}
          >
            <Text className="text-white font-sans-bold text-[18px]">
              {activePage === 0
                ? "Get Started"
                : ONBOARDING_STEPS[activePage] === "plan_intro"
                  ? "Continue your journey"
                  : ONBOARDING_STEPS[activePage] === "plan_details"
                    ? "Let's continue your journey"
                    : ONBOARDING_STEPS[activePage] === "screen_time"
                      ? "Connect Screen Time"
                      : ONBOARDING_STEPS[activePage] === "notifications"
                        ? "Allow Notifications"
                        : ONBOARDING_STEPS[activePage] === "paywall"
                          ? "Start 7-Day Free Trial"
                          : ONBOARDING_STEPS[activePage] === "success"
                            ? "Begin My Path"
                            : "Continue"}
            </Text>

            {["paywall", "notifications"].includes(
              ONBOARDING_STEPS[activePage],
            ) ? null : (
              <View className="absolute right-6">
                <ArrowRight size={20} color="white" strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>

          {/* Simple Pagination Dots for Welcome Screen */}
          {activePage === 0 && (
            <View>
              <View className="flex-row justify-center gap-3 mt-8 mb-4">
                <View className="w-2 h-2 rounded-full bg-[#3A5244]" />
                <View className="w-2 h-2 rounded-full bg-[#E9E4D9]" />
                <View className="w-2 h-2 rounded-full bg-[#E9E4D9]" />
              </View>
              <TouchableOpacity
                className="items-center py-2"
                onPress={() => router.push("/auth" as any)}
              >
                <Text className="font-sans text-primary/50 text-[15px]">
                  Already have an account?{" "}
                  <Text className="font-sans-bold text-primary underline">
                    Log In
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dynamic skip links */}
          {["screen_time", "paywall", "notifications"].includes(
            ONBOARDING_STEPS[activePage],
          ) && (
            <TouchableOpacity className="items-center mt-4" onPress={nextStep}>
              <Text className="text-primary/60 font-sans-bold text-sm">
                {ONBOARDING_STEPS[activePage] === "notifications"
                  ? "Not now"
                  : "Skip for now"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Go to Dashboard link specifically for plan_intro and plan_details */}
          {(ONBOARDING_STEPS[activePage] === "plan_intro" ||
            ONBOARDING_STEPS[activePage] === "plan_details") && (
            <TouchableOpacity
              className="items-center mt-4"
              onPress={() => router.replace("/auth" as any)}
            >
              <Text className="text-primary/60 font-sans underline text-sm">
                Go to my dashboard
              </Text>
            </TouchableOpacity>
          )}

          {/* Settings note for apps screen */}
          {ONBOARDING_STEPS[activePage] === "apps" && (
            <View className="flex-row items-center justify-center mt-4 opacity-40">
              <Lock size={12} color={Colors.light.primary} />
              <Text className="font-sans text-[10px] ml-2">
                You can change this anytime in settings.
              </Text>
            </View>
          )}

          {/* Privacy Text below button - specifically for Age screen */}
          {ONBOARDING_STEPS[activePage] === "age" && (
            <View className="flex-row items-center justify-center mt-4">
              <Lock size={12} color={Colors.light.primary} opacity={0.5} />
              <Text className="font-sans text-primary/40 text-xs ml-2">
                Your information is private and secure.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
