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
}

export default Brush