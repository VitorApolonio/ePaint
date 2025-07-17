import { createRoot } from 'react-dom/client';
import React from 'react';
import Tool from './logic/tool';
import BrushColorSelect from './components/BrushColorSelect';
import BrushSizeSelect from './components/BrushSizeSelect';
import ToolSelect from './components/ToolSelect';

const App = () => {
  const [curTool, setCurTool] = React.useState(Tool.PAINTBRUSH);
  const [brushSize, setBrushSize] = React.useState(5);
  const [colorPrimary, setColorPrimary] = React.useState('#ff7f00');
  const [colorSecondary, setColorSecondary] = React.useState('#007fff');

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