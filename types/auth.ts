export interface BlockedApp {
  appName: string;
  isEnabled: boolean;
}

export interface Streak {
  count: number;
  lastActiveDate: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  ageRange?: string;
  dailyScreenTimeGoal?: string;
  improvementGoals?: string[];
  triggers?: string[];
  commitmentLevel?: string;
  mode?: string;
  frequency?: string;
  blockedApps?: BlockedApp[];
  streak?: Streak;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OnboardingData {
  name?: string;
  ageRange?: string;
  dailyScreenTimeGoal?: string;
  improvementGoals?: string[];
  triggers?: string[];
  commitmentLevel?: string;
  blockedApps?: BlockedApp[];
  mode?: string;
  frequency?: string;
}

