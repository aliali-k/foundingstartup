// JEE Main shift data. Update this file each year.
// Structure: year -> session -> date -> available shifts.
// Use "Only Evening Shift" / "Only Morning Shift" for single-shift days.

export type ShiftOption = "Morning Shift" | "Evening Shift" | "Only Evening Shift" | "Only Morning Shift";

export type SessionShifts = Record<string, ShiftOption[]>; // date -> shifts
export type YearShifts = Record<string, SessionShifts>;    // session label -> dates

const both: ShiftOption[] = ["Morning Shift", "Evening Shift"];
const eveningOnly: ShiftOption[] = ["Only Evening Shift"];

export const JEE_MAIN_SHIFTS: Record<number, YearShifts> = {
  2026: {
    "Session 1": {
      "Jan 21, 2026": both,
      "Jan 22, 2026": both,
      "Jan 23, 2026": both,
      "Jan 24, 2026": both,
      "Jan 28, 2026": both,
    },
    "Session 2": {
      "Apr 02, 2026": both,
      "Apr 04, 2026": both,
      "Apr 05, 2026": both,
      "Apr 06, 2026": both,
      "Apr 08, 2026": eveningOnly,
    },
  },
  2025: {
    "Session 1": {
      "Jan 22, 2025": both,
      "Jan 23, 2025": both,
      "Jan 24, 2025": both,
      "Jan 27, 2025": both,
      "Jan 28, 2025": both,
    },
    "Session 2": {
      "Apr 02, 2025": both,
      "Apr 03, 2025": both,
      "Apr 04, 2025": both,
      "Apr 07, 2025": both,
      "Apr 08, 2025": eveningOnly,
      "Apr 09, 2025": eveningOnly,
    },
  },
  2024: {
    "Session 1": {
      "Jan 27, 2024": both,
      "Jan 29, 2024": both,
      "Jan 30, 2024": both,
      "Jan 31, 2024": both,
      "Feb 01, 2024": both,
    },
    "Session 2": {
      "Apr 04, 2024": both,
      "Apr 05, 2024": both,
      "Apr 06, 2024": both,
      "Apr 08, 2024": both,
      "Apr 09, 2024": both,
    },
  },
  2023: {
    "Session 1": {
      "Jan 24, 2023": both,
      "Jan 25, 2023": both,
      "Jan 29, 2023": both,
      "Jan 30, 2023": both,
      "Jan 31, 2023": both,
      "Feb 01, 2023": both,
    },
    "Session 2": {
      "Apr 06, 2023": both,
      "Apr 08, 2023": both,
      "Apr 10, 2023": both,
      "Apr 11, 2023": both,
      "Apr 12, 2023": both,
      "Apr 13, 2023": both,
      "Apr 15, 2023": both,
    },
  },
  2022: {
    // June 23, 2022 excluded — no engineering exam conducted
    "Session 1": {
      "June 24, 2022": both,
      "June 25, 2022": both,
      "June 26, 2022": both,
      "June 27, 2022": both,
      "June 28, 2022": both,
      "June 29, 2022": both,
    },
    "Session 2": {
      "July 25, 2022": both,
      "July 26, 2022": both,
      "July 27, 2022": both,
      "July 28, 2022": both,
      "July 29, 2022": both,
      "July 30, 2022": both,
    },
  },
  2021: {
    "Session 1": {
      "Feb 24, 2021": both,
      "Feb 25, 2021": both,
      "Feb 26, 2021": both,
    },
    "Session 2": {
      "Mar 16, 2021": both,
      "Mar 17, 2021": both,
      "Mar 18, 2021": both,
    },
    "Session 3": {
      "July 20, 2021": both,
      "July 22, 2021": eveningOnly,
      "July 25, 2021": both,
      "July 27, 2021": both,
    },
    "Session 4": {
      "Aug 26, 2021": both,
      "Aug 27, 2021": both,
      "Aug 31, 2021": both,
      "Sep 01, 2021": both,
      "Sep 02, 2021": both,
    },
  },
  2020: {
    "Session 1": {
      "Jan 07, 2020": both,
      "Jan 08, 2020": both,
      "Jan 09, 2020": both,
    },
    "Session 2": {
      "Sep 02, 2020": both,
      "Sep 03, 2020": both,
      "Sep 04, 2020": both,
      "Sep 05, 2020": both,
      "Sep 06, 2020": both,
    },
  },
};
