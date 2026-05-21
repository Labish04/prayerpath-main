import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { PathLogo } from "../components/PathLogo";
import { useLogin, useSignup, useUpdateOnboarding } from "../hooks/useAuth";
import { useUserContext } from "../hooks/useUserContext";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function AuthScreen() {
  const router = useRouter();
  const { userData } = useUserContext();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const onboardingMutation = useUpdateOnboarding();

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
    setApiError(null);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!isLogin && !name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    return isValid;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;

    if (isLogin) {
      loginMutation.mutate(
        { email: email.trim().toLowerCase(), password },
        {
          onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)");
          },
          onError: (error: any) => {
            setApiError(
              error.message || "Invalid email or password. Please try again.",
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          },
        },
      );
    } else {
      signupMutation.mutate(
        { name: name.trim(), email: email.trim().toLowerCase(), password },
        {
          onSuccess: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // After successful signup, redirect to onboarding starting from step 1 (val_1)
            router.replace("/onboarding?startStep=1" as any);
          },
          onError: (error: any) => {
            setApiError(error.message || "Email might already be registered.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          },
        },
      );
    }
  };

  const isLoading =
    loginMutation.isPending ||
    signupMutation.isPending ||
    onboardingMutation.isPending;

  return (
    <ScreenWrapper className="px-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: 40,
          }}
        >
          {/* Header Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-0 p-2 z-10"
            disabled={isLoading}
          >
            <ArrowLeft size={24} color="#2D4739" />
          </TouchableOpacity>

          <View className="items-center mb-10 mt-12">
            <PathLogo size={90} />
            <Text className="font-serif text-[32px] text-primary text-center leading-[38px] mt-6">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </Text>
            <Text className="font-sans text-primary/50 text-center text-[15px] mt-2 px-6">
              {isLogin
                ? "Sign in to restore your custom prayers, settings, and logs."
                : "Save your onboarding progress and begin your journey."}
            </Text>
          </View>

          {/* Form Fields Card */}
          <View className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm mb-6">
            {!isLogin && (
              <View className="mb-4">
                <Text className="font-sans text-primary/70 text-sm font-semibold mb-2">
                  Name
                </Text>
                <View
                  className={`bg-gray-50/50 rounded-2xl border flex-row items-center px-4 h-14 ${errors.name ? "border-red-500" : "border-gray-200"}`}
                >
                  <User size={18} color="#2D4739" opacity={0.5} />
                  <TextInput
                    className="flex-1 ml-3 font-sans text-[16px] text-primary"
                    placeholder="Jordan"
                    placeholderTextColor="rgba(45, 71, 57, 0.3)"
                    value={name}
                    onChangeText={(text) => handleInputChange(setName, text)}
                    editable={!isLoading}
                    autoCapitalize="words"
                    selectionColor="#2D4739"
                  />
                </View>
                {errors.name && (
                  <Text className="font-sans text-red-500 text-xs mt-1 ml-1">
                    {errors.name}
                  </Text>
                )}
              </View>
            )}

            <View className="mb-4">
              <Text className="font-sans text-primary/70 text-sm font-semibold mb-2">
                Email Address
              </Text>
              <View
                className={`bg-gray-50/50 rounded-2xl border flex-row items-center px-4 h-14 ${errors.email ? "border-red-500" : "border-gray-200"}`}
              >
                <Mail size={18} color="#2D4739" opacity={0.5} />
                <TextInput
                  className="flex-1 ml-3 font-sans text-[16px] text-primary"
                  placeholder="jordan@example.com"
                  placeholderTextColor="rgba(45, 71, 57, 0.3)"
                  value={email}
                  onChangeText={(text) => handleInputChange(setEmail, text)}
                  editable={!isLoading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#2D4739"
                />
              </View>
              {errors.email && (
                <Text className="font-sans text-red-500 text-xs mt-1 ml-1">
                  {errors.email}
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="font-sans text-primary/70 text-sm font-semibold mb-2">
                Password
              </Text>
              <View
                className={`bg-gray-50/50 rounded-2xl border flex-row items-center px-4 h-14 ${errors.password ? "border-red-500" : "border-gray-200"}`}
              >
                <Lock size={18} color="#2D4739" opacity={0.5} />
                <TextInput
                  className="flex-1 ml-3 font-sans text-[16px] text-primary"
                  placeholder="Password"
                  placeholderTextColor="rgba(45, 71, 57, 0.3)"
                  value={password}
                  onChangeText={(text) => handleInputChange(setPassword, text)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#2D4739"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#2D4739" opacity={0.5} />
                  ) : (
                    <Eye size={18} color="#2D4739" opacity={0.5} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="font-sans text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </Text>
              )}
            </View>

            {apiError && (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex-row items-center">
                <Text className="text-red-600 text-sm font-sans flex-1">
                  {apiError}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              className={`bg-primary h-14 rounded-2xl items-center justify-center flex-row shadow-sm ${isLoading ? "opacity-80" : ""}`}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-sans-bold text-[16px] mr-2">
                    {isLogin ? "Sign In" : "Sign Up"}
                  </Text>
                  <ArrowRight size={18} color="white" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle Login/Signup */}
          <View className="flex-row justify-center items-center">
            <Text className="font-sans text-primary/50 text-[14px]">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              disabled={isLoading}
            >
              <Text className="font-sans-bold text-primary text-[14px] underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Seed Data Demo Hints */}
          {isLogin && (
            <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-8">
              <Text className="font-sans-bold text-primary text-xs uppercase tracking-wider mb-1">
                Developer Seed Hint
              </Text>
              <Text className="font-sans text-primary/70 text-xs leading-relaxed">
                Log in with the seeded user profile to see live analytics
                instantly:
                {"\n"}• <Text className="font-sans-bold">Email:</Text>{" "}
                jordan@example.com
                {"\n"}• <Text className="font-sans-bold">Password:</Text>{" "}
                password123
              </Text>
            </View>
          )}

          {/* Skip link */}
          <TouchableOpacity
            className="items-center mt-6"
            onPress={() => router.replace("/(tabs)")}
            disabled={isLoading}
          >
            <Text className="font-sans text-primary/40 text-sm underline">
              Skip to Dashboard (Offline)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
