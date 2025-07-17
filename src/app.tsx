import { createRoot } from 'react-dom/client';

const App = () => {
  return (
    <>
      <div id="canvas-container">
        <canvas></canvas>
      </div>

      <div id="tools-container">
        {/* tool selection */}
        <div className="tool">
          <p><strong>Selected&nbsp;tool</strong></p>
          <div className="field has-addons">
            <p className="control">
              <button id="brush-tool" className="button is-primary is-selected" title="Paintbrush">
                <span className="icon"><i data-lucide="brush"></i></span>
              </button>
            </p>
            <p className="control">
              <button id="eraser-tool" className="button" title="Eraser">
                <span className="icon"><i data-lucide="eraser"></i></span>
              </button>
            </p>
            <p className="control">
              <button id="fill-tool" className="button" title="Paint Bucket">
                <span className="icon"><i data-lucide="paint-bucket"></i></span>
              </button>
            </p>
            <p className="control">
              <button id="eyedropper-tool" className="button" title="Color Picker">
                <span className="icon"><i data-lucide="pipette"></i></span>
              </button>
            </p>
          </div>
        </div>

        {/* brush size */}
        <div className="tool">
          <p><strong>Brush&nbsp;size</strong></p>
          <div className="select">
            <select id="brush-size-select">
              {/* options added through JS */}
            </select>
          </div>
        </div>

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