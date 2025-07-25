/** Represents a color in the RGB space. */
interface RGBColor { red: number, green: number, blue: number }
/** Represents a color in the RGBA space. */
interface RGBAColor extends RGBColor { alpha: number }

/**
 * Represents a brush tool for drawing on a canvas.
 * Provides functionality for drawing points, lines, flood filling, and managing canvas state.
 */
class Brush {
  #size: number;
  #color: string;
  #ctx: CanvasRenderingContext2D;

  /**
   * Creates a new Brush instance.
   * @param {HTMLCanvasElement} canvas - The canvas element to draw on
   * @param {number} [size=1] - The initial size of the brush
   * @param {string} [color='#ffffff'] - The initial color of the brush in hexadecimal format
   */
  constructor(canvas: HTMLCanvasElement, size = 1, color = '#ffffff') {
    // disable transparency as not all file formats support it
    this.#ctx = canvas.getContext('2d', { alpha: false });

    this.#size = size;
    this.#color = color;
  }

  /** Color value used for the eraser tool */
  static COLOR_ERASER = '#000000ff';

  /**
   * Sets the brush size.
   * @param {number} newSize - The new brush size
   */
  set size(newSize: number) {
    this.#size = newSize;
  }

  /**
   * Gets the current brush size.
   * @returns {number} The current brush size
   */
  get size(): number {
    return this.#size;
  }

  /**
   * Sets the brush color.
   * @param {string} newColor - The new color in hexadecimal format
   */
  set color(newColor: string) {
    this.#color = newColor;
  }

  /**
   * Gets the current brush color.
   * @returns {string} The current color in hexadecimal format
   */
  get color(): string {
    return this.#color;
  }

  /**
   * Draws a single point on the canvas.
   * @param {number} x - The x-coordinate
   * @param {number} y - The y-coordinate
   */
  drawPoint(x: number, y: number) {
    this.#ctx.globalAlpha = 1;
    this.#ctx.fillStyle = this.#color;
    // handle eraser tool special case
    if (this.#color === Brush.COLOR_ERASER) {
      this.#ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.#ctx.globalCompositeOperation = 'source-over';
    }

    this.#ctx.beginPath();
    this.#ctx.ellipse(x, y, this.#size / 2, this.#size / 2, 0, 0, Math.PI * 2);
    this.#ctx.fill();
  }

  /**
   * Draws a line between two points on the canvas.
   * @param {number} startX - The starting x-coordinate
   * @param {number} startY - The starting y-coordinate
   * @param {number} endX - The ending x-coordinate
   * @param {number} endY - The ending y-coordinate
   */
  drawLine(startX: number, startY: number, endX: number, endY: number) {
    this.#ctx.globalAlpha = 1;
    this.#ctx.lineCap = 'round';
    this.#ctx.lineWidth = this.#size;
    this.#ctx.strokeStyle = this.#color;
    // handle eraser tool special case
    if (this.#color === Brush.COLOR_ERASER) {
      this.#ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.#ctx.globalCompositeOperation = 'source-over';
    }

    this.#ctx.beginPath();
    this.#ctx.moveTo(startX, startY);
    this.#ctx.lineTo(endX, endY);
    this.#ctx.stroke();
  }

  /**
   * Draws an image onto the canvas.
   * @param {ImageData} image - The image data to draw
   */
  drawImage(image: ImageData) {
    this.#ctx.putImageData(image, 0, 0);
  }

  /**
   * Performs a flood fill operation starting from the specified coordinates.
   * Uses a queue-based approach to fill connected pixels of the same color.
   * @param {number} startX - The starting x-coordinate
   * @param {number} startY - The starting y-coordinate
   * @returns {boolean} True if the fill operation was performed, false if the starting pixel already matches the fill color
   */
  floodFill(startX: number, startY: number): boolean {
    const w = this.#ctx.canvas.width;
    const h = this.#ctx.canvas.height;
    const newImageData = this.#ctx.getImageData(0, 0, w, h);

    const color = this.#getColorDataAtCoords(startX, startY, newImageData);

    // return if the clicked pixel is already painted
    if (this.#colorEquals(color, this.#hexToRgb(this.#color) as RGBAColor)) {
      return false;
    }

    let head = 0;
    let tail = 0;
    const queueX = new Uint32Array(w * h);
    const queueY = new Uint32Array(w * h);
    const visited = new Uint8Array(w * h);
    visited[startY * w + startX] = 1;

    // add starting pixel
    queueX[tail] = startX;
    queueY[tail++] = startY;

    // color current pixel
    let newColor = this.#hexToRgb(this.#color) as RGBAColor;
    newColor.alpha = color.alpha || 255;
    let idx = (startY * w + startX) * 4;
    newImageData.data[idx] = newColor.red;
    newImageData.data[idx + 1] = newColor.green;
    newImageData.data[idx + 2] = newColor.blue;
    newImageData.data[idx + 3] = newColor.alpha;

    while (head < tail) {
      const x = queueX[head];
      const y = queueY[head++];

      // adjacent pixel coords
      const dx = [0, 1, 0, -1];
      const dy = [1, 0, -1, 0];

      for (let i = 0; i < 4; i++) {
        const nx = x + dx[i];
        const ny = y + dy[i];

        // avoid revisiting pixels
        if (visited[ny * w + nx]) {
          continue;
        }

        // don't access pixels outside of canvas
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
          continue;
        }

        // check that color is still the same as the origin pixel
        const curColor = this.#getColorDataAtCoords(nx, ny, newImageData);
        if (!this.#colorEquals(color, curColor)) {
          continue;
        }

        // color current pixel
        newColor = this.#hexToRgb(this.#color) as RGBAColor;
        idx = (ny * w + nx) * 4;
        newColor.alpha = newImageData.data[idx + 3] || 255;
        newImageData.data[idx] = newColor.red;
        newImageData.data[idx + 1] = newColor.green;
        newImageData.data[idx + 2] = newColor.blue;
        newImageData.data[idx + 3] = newColor.alpha;

        // add to queue
        queueX[tail] = nx;
        queueY[tail++] = ny;

        // mark as visited
        visited[ny * w + nx] = 1;
      }
    }

