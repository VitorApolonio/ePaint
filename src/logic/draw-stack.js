import Brush from './brush.js'

/**
 * Manages a stack of drawing actions that can be undone and redone.
 * Maintains the current position in the action history and provides
 * functionality to replay actions on the canvas.
 */
class DrawStack {
  // note that actions will be one-indexed, as 0 represents the state before any action
  #index = 0
  #actions = []
  #brush

  /**
   * Creates a new DrawStack instance.
   * @param {HTMLCanvasElement} canvas - The canvas element to draw on
   */
  constructor(canvas) {
    this.#brush = new Brush(canvas)
  }

  /**
   * Checks if an undo operation is possible.
   * @returns {boolean} True if there are actions that can be undone, false otherwise
   */
  canUndo() {
    return this.#index > 0
  }

  /**
   * Checks if a redo operation is possible.
   * @returns {boolean} True if there are actions that can be redone, false otherwise
   */
  canRedo() {
    return this.#index < this.#actions.length
  }

  /**
   * Adds a new action to the stack and removes any actions beyond the current index.
   * @param {Action} action - The action to add to the stack
   */
  add(action) {
    // delete actions beyond the current index
    const howMany = this.#actions.length - this.#index
    for (let i = 0; i < howMany; i++) {
      this.#actions.pop()
    }
    this.#actions.push(action)
    this.#index++
  }

  /**
   * Undoes the last action by moving the index back and redrawing the canvas
   * with all remaining actions up to the new index.
   */
  undo() {
    if (this.#index > 0) {
      this.#index--
      this.#brush.clearCanvas()
      // draw this action and all the ones before it
      for (let i = 1; i <= this.#index; i++) {
        this.drawAction(this.#actions[i - 1])
      }
    }
  }

  /**
   * Redoes the next action by moving the index forward and redrawing the canvas
   * with all actions up to the new index.
   */
  redo() {
    if (this.#index < this.#actions.length) {
      this.#index++
      this.#brush.clearCanvas()
      // draw this action and all the ones before it
      for (let i = 1; i <= this.#index; i++) {
        this.drawAction(this.#actions[i - 1])
      }
    }
  }

  /**
   * Clears all actions from the stack and resets the index to 0.
   */
  clear() {
    this.#index = 0
    this.#actions.length = 0 // man i love this language
  }

  /**
   * Draws a single action on the canvas by restoring the brush state
   * and executing the appropriate drawing operations based on the action type.
   * @param {Action} action - The action to draw on the canvas
   */
  drawAction(action) {
    // restore brush state
    this.#brush.color = action.brushColor
    this.#brush.size = action.brushSize

    const positions = action.positions
    if (positions.length > 1) {
      // connect all positions with lines
      let startPos = { x: positions[0].x, y: positions[0].y }
      for (let i = 1; i < positions.length; i++) {
        this.#brush.drawLine(startPos.x, startPos.y, positions[i].x, positions[i].y)
        startPos = positions[i]
      }
    // draw a point / fill if the action has only one position
    } else if (positions.length === 1) {
      if (action.isFill) {
        this.#brush.clearCanvas()
        this.#brush.drawImage(action.fillData)
      } else {
        this.#brush.drawPoint(positions[0].x, positions[0].y)
      }
    // an action without any coordinates means the canvas was wiped
    } else {
      this.#brush.clearCanvas()
    }

    // reset brush state
    this.#brush.color = null
    this.#brush.size = null
  }
}

export default DrawStack