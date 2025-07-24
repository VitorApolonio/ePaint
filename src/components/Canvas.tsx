import React, { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { Position } from '../logic/action';
import MouseButton from '../logic/mouse-button';
import Brush from '../logic/brush';
import Tool from '../logic/tool';
import DrawStack from '../logic/draw-stack';

interface CanvasProps {
  /* canvas dimensions */
  width: number;
  height: number;
  /* reference to the canvas element */
  canvasRef: RefObject<HTMLCanvasElement>;
  /* currently selected tool */
  tool: Tool;
  /* brush size in px */
  brushSize: number;
  /* current brush color in hexadecimal */
  brushColor: string;
  brushColorSetter: (color: string) => void;
  /* array with positions the mouse has gone through during a path */
  positions: [Position, ...Position[]];
  positionsSetter: (positions: [Position, ...Position[]]) => void;
  /* main and secondary colors */
  colorA: string;
  colorB: string;
  colorSetterA: (color: string) => void;
  colorSetterB: (color: string) => void;
  /* stack keeping track of all actions (for undo/redo) */
  actionStack: DrawStack;
  actionStackSetter: (stack: DrawStack) => void;
  /* whether a mouse button is being held */
  holdingMouse: boolean;
  holdingMouseSetter: (holding: boolean) => void;
  /* main brush used for drawing on canvas */
  brush: Brush;
  brushSetter: (brush: Brush) => void;
}

const Canvas = (props: CanvasProps) => {
  const curBtnCodeRef = useRef(MouseButton.MAIN);
  const startPosRef = useRef({ x: 0, y: 0 } as Position);

  // initialize brush, done only once
  useEffect(() => {
    const brush = new Brush(props.canvasRef.current);
    brush.size = props.brushSize;
    props.brushSetter(brush);
    props.actionStackSetter(new DrawStack(props.canvasRef.current));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    props.holdingMouseSetter(true);
    curBtnCodeRef.current = e.button;

    // set color
    switch (props.tool) {
      case Tool.PAINTBRUSH:
      case Tool.BUCKET: {
        if (curBtnCodeRef.current === MouseButton.MAIN) {
          props.brushColorSetter(props.colorA);
        } else {
          props.brushColorSetter(props.colorB);
        }
        break;
      }
      case Tool.ERASER: {
        props.brushColorSetter(Brush.COLOR_ERASER);
        break;
      }
    }

    // begin path
    switch (props.tool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        const rect = e.currentTarget.getBoundingClientRect();
        startPosRef.current = {
          x: Math.round(e.clientX - rect.left),
          y: Math.round(e.clientY - rect.top),
        };
        props.positionsSetter([startPosRef.current]);
        break;
      }
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (props.holdingMouse) {
      const rect = e.currentTarget.getBoundingClientRect();
      const curPos = {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      };
      switch (props.tool) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          props.brush.color = props.brushColor;
          props.brush.drawLine(
            startPosRef.current.x,
            startPosRef.current.y,
            curPos.x,
            curPos.y,
          );
          startPosRef.current = {
            x: curPos.x,
            y: curPos.y,
          };
          props.positionsSetter(props.positions.concat(startPosRef.current) as [Position, ...Position[]]);
          break;
        }
        case Tool.EYEDROPPER: {
          const color = props.brush.getColorAtPixel(curPos.x, curPos.y);
          if (curBtnCodeRef.current === MouseButton.MAIN) {
            props.colorSetterA(color);
          } else {
            props.colorSetterB(color);
          }
          break;
        }
      }
    }
  };

  return (
    <canvas
      width={props.width}
      height={props.height}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      ref={props.canvasRef}>
    </canvas>
  );
};

export default Canvas;
