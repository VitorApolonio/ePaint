/**
 * Represents a drawing action, such as a brush stroke or fill,
 * including the brush configuration and mouse positions that
 * compose it.
 */
class Action {
  #brushState = { size: null, color: null, isFill: null, fillData: null }
  #positions = []

  /**
   * Creates an Action instance.
   * @param {number} brushSize - The size of the brush (px).
   * @param {string} brushColor - The color of the brush (hex).
   * @param {boolean} [isFill=false] - Whether the action is a fill operation.
   */
  constructor(brushSize, brushColor, isFill = false) {
    this.#brushState.size = brushSize
    this.#brushState.color = brushColor
    this.#brushState.isFill = isFill
  }

  /**
   * Gets the brush size.
   * @returns {number}
   */
  get brushSize() {
    return this.#brushState.size
  }

  /**
   * Gets the brush color.
   * @returns {string}
   */
  get brushColor() {
    return this.#brushState.color
  }

  /**
   * Gets whether the action is a fill operation.
   * @returns {boolean}
   */
  get isFill() {
    return this.#brushState.isFill
  }

  /**
   * Gets the fill data.
   * @returns {ImageData}
   */
  get fillData() {
    return this.#brushState.fillData
  }

  /**
   * Sets the fill data.
   * @param {ImageData} newData - Canvas state after a fill operation.
   */
  set fillData(newData) {
    this.#brushState.fillData = newData
  }

  /**
   * Gets the positions in this action.
   * @returns {{x: number, y: number}[]}
   */
  get positions() {
    return this.#positions.slice()
  }

  /**
   * Adds a position to the action.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  addPosition(x, y) {
    this.#positions.push({ x, y })
  }
}

export default Action