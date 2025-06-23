import Brush from './brush.js'

class DrawStack {
  // note that actions will be one-indexed, as 0 represents the state before any action
  #index = 0
  #actions = []
  #brush

  constructor(canvas) {
    this.#brush = new Brush(canvas)
  }

  canUndo() {
    return this.#index > 0
  }

  canRedo() {
    return this.#index < this.#actions.length
  }

  add(action) {
    // delete actions beyond current index
    const howMany = this.#actions.length - this.#index
    for (let i = 0; i < howMany; i++) {
      this.#actions.pop()
    }
    this.#actions.push(action)
    this.#index++
  }

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