import { Stack } from "expo-router";
import { useEffect } from "react";
import { useTournamentStore } from "@/arena/store/useTournamentStore";

export default function ArenaLayout() {
  const loadActiveTournament = useTournamentStore(
    (state) => state.loadActiveTournament
  );

  useEffect(() => {
    loadActiveTournament();
  }, [loadActiveTournament]);

  return (
    <Stack
      key="arena-reset-v1"
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}


