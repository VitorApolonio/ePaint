import React from 'react';
import { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { Position, PosVector } from '../logic/position';
import MouseButton from '../logic/mouse-button';
import Brush from '../logic/brush';
import Tool from '../logic/tool';
import DrawStack from '../logic/draw-stack';

interface CanvasProps {
  /* canvas dimensions */
  width: number;
  height: number;
  /* currently selected tool */
  tool: Tool;
  /* brush size in px */
  brushSize: number;
  /* main and secondary colors */
  colorA: string;
  colorB: string;
  colorSetterA: (color: string) => void;
  colorSetterB: (color: string) => void;
  /* reference to the canvas element */
  canvasRef: RefObject<HTMLCanvasElement>;
  /* current brush color in hexadecimal */
  brushColorRef: RefObject<string>;
  /* array with positions the mouse has gone through during a path */
  posRef: RefObject<PosVector>;
  /* stack keeping track of all actions (for undo/redo) */
  stackRef: RefObject<DrawStack>;
  /* whether a mouse button is being held */
  holdingMouseRef: RefObject<boolean>;
  /* main brush used for drawing on canvas */
  brushRef: RefObject<Brush>;
}

const Canvas = (props: CanvasProps) => {
  const curBtnCodeRef = useRef(MouseButton.MAIN);
  const startPosRef = useRef({ x: 0, y: 0 } as Position);

  // initialize brush, done only once
  useEffect(() => {
    props.brushRef.current = new Brush(props.canvasRef.current);
    props.brushRef.current.size = props.brushSize;
    props.stackRef.current = new DrawStack(props.canvasRef.current);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    props.holdingMouseRef.current = true;
    curBtnCodeRef.current = e.button;

    // set color
    switch (props.tool) {
      case Tool.PAINTBRUSH:
      case Tool.BUCKET: {
        if (curBtnCodeRef.current === MouseButton.MAIN) {
          props.brushColorRef.current = props.colorA;
        } else {
          props.brushColorRef.current = props.colorB;
        }
        break;
      }
      case Tool.ERASER: {
        props.brushColorRef.current = Brush.COLOR_ERASER;
        break;
      }
    }

    // begin path
    switch (props.tool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        startPosRef.current = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        };
        props.posRef.current[0] = startPosRef.current;
        break;
      }
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (props.holdingMouseRef.current) {
      const curPos = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
      switch (props.tool) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          props.brushRef.current.color = props.brushColorRef.current;
          props.brushRef.current.drawLine(
            startPosRef.current.x,
            startPosRef.current.y,
            curPos.x,
            curPos.y,
          );
          startPosRef.current = {
            x: curPos.x,
            y: curPos.y,
          };
          props.posRef.current.push(startPosRef.current);
          break;
        }
        case Tool.EYEDROPPER: {
          const color = props.brushRef.current.getColorAtPixel(curPos.x, curPos.y);
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
