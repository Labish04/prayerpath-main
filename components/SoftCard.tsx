import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface SoftCardProps {
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
}

export const SoftCard = ({ children, style, className = '' }: SoftCardProps) => {
  return (
    <View 
      className={`bg-white rounded-soft p-5 shadow-sm border border-primary/5 ${className}`}
      style={[style]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 79, 54, 0.05)',
  },
});
