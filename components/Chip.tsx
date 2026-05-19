import React from 'react';
import { TouchableOpacity, Text, ViewStyle, StyleSheet } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const Chip = ({ label, selected, onPress, style }: ChipProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-5 py-2.5 rounded-full border m-1 ${selected ? 'bg-primary border-primary' : 'bg-white border-primary/10'}`}
      style={[
        { justifyContent: 'center', alignItems: 'center' }, 
        style
      ]}
    >
      <Text className={`text-sm font-sans-bold ${selected ? 'text-white' : 'text-primary/60'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selected: {
    backgroundColor: '#2D4F36',
  }
});
