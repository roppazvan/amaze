const PROGRESS_KEY = "amaze_progress";
const HANDLE_KEY = "amaze_handle";

export function saveProgress(attempts: Record<number, number>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(attempts));
  } catch {
    // localStorage unavailable
  }
}

export function loadProgress(): Record<number, number> | null {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveHandle(handle: string) {
  try {
    localStorage.setItem(HANDLE_KEY, handle);
  } catch {
    // localStorage unavailable
  }
}

export function loadHandle(): string {
  try {
    return localStorage.getItem(HANDLE_KEY) || "";
  } catch {
    return "";
  }
}
