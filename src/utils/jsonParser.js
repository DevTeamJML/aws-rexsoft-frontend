/**
 * Safe parse json
 * @param {*} str 
 * @param {*} type 
 * @returns 
 */
export function jsonParser(str, type) {
  try {
    return JSON.parse(str);
  } catch (e) {
    switch (type) {
      case "string":
        return "";
      case "array":
        return [];
      case "object":
        return {};
      default:
        return "";
    }
  }
}
