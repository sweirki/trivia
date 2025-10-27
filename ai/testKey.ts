import Constants from "expo-constants";
import OpenAI from "openai";

const apiKey =
  Constants.expoConfig?.extra?.OPENAI_API_KEY ||
  Constants.manifest?.extra?.OPENAI_API_KEY;

(async () => {
  try {
    const openai = new OpenAI({ apiKey });
    const models = await openai.models.list();
    console.log("✅ API key works! Models available:", models.data.length);
  } catch (err) {
    console.error("❌ Key test failed:", err);
  }
})();
