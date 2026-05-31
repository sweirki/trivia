import { Redirect } from "expo-router";

export default function NotFoundScreen() {
  // Production fallback: if an old/restored route no longer exists, send the player
  // back to the real premium hub instead of showing legacy starter screens or 404 UI.
  return <Redirect href="/(app)/hub" />;
}
