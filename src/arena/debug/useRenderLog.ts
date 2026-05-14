export function useRenderLog(name: string) {
  if (__DEV__) {
    console.warn(`[RENDER] ${name}`);
  }
}

