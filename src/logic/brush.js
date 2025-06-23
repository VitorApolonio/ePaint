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
    this.#ctx.globalAlpha = 1
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
    this.#ctx.globalAlpha = 1
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

  drawImage(image) {
    this.#ctx.putImageData(image, 0, 0)
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
      return false
    }

    let head = 0
    let tail = 0
    const queueX = new Uint32Array(w * h)
    const queueY = new Uint32Array(w * h)
    const visited = new Uint8Array(w * h)
    visited[startY * w + startX] = 1

    // add starting pixel
    queueX[tail] = startX
    queueY[tail++] = startY

    // color current pixel
    let newColor = this.#hexToRgb(this.#color).concat(color[3] ? color[3] : 255)
    let idx = (startY * w + startX) * 4
    for (let i = 0; i < 4; i++) {
      newImageData.data[idx + i] = newColor[i]
    }

    while (head < tail) {
      const x = queueX[head]
      const y = queueY[head++]

      // adjacent pixel coords
      const dx = [0, 1, 0, -1]
      const dy = [1, 0, -1, 0]

      for (let i = 0; i < 4; i++) {
        const nx = x + dx[i]
        const ny = y + dy[i]

        // avoid revisiting pixels
        if (visited[ny * w + nx]) {
          continue
        }

        // don't access pixels outside of canvas
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
          continue
        }

        // check that color is still the same as the origin pixel
        const curColor = this.#getColorDataAtCoords(nx, ny, newImageData)
        if (!this.#colorEquals(color, curColor)) {
          continue
        }

        // color current pixel
        newColor = this.#hexToRgb(this.#color).concat(curColor[3] ? curColor[3] : 255)
        idx = (ny * w + nx) * 4
        for (let i = 0; i < 4; i++) {
          newImageData.data[idx + i] = newColor[i]
        }

        // add to queue
        queueX[tail] = nx
        queueY[tail++] = ny

        // mark as visited
        visited[ny * w + nx] = 1
      }
    }

    // apply changes to canvas
    this.#ctx.putImageData(newImageData, 0, 0)
    return true
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

  getColorAtPixel(x, y) {
    const w = this.#ctx.canvas.width
    const h = this.#ctx.canvas.height

    // the slice is to exclude alpha
    const d = this.#getColorDataAtCoords(x, y, this.#ctx.getImageData(1, 0, w, h)).slice(0, 3)
    return '#' + d.map(n => {
      const c = n.toString(16)
      return c.length === 1 ? '0' + c : c
    }).join('')
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
    const i = (y * w + x) * 4
    const d = data.data
    return [d[i], d[i + 1], d[i + 2], d[i + 3]]
  }

  /**
   * Compares two RGBA color arrays.
   * @param {Array} a first array
   * @param {Array} b second array
   * @param {number} tolerance how different colors are allowed to be
   */
  #colorEquals(a, b, tolerance = 15) {
    return (
      Math.abs(a[0] - b[0]) <= tolerance
      && Math.abs(a[1] - b[1]) <= tolerance
      && Math.abs(a[2] - b[2]) <= tolerance
    )
  }
}

export default Brush