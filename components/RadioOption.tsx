import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { SoftCard } from './SoftCard';
import { Check } from 'lucide-react-native';

interface RadioOptionProps {
  label: string;
  subLabel?: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const RadioOption = ({ label, subLabel, selected, onSelect, className = '', icon }: RadioOptionProps) => {
  return (
    <TouchableOpacity 
      onPress={onSelect}
      activeOpacity={0.7}
      className={`mb-3 ${className}`}
    >
      <View 
        className="p-4 rounded-2xl flex-row items-center border"
        style={{
          borderColor: selected ? '#2D4739' : 'rgba(0, 0, 0, 0.05)',
          backgroundColor: selected ? '#EBF1ED' : '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center flex-1">
          {icon && (
            <View className="w-10 h-10 bg-[#E9E4D9] rounded-full items-center justify-center mr-4 border border-white/20">
              {React.cloneElement(icon as React.ReactElement<any>, { size: 19 })}
            </View>
          )}
          <View className="flex-1">
            <Text className={`font-serif text-[17px] ${selected ? 'text-primary font-bold' : 'text-primary/80'}`}>
              {label}
            </Text>
            {subLabel && (
              <Text className="font-sans text-[12px] text-primary/50 mt-0.5">
                {subLabel}
              </Text>
            )}
          </View>
          {selected && (
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
              <Check size={14} color="white" strokeWidth={4} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
