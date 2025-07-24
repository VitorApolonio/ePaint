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
import { DrawAction, FillAction, Position } from './logic/action';
import MouseButton from './logic/mouse-button';

const App = () => {
  const [curTool, setCurTool] = useState(Tool.PAINTBRUSH);
  const [brushSize, setBrushSize] = useState(5);
  const [colorPrimary, setColorPrimary] = useState('#ff7f00');
  const [colorSecondary, setColorSecondary] = useState('#007fff');
  const [actionStack, setActionStack] = useState(null as null | DrawStack);

  const [brush, setBrush] = useState(null as null | Brush);
  const [brushColor, setBrushColor] = useState(colorPrimary);

  const [holdingMouse, setHoldingMouse] = useState(false);
  const [positions, setPositions] = useState([{ x: 0, y: 9 }] as [Position, ...Position[]]);

  const canvasRef = useRef(null as null | HTMLCanvasElement);

  const onMouseUp = (e: React.MouseEvent) => {
    if (holdingMouse) {
      brush.color = brushColor;
      const rect = e.currentTarget.getBoundingClientRect();
      const curPos = {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      };
      switch (curTool) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          // draw a dot if only one position exists
          if (e.target === canvasRef.current && positions.length === 1) {
            brush.drawPoint(curPos.x, curPos.y);
          }
          // add action to stack
          actionStack.add(new DrawAction(brushSize, brushColor, positions));
          break;
        }
        case Tool.BUCKET: {
          // only add action if fill was performed on valid coordinate and selected color != pixel color
          if (e.target === canvasRef.current && brush.floodFill(curPos.x, curPos.y)) {
            const fillData = canvasRef.current
              .getContext('2d')
              .getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            actionStack.add(new FillAction(fillData));
          }
          break;
        }
        case Tool.EYEDROPPER: {
          if (e.target === canvasRef.current) {
            // update selected color
            const color = brush.getColorAtPixel(curPos.x, curPos.y);
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
      setPositions(positions.slice(0, 1) as [Position, ...Position[]]);
      setHoldingMouse(false);
    }
  };

  return (
    <div id="root" onMouseUp={onMouseUp}>
      <div id="canvas-container">
        <Canvas
          width={800}
          height={600}
          canvasRef={canvasRef}
          tool={curTool}
          brushColor={brushColor}
          brushColorSetter={setBrushColor}
          brushSize={brushSize}
          positions={positions}
          positionsSetter={setPositions}
          colorA={colorPrimary}
          colorB={colorSecondary}
          colorSetterA={setColorPrimary}
          colorSetterB={setColorSecondary}
          actionStack={actionStack}
          actionStackSetter={setActionStack}
          holdingMouse={holdingMouse}
          holdingMouseSetter={setHoldingMouse}
          brush={brush}
          brushSetter={setBrush} />
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
        <div className="tool">
          <p><strong>Undo&nbsp;/&nbsp;Redo</strong></p>
          <div className="field has-addons">
            <p className="control">
              <button disabled id="undo-btn" className="button">
                <span className="icon"><i data-lucide="undo"></i></span>
              </button>
            </p>
            <p className="control">
              <button disabled id="redo-btn" className="button">
                <span className="icon"><i data-lucide="redo"></i></span>
              </button>
            </p>
          </div>
        </div>

        {/* wipe canvas */}
        <div className="tool">
          <p><strong>Clear&nbsp;canvas</strong></p>
          <button id="clear-btn" className="button is-warning">
            <span className="icon"><i data-lucide="brush-cleaning"></i></span>
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};

createRoot(document.body).render(
  <App />,
);