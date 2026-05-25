import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { captureError } from "./crashReporting";
import { trackEvent } from "./analytics";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ObservabilityErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    void captureError(error, {
      boundary: "root",
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  reset = () => {
    this.setState({ hasError: false });
    void trackEvent("app_opened", { recovery: true });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            The app recovered safely. Try again, and this issue can be reported through the crash layer.
          </Text>
          <Pressable onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#F6C453",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#F6C453",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#0B1220",
    fontSize: 14,
    fontWeight: "800",
  },
});


