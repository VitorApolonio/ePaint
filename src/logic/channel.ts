/** An enum for IPC channels. */
enum Channel {
  MAIN_WIN_READY = 'main-win-ready',

  UNDO_SET_ENABLED = 'undo-set-enabled',
  REDO_SET_ENABLED = 'redo-set-enabled',
  UNDO_THROUGH_SHORTCUT = 'undo-shortcut',
  REDO_THROUGH_SHORTCUT = 'redo-shortcut',

  CLEAR_THROUGH_SHORTCUT = 'clear-shortcut',

  CLOSE_RESIZE_PROMPT = 'close-resize-prompt',
  RESET_RESIZE_PROMPT = 'reset-resize-prompt',
  RESIZE_CANVAS = 'resize-canvas',

  LOAD_IMAGE_TO_CANVAS = 'open-canvas',
  SAVE_CANVAS_AS_IMAGE = 'save-canvas',
  WRITE_IMAGE_TO_DISK = 'write-canvas-image',

  SET_CURRENT_TOOL = 'change-tool',
}

export default Channel;
