import { Action, ResizeAction } from './action';
import Brush from './brush';

/**
 * Manages a stack of drawing actions that can be undone and redone.
 * Maintains the current position in the action history and provides
 * functionality to replay actions on the canvas.
 */
class DrawStack {
  // note that actions will be one-indexed, as 0 represents the state before any action
  #index = 0;
  #actions: Action[] = [];
  #brush: Brush;

  /**
   * Creates a new DrawStack instance.
   * @param {HTMLCanvasElement} canvas - The canvas element to draw on
   */
  constructor(canvas: HTMLCanvasElement) {
    this.#brush = new Brush(canvas);
  }

  /**
   * Checks if an undo operation is possible.
   * @returns {boolean} True if there are actions that can be undone, false otherwise
   */
  canUndo(): boolean {
    return this.#index > 0;
  }

  /**
   * Checks if a redo operation is possible.
   * @returns {boolean} True if there are actions that can be redone, false otherwise
   */
  canRedo(): boolean {
    return this.#index < this.#actions.length;
  }

  /**
   * Adds a new action to the stack and removes any actions beyond the current index.
   * @param {Action} action - The action to add to the stack
   */
  add(action: Action) {
    // delete actions beyond the current index
    const howMany = this.#actions.length - this.#index;
    for (let i = 0; i < howMany; i++) {
      this.#actions.pop();
    }
    this.#actions.push(action);
    this.#index++;
  }

  /**
   * Undoes the last action by moving the index back and redrawing the canvas
   * with all remaining actions up to the new index.
   */
  undo() {
    if (this.#index > 0) {
      this.#index--;
      this.#performUpToCurrent();
    }
  }

  /**
   * Redoes the next action by moving the index forward and redrawing the canvas
   * with all actions up to the new index.
   */
  redo() {
    if (this.#index < this.#actions.length) {
      this.#index++;
      this.#performUpToCurrent();
    }
  }

  /**
   * Clears all actions from the stack and resets the index to 0.
   */
  clear() {
    this.#index = 0;
    this.#actions.length = 0; // man i love this language
  }

  /**
   * Performs all actions in the stack up to the current index.
   */
  #performUpToCurrent() {
    this.#brush.clearCanvas();

    // start at default res
    this.#brush.resizeCanvas(800, 600);

    // only the last resize operation is performed
    let lastResize: Action = null;

    for (let i = 1; i <= this.#index; i++) {
      const curAct = this.#actions[i - 1];
      if (curAct instanceof ResizeAction) {
        lastResize = curAct;
      } else {
        curAct.perform(this.#brush);
      }
    }

    if (lastResize) {
      lastResize.perform(this.#brush);
    }
  }
}

export default DrawStack;
