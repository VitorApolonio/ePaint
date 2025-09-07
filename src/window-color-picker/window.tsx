import { createRoot } from 'react-dom/client';

const ColorPickerWindow = () => {
  return (
    <div id="root">
      <div className="color-picker-container">
        <div className='color-picker-placeholder'></div>
      </div>
      <div className="buttons-container">
        <div className="color-buttons">
          <label className="label">Color</label>
          <div className="field has-addons">
            <div className="control">
              <button className="button is-primary">Primary</button>
            </div>
            <div className="control">
              <button className="button">Secondary</button>
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <div className="field is-grouped is-grouped-right">
            <button className="button">Cancel</button>
            <button className="button is-primary">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.body).render(
  <ColorPickerWindow />,
);
