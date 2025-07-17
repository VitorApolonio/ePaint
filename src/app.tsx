import { createRoot } from 'react-dom/client';
import Tool from './logic/tool';
import React from 'react';
import ToolSelect from './components/ToolSelect';
import BrushSizeSelect from './components/BrushSizeSelect';

const App = () => {
  const [curTool, setCurTool] = React.useState(Tool.PAINTBRUSH);
  const [brushSize, setBrushSize] = React.useState(5);

  return (
    <>
      <div id="canvas-container">
        <canvas></canvas>
      </div>

      <div id="tools-container">
        {/* tool selection */}
        <ToolSelect curTool={curTool} toolSetterFn={setCurTool} />

        {/* brush size */}
        <BrushSizeSelect sizes={[2, 5, 10, 15, 20, 25, 30]} curSize={brushSize} sizeSetterFn={setBrushSize} />

        {/* brush color */}
        <div className="tool">
          <p><strong>Color&nbsp;1&nbsp;/&nbsp;Color&nbsp;2</strong></p>
          <div className="field is-grouped">
            <p className="control">
              <input id="color-select-primary" type="color" className="input" />
            </p>
            <p className="control">
              <button id="swap-colors" className="button" title="Swap colors">
                <span className="icon"><i data-lucide="arrow-left-right"></i></span>
              </button>
            </p>
            <p className="control">
              <input id="color-select-secondary" type="color" className="input" />
            </p>
          </div>
        </div>

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