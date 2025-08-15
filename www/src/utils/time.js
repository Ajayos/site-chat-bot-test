// utils/time.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format timestamp in a given or detected timezone
 * @param {string|number|Date} ts - The timestamp
 * @param {Object} options
 * @param {boolean} [options.twentyFourHour=false] - Use 24-hour format if true
 * @param {string} [options.format] - Custom format string
 * @param {string} [options.tz] - Timezone (default = browser's timezone)
 * @returns {string} - Formatted time string
 */
export function formatTime(ts, {
  twentyFourHour = false,
  format,
  tz
} = {}) {
  const userTz = tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Default formats
  const defaultFormat = twentyFourHour ? "HH:mm:ss" : "hh:mm:ss A";
  
  return dayjs(ts).tz(userTz).format(format || defaultFormat);
}

/**
 * Shortcut for IST (Asia/Kolkata) formatting
 */
export function formatIST(ts, {
  twentyFourHour = false,
  format
} = {}) {
  return formatTime(ts, {
    twentyFourHour,
    format,
    tz: "Asia/Kolkata"
  });
}
