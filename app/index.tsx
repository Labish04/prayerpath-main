import { Redirect } from "expo-router";
import { useUserContext } from "../hooks/useUserContext";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useUserContext();

  // If loading the token from AsyncStorage, wait and show nothing (splash stays up)
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F1E9",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2D4739" />
      </View>
    );
  }

  // Redirect based on authentic session state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
