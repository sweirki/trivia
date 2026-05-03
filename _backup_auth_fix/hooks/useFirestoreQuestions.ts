import { useState, useEffect } from "react";
import { db, collection, getDocs } from "@/firebase/firebase";

export function useFirestoreQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const ref = collection(db, "questions");
        const snapshot = await getDocs(ref);

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setQuestions(data);
      } catch (err) {
        console.log("🔥 Firestore load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  return { questions, loading };
}


