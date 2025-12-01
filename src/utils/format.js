import moment from "moment";

/**
 * Date format by DD/MM/YYYY
 * @param {*} dateStr
 * @returns
 */
export function formatDateOrDefault(dateStr) {
  const date = moment(dateStr);
  // console.log(dateStr)
  return date.isValid() ? date.format("DD/MM/YYYY") : "00/00/0000";
}

/**
 * Format url by putting https://
 * @param {*} url
 * @returns
 */
export function formatUrl(url) {
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}

/**
 * Format number with comma separation
 * @param {*} url
 * @returns
 */
export function formatNumber(str) {
  if (str === "") return "";

  const [int, dec] = str.toString().split(".");
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (dec !== undefined) return `${formattedInt}.${dec}`;
  return formattedInt;
}

/**
 * Remove comma separation number format
 * @param {*} url
 * @returns
 */
export function unformatNumber(str) {
  return str.replace(/,/g, "");
}

/**
 * Convert to 12 hours format
 * @param {*} url
 * @returns
 */

export function convertTo12Hour(timeStr) {
  if (!timeStr) return ""; // handle empty or null

  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr.padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12; // convert 0 or 12 to 12

  return `${hour}:${minute} ${ampm}`;
}

// Convert nested boolean permission object -> array of keys that are true
export function flattenPermissions(nested) {
  const keys = [];
  for (const moduleKey in nested) {
    const modules = nested[moduleKey];
    for (const permKey in modules) {
      if (modules[permKey]) keys.push(permKey);
    }
  }
  return keys;
}

// Convert array of permission keys -> nested boolean object based on defaultPermissions shape
export function expandPermissions(keysArr, defaultPermissions) {
  const next = structuredClone(defaultPermissions);
  if (!Array.isArray(keysArr)) return next;
  const set = new Set(keysArr);
  for (const moduleKey in next) {
    for (const permKey in next[moduleKey]) {
      next[moduleKey][permKey] = set.has(permKey);
    }
  }
  return next;
}
