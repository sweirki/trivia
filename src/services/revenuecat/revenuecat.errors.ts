export function normalizeRevenueCatError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return new Error(error.message);
  }

  return new Error(fallback);
}



