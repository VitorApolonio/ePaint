import React from 'react';
import { createRoot } from 'react-dom/client';
import { useRef, useState } from 'react';
import Tool from './logic/tool';
import BrushColorSelect from './components/BrushColorSelect';
import BrushSizeSelect from './components/BrushSizeSelect';
import ToolSelect from './components/ToolSelect';
import Canvas from './components/Canvas';
import DrawStack from './logic/draw-stack';
import Brush from './logic/brush';
import { DrawAction, FillAction } from './logic/action';
import MouseButton from './logic/mouse-button';
import ClearCanvas from './components/ClearCanvas';
import { PosVector } from './logic/position';
import UndoRedo from './components/UndoRedo';

const App = () => {
  const [curTool, setCurTool] = useState(Tool.PAINTBRUSH);
  const [brushSize, setBrushSize] = useState(5);
  const [colorPrimary, setColorPrimary] = useState('#ff7f00');
  const [colorSecondary, setColorSecondary] = useState('#007fff');
  const [undoEnabled, setUndoEnabled] = useState(false);
  const [redoEnabled, setRedoEnabled] = useState(false);

  const actionStackRef = useRef(null as null | DrawStack);
  const brushRef = useRef(null as null | Brush);
  const brushColorRef = useRef(colorPrimary);
  const holdingMouseRef = useRef(false);
  const positionsRef = useRef([{ x: 0, y: 0 }] as PosVector);

  const canvasRef = useRef(null as null | HTMLCanvasElement);

  const onMouseUp = (e: React.MouseEvent) => {
    if (holdingMouseRef.current) {
      brushRef.current.color = brushColorRef.current;
      const rect = e.currentTarget.getBoundingClientRect();
      const curPos = {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      };
      switch (curTool) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          // draw a dot if only one position exists
          if (e.target === canvasRef.current && positionsRef.current.length === 1) {
            brushRef.current.drawPoint(curPos.x, curPos.y);
          }
          // add action to stack
          actionStackRef.current.add(new DrawAction(brushSize, brushColorRef.current, positionsRef.current));
          break;
        }
        case Tool.BUCKET: {
          // only add action if fill was performed on valid coordinate and selected color != pixel color
          if (e.target === canvasRef.current && brushRef.current.floodFill(curPos.x, curPos.y)) {
            const fillData = canvasRef.current
              .getContext('2d')
              .getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            actionStackRef.current.add(new FillAction(fillData));
          }
          break;
        }
        case Tool.EYEDROPPER: {
          if (e.target === canvasRef.current) {
            // update selected color
            const color = brushRef.current.getColorAtPixel(curPos.x, curPos.y);
            if (e.button === MouseButton.MAIN) {
              setColorPrimary(color);
            } else {
              setColorSecondary(color);
            }
            break;
          }
        }
      }

      // reset state
      positionsRef.current.length = 1;
      holdingMouseRef.current = false;
    }
  };

  return (
    <div id="root" onMouseUp={onMouseUp}>
      <div id="canvas-container">
        <Canvas
          width={800}
          height={600}
          tool={curTool}
          brushSize={brushSize}
          colorA={colorPrimary}
          colorB={colorSecondary}
          colorSetterA={setColorPrimary}
          colorSetterB={setColorSecondary}
          canvasRef={canvasRef}
          brushColorRef={brushColorRef}
          posRef={positionsRef}
          stackRef={actionStackRef}
          holdingMouseRef={holdingMouseRef}
          brushRef={brushRef} />
      </div>

      <div id="tools-container">
        {/* tool selection */}
        <ToolSelect curTool={curTool} toolSetterFn={setCurTool} />

        {/* brush size */}
        <BrushSizeSelect sizes={[2, 5, 10, 15, 20, 25, 30]} curSize={brushSize} sizeSetterFn={setBrushSize} />

        {/* brush color */}
        <BrushColorSelect
          colorPrimary={colorPrimary}
          colorSecondary={colorSecondary}
          colorPrimarySetterFn={setColorPrimary}
          colorSecondarySetterFn={setColorSecondary} />

        {/* undo / redo */}
        <UndoRedo />

        {/* wipe canvas */}
        <ClearCanvas
          brushRef={brushRef}
          stackRef={actionStackRef}
          posRef={positionsRef} />
      </div>
    </div>
  );
};

createRoot(document.body).render(
  <App />,
);