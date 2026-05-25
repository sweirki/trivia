export type CrashContext = Record<
  string,
  string | number | boolean | null | undefined
>;

export type CrashProvider = {
  captureError: (error: unknown, context?: CrashContext) => void | Promise<void>;
  setUser?: (userId: string | null) => void | Promise<void>;
  addBreadcrumb?: (
    message: string,
    context?: CrashContext
  ) => void | Promise<void>;
};

const isTestEnv =
  process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

let crashReportingEnabled = true;
let crashProvider: CrashProvider | null = null;
let currentUserId: string | null = null;

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;

  if (typeof error === "string") {
    return new Error(error);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error("Unknown error");
  }
}

function sanitizeContext(context: CrashContext = {}): CrashContext {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => {
      return (
        value === null ||
        value === undefined ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      );
    })
  );
}

export function initializeCrashReporting(provider: CrashProvider | null) {
  crashProvider = provider;
}

export function setCrashReportingEnabled(enabled: boolean) {
  crashReportingEnabled = enabled;
}

export function isCrashReportingEnabled() {
  return crashReportingEnabled;
}

export async function setCrashUser(userId: string | null) {
  currentUserId = userId;

  if (!crashReportingEnabled) return;

  try {
    await crashProvider?.setUser?.(userId);
  } catch (error) {
    if (__DEV__ && !isTestEnv) {
      console.warn("[crash] setUser failed", error);
    }
  }
}

export async function addCrashBreadcrumb(
  message: string,
  context: CrashContext = {}
) {
  if (!crashReportingEnabled) return;

  const normalizedContext = sanitizeContext(context);

  try {
    await crashProvider?.addBreadcrumb?.(message, normalizedContext);

    if (__DEV__ && !crashProvider && !isTestEnv) {
      console.log("[breadcrumb]", message, normalizedContext);
    }
  } catch (error) {
    if (__DEV__ && !isTestEnv) {
      console.warn("[crash] breadcrumb failed", error);
    }
  }
}

export async function captureError(error: unknown, context: CrashContext = {}) {
  if (!crashReportingEnabled) return;

  const normalizedError = normalizeError(error);
  const normalizedContext = sanitizeContext({
    ...context,
    userId: currentUserId,
  });

  try {
    await crashProvider?.captureError(normalizedError, normalizedContext);

    if (__DEV__ && !crashProvider && !isTestEnv) {
      console.warn("[crash]", normalizedError.message, normalizedContext);
    }
  } catch (reportingError) {
    if (__DEV__ && !isTestEnv) {
      console.warn("[crash] capture failed", reportingError);
    }
  }
}


