const REDACTED_VALUE = "[REDACTED]";

const SENSITIVE_KEY_PARTS = [
  "token",
  "refresh",
  "cookie",
  "set-cookie",
  "authorization",
  "password",
  "secret",
];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  if (normalized.includes("session") && normalized.includes("id")) {
    return true;
  }
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part));
}

function redactValue(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (depth > 6) {
    return value;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED_VALUE;
      continue;
    }
    result[key] = redactValue(nested, seen, depth + 1);
  }
  return result;
}

export function redactSensitive(input: unknown): unknown {
  return redactValue(input, new WeakSet<object>(), 0);
}
