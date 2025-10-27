// App.tsx
import React from "react";
import Navigation from "./src/navigation/navigation";
import { ThemeProvider } from "./src/context/ThemeProvider";
import { CoinProvider } from "./src/context/coinStore";
import { PackProvider } from "./src/context/packStore";

export default function App() {
  return (
    <ThemeProvider>
      <CoinProvider>
        <PackProvider>
          <Navigation />
        </PackProvider>
      </CoinProvider>
    </ThemeProvider>
  );
}
