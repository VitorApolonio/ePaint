import { Action } from './action';
import Brush from './brush';

/**
 * Manages a stack of drawing actions that can be undone and redone.
 * Maintains the current position in the action history and provides
 * functionality to replay actions on the canvas.
 */
class DrawStack {
  // note that actions will be one-indexed, as 0 represents the state before any action
  #index: number = 0;
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
    console.log(this.#actions);
  }

  /**
   * Undoes the last action by moving the index back and redrawing the canvas
   * with all remaining actions up to the new index.
   */
  undo() {
    if (this.#index > 0) {
      this.#index--;
      this.#brush.clearCanvas();
      // draw this action and all the ones before it
      for (let i = 1; i <= this.#index; i++) {
        this.drawAction(this.#actions[i - 1]);
      }
    }
  }

  /**
   * Redoes the next action by moving the index forward and redrawing the canvas
   * with all actions up to the new index.
   */
  redo() {
    if (this.#index < this.#actions.length) {
      this.#index++;
      this.#brush.clearCanvas();
      // draw this action and all the ones before it
      for (let i = 1; i <= this.#index; i++) {
        this.drawAction(this.#actions[i - 1]);
      }
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
   * Draws a single action on the canvas by restoring the brush state
   * and executing the appropriate drawing operations based on the action type.
   * @param {Action} action - The action to draw on the canvas
   */
  drawAction(action: Action) {
    action.perform(this.#brush);
  }
}

export default DrawStack;