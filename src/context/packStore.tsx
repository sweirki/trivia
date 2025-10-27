import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncPack, fetchPacks } from "../firebase/sync";
import { generateAIPack } from "../../ai/packGenerator";

const PackContext = createContext(null);

export const PackProvider = ({ children }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPacks = async () => {
      try {
        if (typeof fetchPacks !== "function") {
          console.warn("⚠️ fetchPacks not ready, using local data only.");
          const local = await AsyncStorage.getItem("packs");
          if (local) setPacks(JSON.parse(local));
          return;
        }

        const cloudPacks = await fetchPacks();

        if (Array.isArray(cloudPacks) && cloudPacks.length > 0) {
          setPacks(cloudPacks);
          await AsyncStorage.setItem("packs", JSON.stringify(cloudPacks));
        } else {
          const local = await AsyncStorage.getItem("packs");
          if (local) setPacks(JSON.parse(local));
        }
      } catch (err) {
        console.warn("⚠️ Pack load failed:", err);
        const local = await AsyncStorage.getItem("packs");
        if (local) setPacks(JSON.parse(local));
      } finally {
        setLoading(false);
      }
    };

    loadPacks();
  }, []);

  // ✅ Create a pack manually
  const createPack = async ({ name, category, questions, language = "en", source = "user" }) => {
    const newPack = { id: Date.now(), name, category, questions, language, source };
    const updated = [...packs, newPack];
    setPacks(updated);
    await AsyncStorage.setItem("packs", JSON.stringify(updated));

    try {
      if (typeof syncPack === "function") await syncPack(newPack);
    } catch (err) {
      console.warn("⚠️ syncPack failed:", err);
    }
  };

  // ✅ Auto-generate a pack (used in CreatorDashboard)
  const createAIPack = async (category = "General", difficulty = "medium") => {
    try {
      const newPack = await generateAIPack(category, difficulty);
      if (!newPack) throw new Error("AI generator returned empty pack");
      const updated = [...packs, newPack];
      setPacks(updated);
      await AsyncStorage.setItem("packs", JSON.stringify(updated));
      return newPack;
    } catch (err) {
      console.warn("createAIPack error:", err);
      throw err;
    }
  };

  const removePack = async (id) => {
    const updated = packs.filter((p) => p.id !== id);
    setPacks(updated);
    await AsyncStorage.setItem("packs", JSON.stringify(updated));
  };

  const incrementStats = (packId, correct = true) => {
    setPacks((prev) =>
      prev.map((p) =>
        p.id === packId
          ? {
              ...p,
              playCount: (p.playCount || 0) + 1,
              correctCount: correct ? (p.correctCount || 0) + 1 : p.correctCount || 0,
              incorrectCount: !correct ? (p.incorrectCount || 0) + 1 : p.incorrectCount || 0,
            }
          : p
      )
    );
  };

  const getPackById = (id) => packs.find((p) => p.id === id);

  const getFilteredPacks = ({ language, category, source }) =>
    packs.filter(
      (p) =>
        (!language || p.language === language) &&
        (!category || p.category === category) &&
        (!source || p.source === source)
    );

  return (
    <PackContext.Provider
      value={{
        packs,
        loading,
        createPack,
        createAIPack, // ✅ Added
        removePack,
        getPackById,
        getFilteredPacks,
        incrementStats,
      }}
    >
      {children}
    </PackContext.Provider>
  );
};

export const usePacks = () => useContext(PackContext);
