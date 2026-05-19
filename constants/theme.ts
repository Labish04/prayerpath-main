/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primaryColor = '#2D4739'; // Deep Forest Green
const backgroundColor = '#F5F1E9'; // Soft Earth Tone Background
const clayColor = '#D98A6C'; // Warm Clay

export const Colors = {
  light: {
    text: '#3E5846',
    background: backgroundColor,
    tint: primaryColor,
    icon: '#3E5846',
    tabIconDefault: '#A8B5A3',
    tabIconSelected: primaryColor,
    surface: '#FFFFFF',
    border: '#E8E4D9',
    clay: clayColor,
    primary: primaryColor,
    cream: backgroundColor,
  },
  dark: {
    text: '#F9F7F2',
    background: '#1A2E20',
    tint: '#A8B5A3',
    icon: '#A8B5A3',
    tabIconDefault: '#6B7F70',
    tabIconSelected: '#F9F7F2',
    surface: '#3E5846',
    border: '#4A6352',
    clay: '#E29E84',
    primary: '#A8B5A3',
    cream: '#1A2E20',
  },
};

export const Fonts = {
  serif: 'PlayfairDisplay_400Regular',
  serifBold: 'PlayfairDisplay_700Bold',
  sans: 'Inter_400Regular',
  sansBold: 'Inter_700Bold',
};
