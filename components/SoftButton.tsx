import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

interface SoftButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const SoftButton = ({ onPress, title, variant = 'primary', style, textStyle, disabled }: SoftButtonProps) => {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`h-14 rounded-2xl flex-row justify-center items-center px-6 ${isPrimary ? 'bg-primary' : 'bg-transparent border border-primary/20'}`}
      style={[
        disabled && { opacity: 0.5 },
        style
      ]}
      disabled={disabled}
      accessibilityRole="button"
    >
      <View className="flex-1 items-center">
        <Text 
          className={`font-sans-bold text-lg ${isPrimary ? 'text-white' : 'text-primary'}`}
          style={[textStyle]}
        >
          {title}
        </Text>
      </View>
      <ArrowRight size={20} color={isPrimary ? "#FFF" : "#2D4F36"} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
