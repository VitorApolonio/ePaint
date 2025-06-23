class Action {
  #brushState = { size: null, color: null, isFill: null, fillData: null }
  #positions = []

  constructor(brushSize, brushColor, isFill = false) {
    this.#brushState.size = brushSize
    this.#brushState.color = brushColor
    this.#brushState.isFill = isFill
  }

  get brushSize() {
    return this.#brushState.size
  }

  get brushColor() {
    return this.#brushState.color
  }

  get isFill() {
    return this.#brushState.isFill
  }

  get fillData() {
    return this.#brushState.fillData
  }

  set fillData(newData) {
    this.#brushState.fillData = newData
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

export default Action