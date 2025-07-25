import React, { useEffect } from 'react';
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

  /* 
   * These wrapper functions should almost always be used instead of the
   * state setters, as they also toggle the keyboard shortcuts.
   */
  const setUndoActive = (active: boolean) => {
    setUndoEnabled(active);
    window.electronAPI.setUndoEnabled(active);
  };
  const setRedoActive = (active: boolean) => {
    setRedoEnabled(active);
    window.electronAPI.setRedoEnabled(active);
  };

  // done only once
  useEffect(() => {
    // handle creating a new blank canvas
    window.electronAPI.onResizeCanvas((w: number, h: number) => {
      brushRef.current.clearCanvas();
      actionStackRef.current.clear();
      setUndoActive(false);
      setRedoActive(false);
      canvasRef.current.width = w;
      canvasRef.current.height = h;
    });

    // handle saving the canvas as an image file
    window.electronAPI.onSaveImage((path: string) => {
      if (path) {
        canvasRef.current.toBlob(blob => {
          if (blob) {
            blob.arrayBuffer().then(buf => {
              window.electronAPI.saveImageToFile(path, buf);
            });
          }
        });
      }
    });
  }, []);

  const onMouseUp = (e: React.MouseEvent) => {
    if (holdingMouseRef.current) {
      brushRef.current.color = brushColorRef.current;
      const curPos = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
      switch (curTool) {
        case Tool.PAINTBRUSH:
        case Tool.ERASER: {
          // draw a dot if only one position exists
          if (e.target === canvasRef.current && positionsRef.current.length === 1) {
            brushRef.current.drawPoint(curPos.x, curPos.y);
          }
          // add action to stack
          actionStackRef.current.add(new DrawAction(brushSize, brushColorRef.current, positionsRef.current as PosVector));
          setUndoActive(true);
          setRedoActive(false);
          break;
        }
        case Tool.BUCKET: {
          // only add action if fill was performed on valid coordinate and selected color != pixel color
          if (e.target === canvasRef.current && brushRef.current.floodFill(curPos.x, curPos.y)) {
            const fillData = canvasRef.current
              .getContext('2d')
              .getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            actionStackRef.current.add(new FillAction(fillData));
            setUndoActive(true);
            setRedoActive(false);
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
      <div className="canvas-container">
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

      <div className="tools-container">
        {/* tool selection */}
        <ToolSelect
          curTool={curTool}
          toolSetterFn={setCurTool} />

        {/* brush size */}
        <BrushSizeSelect 
          sizes={[2, 5, 10, 15, 20, 25, 30]}
          curSize={brushSize}
          sizeSetterFn={setBrushSize} />

        {/* brush color */}
        <BrushColorSelect
          colorPrimary={colorPrimary}
          colorSecondary={colorSecondary}
          colorPrimarySetterFn={setColorPrimary}
          colorSecondarySetterFn={setColorSecondary} />

        {/* undo / redo */}
        <UndoRedo
          undoActive={undoEnabled}
          undoSetterFn={setUndoActive}
          redoActive={redoEnabled}
          redoSetterFn={setRedoActive}
          stackRef={actionStackRef} />

        {/* wipe canvas */}
        <ClearCanvas
          brushRef={brushRef}
          stackRef={actionStackRef}
          posRef={positionsRef}
          undoStateFn={setUndoActive}
          redoStateFn={setRedoActive} />
      </div>
    </div>
  );
};

createRoot(document.body).render(
  <App />,
);
