import { writable } from "svelte/store";

interface DailyPuzzleState {
  isDaily: boolean;
  date: string;
}

function getDailyDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const dailyPuzzle = writable<DailyPuzzleState>({
  isDaily: false,
  date: ""
});

export function setDailyPuzzle(date: string) {
  dailyPuzzle.set({ isDaily: true, date });
}

export function clearDailyPuzzle() {
  dailyPuzzle.set({ isDaily: false, date: "" });
}
