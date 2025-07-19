import React from 'react'
import { useEffect, useRef, useState } from 'react';
import { DrawAction, FillAction, Position } from '../logic/action'
import MouseButton from "../logic/mouse-button";
import Brush from "../logic/brush";
import Tool from "../logic/tool";
import DrawStack from '../logic/draw-stack';

interface CanvasProps {
  width: number;
  height: number;
  tool: Tool;
  brushSize: number;
  colorA: string;
  colorB: string;
  colorSetterA: (color: string) => void;
  colorSetterB: (color: string) => void;
  actionStack: DrawStack
  actionStackSetter: (stack: DrawStack) => void
}

const Canvas = (props: CanvasProps) => {
  const canvasRef = useRef(null as null | HTMLCanvasElement)
  const [brush, setBrush] = useState(null as null | Brush)

  const curBtnCodeRef = useRef(MouseButton.MAIN)
  const holdingMouseBtnRef = useRef(false)
  const brushColorRef = useRef(props.colorA)

  const startPosRef = useRef({ x: 0, y: 0 } as Position)
  const positionsRef = useRef([startPosRef.current] as [Position, ...Position[]])

  // initialize brush, done only once
  useEffect(() => {
    const brush = new Brush(canvasRef.current)
    brush.size = props.brushSize
    setBrush(brush)
    props.actionStackSetter(new DrawStack(canvasRef.current))
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    holdingMouseBtnRef.current = true
    curBtnCodeRef.current = e.button;

    // set color
    switch (props.tool) {
      case Tool.PAINTBRUSH:
      case Tool.BUCKET: {
        if (curBtnCodeRef.current === MouseButton.MAIN) {
          brushColorRef.current = props.colorA
        } else {
          brushColorRef.current = props.colorB
        }
        break;
      }
      case Tool.ERASER: {
        brushColorRef.current = Brush.COLOR_ERASER
        break;
      }
    }

    // begin path
    switch (props.tool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        const rect = e.currentTarget.getBoundingClientRect()
        startPosRef.current = {
          x: Math.round(e.clientX - rect.left),
          y: Math.round(e.clientY - rect.top)
        }
        positionsRef.current[0] = startPosRef.current
        break;
      }
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (holdingMouseBtnRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const curPos = {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top)
      };
      switch (props.tool) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          brush.color = brushColorRef.current;
          brush.drawLine(
            startPosRef.current.x,
            startPosRef.current.y,
            curPos.x,
            curPos.y,
          )
          startPosRef.current = {
            x: curPos.x,
            y: curPos.y
          };
          positionsRef.current.push(startPosRef.current)
          break;
        }
        case Tool.EYEDROPPER: {
          const color = brush.getColorAtPixel(curPos.x, curPos.y)
          if (curBtnCodeRef.current === MouseButton.MAIN) {
            props.colorSetterA(color)
          } else {
            props.colorSetterB(color)
          }
          break;
        }
      }
    }
  }

  // non-react event listeners won't update with new state values, how lovely
  const brushRef = useRef(brush)
  const toolRef = useRef(props.tool)
  const stackRef = useRef(props.actionStack)
  useEffect(() => {
    brushRef.current = brush
    stackRef.current = props.actionStack
    toolRef.current = props.tool
  }, [brush, props.actionStack, props.tool])

  // also triggers outside of canvas, by an overlay
  const onMouseUp = (e: MouseEvent) => {
    if (holdingMouseBtnRef.current) {
      brushRef.current.color = brushColorRef.current
      // const rect = e.currentTarget.getBoundingClientRect()
      const curPos = {
        // x: Math.round(e.clientX - rect.left),
        // y: Math.round(e.clientY - rect.top)
        x: e.offsetX,
        y: e.offsetY
      };
      switch (toolRef.current) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          // draw a dot if only one position exists
          if (e.target === canvasRef.current && positionsRef.current.length === 1) {
            brush.drawPoint(curPos.x, curPos.y)
          }
          // add action to stack
          stackRef.current.add(new DrawAction(props.brushSize, brushColorRef.current, positionsRef.current))
          break;
        }
        case Tool.BUCKET: {
          // only add action if fill was performed on valid coordinate and selected color != pixel color
          if (e.target === canvasRef.current && brushRef.current.floodFill(curPos.x, curPos.y)) {
            const fillData = canvasRef.current
              .getContext('2d')
              .getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
            stackRef.current.add(new FillAction(fillData))
          }
          break
        }
        case Tool.EYEDROPPER: {
          if (e.target === canvasRef.current) {
            // update selected color
            const color = brushRef.current.getColorAtPixel(curPos.x, curPos.y)
            if (curBtnCodeRef.current === MouseButton.MAIN) {
              props.colorSetterA(color)
            } else {
              props.colorSetterB(color)
            }
            break;
          }
        }
      }

      // reset state
      positionsRef.current.length = 1
      holdingMouseBtnRef.current = false
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <canvas
      width={props.width}
      height={props.height}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      ref={canvasRef}>
    </canvas>
  )
}

export default Canvas;
