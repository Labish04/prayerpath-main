import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

interface OnboardingButtonProps {
  text: string;
  onPress: () => void;
  showArrow?: boolean;
  secondaryAction?: React.ReactNode;
  footerNote?: React.ReactNode;
}

export const OnboardingButton = ({ 
  text, 
  onPress, 
  showArrow = true, 
  secondaryAction,
  footerNote
}: OnboardingButtonProps) => (
  <View className="w-full mt-auto pb-10 pt-4">
    <TouchableOpacity
      className="bg-[#2D4739] h-16 rounded-[24px] items-center justify-center flex-row shadow-sm w-full"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text className="text-white font-sans-bold text-[18px] mr-3">{text}</Text>
      {showArrow && <ArrowRight size={20} color="white" strokeWidth={2.5} />}
    </TouchableOpacity>
    
    {secondaryAction && (
      <View className="items-center mt-4">
        {secondaryAction}
      </View>
    )}
    
    {footerNote && (
      <View className="flex-row items-center justify-center mt-4 opacity-40">
        {footerNote}
      </View>
    )}
  </View>
);
