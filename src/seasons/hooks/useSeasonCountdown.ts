import { useEffect, useState } from "react";
import {
  getSeasonTimeLeftMs,
  isSeasonEnded,
  formatDuration,
} from "../utils/seasonTime";

type CountdownState = {
  timeLeftMs: number;
  formatted: string;
  ended: boolean;
};

export function useSeasonCountdown(): CountdownState {
  const [timeLeftMs, setTimeLeftMs] = useState(
    getSeasonTimeLeftMs()
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeftMs(getSeasonTimeLeftMs());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const ended = isSeasonEnded();

  return {
    timeLeftMs,
    formatted: formatDuration(timeLeftMs),
    ended,
  };
}

