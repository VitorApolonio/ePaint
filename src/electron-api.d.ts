// this file only exists to avoid "electronAPI is not a property" errors

declare global {
  interface ElectronAPI {
    /** Signals the necessary resources have been loaded and the window can now be shown. */
    mainWinReady: () => void;

    /** Defines a function to be run when the undo shortcut is triggered. */
    onUndoShortcut: (callback: () => void) => void;
    /** Defines a function to be run when the redo shortcut is triggered. */
    onRedoShortcut: (callback: () => void) => void;
    /** Toggles the undo shortcut. */
    setUndoEnabled: (enabled: boolean) => void;
    /** Toggles the redo shortcut. */
    setRedoEnabled: (enabled: boolean) => void;

    /** Defines a function to call when the user tries to save the canvas. */
    onSaveImage: (callback: (path: string) => void) => void;
    /** Sends the file path and image data as an ArrayBuffer to the main IPC. */
    saveImageToFile: (path, arrayBuffer) => void;

    /** Closes the resize canvas prompt. */
    cancelNew: () => void;
    /** Defines a function to be run when the resize canvas prompt closes. */
    onClearNewFields: (callback: () => void) => void;
    /** Sends new canvas dimensions to main IPC on resize. */
    resizeCanvas: (width, height) => void;
    /** Defines a function to resize the canvas to the new dimensions. */
    onResizeCanvas: (callback: (width, height) => void) => void;
  }
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { ElectronAPI };
