
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
  if (!input) return input;

  // Already an object → return as is
  if (typeof input === "object") return input;

  // Try parsing if it's a string
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (err) {
      console.warn("Invalid JSON detected for previous_answers:", input);
      return input; // return raw if not valid JSON
    }
  }

  return input;
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
