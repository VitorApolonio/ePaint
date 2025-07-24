/** Represents a position on the canvas, with x- and y-coordinates. */
interface Position { x: number, y: number }

/** A list of Positions, containing at minimum one. */
type PosVector = [Position, ...Position[]];

export { Position, PosVector };