// this file only exists to avoid "electronAPI is not a property" errors
declare global {
  interface Window {
    electronAPI: any;
  }
}

export {};