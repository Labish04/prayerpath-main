import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
  useSafeArea?: boolean;
}

export const ScreenWrapper = ({ children, className = '', useSafeArea = true }: ScreenWrapperProps) => {
  if (!useSafeArea) {
    return (
      <View 
        className={`flex-1 bg-background ${className}`}
      >
        {children}
      </View>
    );
  }
  
  return (
    <SafeAreaView 
      className={`flex-1 bg-background ${className}`}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9',
  },
});
