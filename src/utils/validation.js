/**
 * Email validation
 * @param {*} email
 * @returns
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function safeParseJSON(input) {
  if (input == null) return input;

  // Already parsed
  if (typeof input === "object") return input;

  if (typeof input !== "string") return input;

  try {
    const parsed = JSON.parse(input);

    // Only return parsed if it becomes object or array
    if (typeof parsed === "object") {
      return parsed;
    }

    // Parsed to string/number/boolean → keep original
    return input;
  } catch {
    return input;
  }
}

// FORM
export const parseOptions = (opts) => {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  if (typeof opts === "string") {
    try {
      const parsed = JSON.parse(opts);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return []; // fallback
};
