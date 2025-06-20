class Brush {
  #size
  #color
  #ctx

  constructor(canvas, size, color) {
    this.#ctx = canvas.getContext('2d')
    this.#size = size
    this.#color = color
  }

  set size(newSize) {
    this.#size = newSize
  }

  set color(newColor) {
    this.#color = newColor
  }

  get size() {
    return this.#size
  }

  get color() {
    return this.#color
  }

  drawPoint(x, y) {
    this.#ctx.fillStyle = this.#color

    this.#ctx.beginPath()
    this.#ctx.ellipse(x, y, this.#size / 2, this.#size / 2, 0, 0, Math.PI * 2)
    this.#ctx.fill()
  }

  drawLine(startX, startY, endX, endY) {
    this.#ctx.lineCap = 'round'
    this.#ctx.lineWidth = this.#size
    this.#ctx.strokeStyle = this.#color

    this.#ctx.beginPath()
    this.#ctx.moveTo(startX, startY)
    this.#ctx.lineTo(endX, endY)
    this.#ctx.stroke()
  }

  clearCanvas() {
    const w = this.#ctx.canvas.width
    const h = this.#ctx.canvas.height
    this.#ctx.clearRect(0, 0, w, h)
  }
}

class DrawStack {
  // note that actions will be one-indexed, as 0 represents the state before any action
  #index = 0
  #actions = []
  #brush

  constructor(canvas) {
    this.#brush = new Brush(canvas, null, null)
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
    // a deep copy of the action is pushed, as objects are references
    this.#actions.push(JSON.parse(JSON.stringify(action)))
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
    this.#brush.color = action.brushState.color
    this.#brush.size = action.brushState.size

    const positions = action.positions
    if (positions.length > 1) {
      // connect all positions with lines
      let startPos = { x: positions[0].x, y: positions[0].y }
      for (let i = 1; i < positions.length; i++) {
        this.#brush.drawLine(startPos.x, startPos.y, positions[i].x, positions[i].y)
        startPos = positions[i]
      }
    } else {
      this.#brush.drawPoint(positions[0].x, positions[0].y)
    }
  }
}

export { Brush, DrawStack }