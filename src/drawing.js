class Tool {
  constructor(name) {
    this.name = name
  }

  static PAINTBRUSH = new Tool('Paintbrush')
  static ERASER = new Tool('Eraser')
  static BUCKET = new Tool('Bucket')

  toString() {
    return this.name
  }
}

class Action {
  #brushState = { size: null, color: null }
  #positions = []

  constructor(brushSize, brushColor) {
    this.#brushState.size = brushSize
    this.#brushState.color = brushColor
  }

  get brushSize() {
    return this.#brushState.size
  }

  get brushColor() {
    return this.#brushState.color
  }

  get positions() {
    // returns a copy to prevent issues with mutation
    // the positions can still be modified, as this is a shallow copy
    return this.#positions.slice()
  }

  addPosition(x, y) {
    this.#positions.push({ x, y })
  }
}

class Brush {
  #size
  #color
  #ctx

  constructor(canvas, size, color) {
    this.#ctx = canvas.getContext('2d')
    this.#size = size
    this.#color = color
  }

  static COLOR_ERASER = 'rgba(0, 0, 0, 1)'

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
    // handle special case for eraser tool
    if (this.#color === Brush.COLOR_ERASER) {
      this.#ctx.globalCompositeOperation = 'destination-out'
    } else {
      this.#ctx.globalCompositeOperation = 'source-over'
    }

    this.#ctx.beginPath()
    this.#ctx.ellipse(x, y, this.#size / 2, this.#size / 2, 0, 0, Math.PI * 2)
    this.#ctx.fill()
  }

  drawLine(startX, startY, endX, endY) {
    this.#ctx.lineCap = 'round'
    this.#ctx.lineWidth = this.#size
    this.#ctx.strokeStyle = this.#color
    // handle special case for eraser tool
    if (this.#color === Brush.COLOR_ERASER) {
      this.#ctx.globalCompositeOperation = 'destination-out'
    } else {
      this.#ctx.globalCompositeOperation = 'source-over'
    }

    this.#ctx.beginPath()
    this.#ctx.moveTo(startX, startY)
    this.#ctx.lineTo(endX, endY)
    this.#ctx.stroke()
  }

  eraseLine(startX, startY, endX, endY) {
    this.#ctx.lineCap = 'round'
    this.#ctx.lineWidth = this.#size
    this.#ctx.strokeStyle = COLOR_ERASER

    this.#ctx.beginPath()
    this.#ctx.moveTo(startX, startY)
    this.#ctx.lineTo(endX, endY)
    this.#ctx.stroke()
  }

  floodFill(startX, startY) {
    const w = this.#ctx.canvas.width
    const h = this.#ctx.canvas.height
    const newImageData = this.#ctx.getImageData(0, 0, w, h)

    const color = this.#getColorDataAtCoords(startX, startY, newImageData)

    // return if pixel is already painted
    if (this.#colorEquals(color, this.#hexToRgb(this.#color).concat(color[3]))) {
      return
    }

    const queue = [{ x: startX, y: startY }]

    // color current pixel
    const newColor = this.#hexToRgb(this.#color).concat(color[3])
    this.#getColorIndicesForCoord(startX, startY, w).forEach((colIdx, arrIdx) => {
      newImageData.data[colIdx] = newColor[arrIdx]
    })

    while (queue.length) {
      const { x, y } = queue.shift()

      // adjacent pixels to check
      const pairs = [
        { nx: x, ny: y + 1 },
        { nx: x + 1, ny: y },
        { nx: x, ny: y - 1 },
        { nx: x - 1, ny: y }
      ]

      for (const { nx, ny } of pairs) {
        const curColor = this.#getColorDataAtCoords(nx, ny, newImageData)
        const insideCanvas = nx >= 0 && ny >= 0 && nx < w && ny < h
        const colorDidntChange = this.#colorEquals(color, curColor)

        if (insideCanvas && colorDidntChange) {
          // color current pixel
          this.#getColorIndicesForCoord(nx, ny, w).forEach((colIdx, arrIdx) => {
            newImageData.data[colIdx] = newColor[arrIdx]
          })

          // add to queue
          queue.push({ x: nx, y: ny })
        }
      }
    }

    // apply changes to canvas
    this.#ctx.putImageData(newImageData, 0, 0)
  }

  clearCanvas() {
    const w = this.#ctx.canvas.width
    const h = this.#ctx.canvas.height
    this.#ctx.clearRect(0, 0, w, h)
  }

  canvasIsBlank() {
    const w = this.#ctx.canvas.width
    const h = this.#ctx.canvas.height
    // https://stackoverflow.com/a/17386803
    const pixelBuffer = new Uint32Array(this.#ctx.getImageData(0, 0, w, h).data.buffer)
    return !pixelBuffer.some(c => c !== 0)
  }

  /**
   * Given coordinates x, y and a canvas width, returns
   * the indexes of the colors at that coordinate, in
   * the format [red, green, blue, alpha].
   */
  #getColorIndicesForCoord(x, y, width) {
    const r = y * (width * 4) + x * 4
    return [r, r + 1, r + 2, r + 3]
  }

  /**
   * Given a hexadecimal color code (e.g. #ffffff), returns an
   * array with the red, green and blue values in base 10.
   * @param {string} code a hex color code
   * @returns an array following the format [r, g, b]
   */
  #hexToRgb(code) {
    return [parseInt(code.slice(1, 3), 16), parseInt(code.slice(3, 5), 16), parseInt(code.slice(5), 16)]
  }

  /**
   * Given x and y coordinates for some pixel on the canvas,
   * returns an array with its corresponding RGBA color data.
   * @param {number} x the x coordinate of the pixel
   * @param {number} y the y coordinate of the pixel
   * @param {ImageData} data canvas image data
   * @returns an array of the format [r, g, b, a]
   */
  #getColorDataAtCoords(x, y, data) {
    const w = this.#ctx.canvas.width
    return this.#getColorIndicesForCoord(x, y, w).map(i => data.data[i])
  }

  /**
   * Compares two RGBA color arrays.
   * @param {Array} a first array
   * @param {Array} b second array
   */
  #colorEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
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
    // draw a point if the action has only one position
    } else if (positions.length === 1) {
      this.#brush.drawPoint(positions[0].x, positions[0].y)
    // an action without any coordinates means the canvas was wiped
    } else {
      this.#brush.clearCanvas()
    }

    // reset brush state
    this.#brush.color = null
    this.#brush.size = null
  }
}

export {
  Action,
  Brush,
  DrawStack,
  Tool
}