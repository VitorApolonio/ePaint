import Brush from './brush';
import { PosVector } from './position';

/**
 * Represents an operation that changes the state of the canvas in some way.
 *
 * An Action is essentially anything that can be undone/redone by the
 * undo/redo buttons, respectively, such as a path drawn or a region filled.
 */
interface Action {
  /** Executes the action, changing the canvas state as necessary. */
  perform(brush: Brush): void;
}

/**
 * Represents a fill operation.
 */
class FillAction implements Action {
  #fillData: ImageData;

  /**
   * Creates a FillAction instance.
   * @param {ImageData} fillData - The state of the canvas after the fill.
   */
  constructor(fillData: ImageData) {
    this.#fillData = fillData;
  }

  perform(brush: Brush) {
    brush.drawImage(this.#fillData);
  }
}

/**
 * Represents a path or single point drawn on the canvas.
 */
class DrawAction implements Action {
  #positions: PosVector;
  #brushSize: number;
  #brushColor: string;

  /**
   * Creates a DrawAction instance.
   * @param {number} brushSize - The current brush size (px)
   * @param {string} brushColor - The current brush color (hex)
   * @param {PosVector} positions - The positions composing the path
   */
  constructor(brushSize: number, brushColor: string, positions: PosVector) {
    // a shallow copy is saved to avoid issues with references
    this.#positions = positions.slice() as PosVector;
    this.#brushSize = brushSize;
    this.#brushColor = brushColor;
  }

  perform(brush: Brush) {
    // set brush state
    brush.size = this.#brushSize;
    brush.color = this.#brushColor;

    let startPos = this.#positions[0];
    // draw single point if array has only one position
    if (this.#positions.length === 1) {
      brush.drawPoint(startPos.x, startPos.y);
    // draw path otherwise
    } else {
      for (let i = 1; i < this.#positions.length; i++) {
        const nextPos = this.#positions[i];
        brush.drawLine(startPos.x, startPos.y, nextPos.x, nextPos.y);
        startPos = nextPos;
      }
    }
  }
}

/**
 * Represents the action of clearing the canvas.
 */
class ClearAction implements Action {
  perform(brush: Brush) {
    brush.clearCanvas();
  }
}

export { Action, FillAction, DrawAction, ClearAction };