    // apply changes to canvas
    this.#ctx.putImageData(newImageData, 0, 0);
    return true;
  }

  /**
   * Clears the entire canvas by removing all pixel data.
   */
  clearCanvas() {
    const w = this.#ctx.canvas.width;
    const h = this.#ctx.canvas.height;
    this.#ctx.clearRect(0, 0, w, h);
  }

  /**
   * Checks if the canvas is completely blank (all pixels are transparent).
   * @returns {boolean} True if the canvas is blank, false otherwise
   */
  canvasIsBlank(): boolean {
    const w = this.#ctx.canvas.width;
    const h = this.#ctx.canvas.height;
    // https://stackoverflow.com/a/17386803
    const pixelBuffer = new Uint32Array(this.#ctx.getImageData(0, 0, w, h).data.buffer);
    return !pixelBuffer.some(c => c !== 0);
  }

  /**
   * Gets the color of a pixel at the specified coordinates.
   * @param {number} x - The x-coordinate
   * @param {number} y - The y-coordinate
   * @returns {string} The color in hexadecimal format (e.g., '#ffffff')
   */
  getColorAtPixel(x: number, y: number): string {
    const w = this.#ctx.canvas.width;
    const h = this.#ctx.canvas.height;

    // the slice is to exclude alpha
    const d = this.#getColorDataAtCoords(x, y, this.#ctx.getImageData(1, 0, w, h)) as RGBColor;
    return '#'
      + d.red.toString(16).padStart(2, '0')
      + d.green.toString(16).padStart(2, '0')
      + d.blue.toString(16).padStart(2, '0');
  }

  /**
   * Converts a hexadecimal color code to RGB values.
   * @param {string} code - The hexadecimal color code (e.g., '#ffffff')
   * @returns {RGBColor} An object containing RGB values (red, green, blue)
   * @private
   */
  #hexToRgb(code: string): RGBColor {
    return {
      red: parseInt(code.slice(1, 3), 16),
      green: parseInt(code.slice(3, 5), 16),
      blue: parseInt(code.slice(5), 16),
    };
  }

  /**
   * Retrieves the RGBA color data for a specific pixel from the canvas.
   * @param {number} x - The x-coordinate of the pixel
   * @param {number} y - The y-coordinate of the pixel
   * @param {ImageData} data - The canvas image data
   * @returns {RGBAColor} An object containing RGBA values (red, green, blue, alpha)
   * @private
   */
  #getColorDataAtCoords(x: number, y: number, data: ImageData): RGBAColor {
    const w = this.#ctx.canvas.width;
    const i = (y * w + x) * 4;
    const d = data.data;
    return {
      red: d[i],
      green: d[i + 1],
      blue: d[i + 2],
      alpha: d[i + 3],
    };
  }

  /**
   * Compares two RGBA colors to determine if they are similar enough to be considered equal.
   * @param {RGBAColor} a - First color array in RGBA format
   * @param {RGBAColor} b - Second color array in RGBA format
   * @param {number} [tolerance=15] - Maximum allowed difference between color components
   * @returns {boolean} True if colors are considered equal, false otherwise
   * @private
   */
  #colorEquals(a: RGBAColor, b: RGBAColor, tolerance = 15): boolean {
    return (
      Math.abs(a.red - b.red) <= tolerance
      && Math.abs(a.green - b.green) <= tolerance
      && Math.abs(a.blue - b.blue) <= tolerance
      // only false when comparing brush color with background's (alpha = 0)
      && Math.abs(a.alpha - b.alpha) <= 255
    );
  }
}

export default Brush;
