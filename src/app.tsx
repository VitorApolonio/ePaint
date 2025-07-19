import { createRoot } from 'react-dom/client';
import { useRef, useState } from 'react';
import Tool from './logic/tool';
import BrushColorSelect from './components/BrushColorSelect';
import BrushSizeSelect from './components/BrushSizeSelect';
import ToolSelect from './components/ToolSelect';
import Canvas from './components/Canvas';
import DrawStack from './logic/draw-stack';

const App = () => {
  const [curTool, setCurTool] = useState(Tool.PAINTBRUSH);
  const [brushSize, setBrushSize] = useState(5);
  const [colorPrimary, setColorPrimary] = useState('#ff7f00');
  const [colorSecondary, setColorSecondary] = useState('#007fff');
  const [actionStack, setActionStack] = useState(null as null | DrawStack)

  return (
    <>
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
          actionStack={actionStack}
          actionStackSetter={setActionStack} />
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
    </>
  );
};

createRoot(document.getElementById('root')).render(
  <App />,
);