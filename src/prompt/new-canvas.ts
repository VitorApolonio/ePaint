import './new-canvas.css';

const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
const confirmBtn = document.getElementById('confirm-btn') as HTMLButtonElement;
const widthField = document.getElementById('width') as HTMLInputElement;
const heightField = document.getElementById('height') as HTMLInputElement;

// prevent non-numeric values from being typed
const restrict = (e: Event) => {
  (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
};

widthField.addEventListener('input', e => restrict(e));
heightField.addEventListener('input', e => restrict(e));

const clearFields = () => {
  widthField.value = '';
  heightField.value = '';
  widthField.focus();
};
const resize = () => {
  const w = Math.max(parseInt(widthField.value), 100);
  const h = Math.max(parseInt(heightField.value), 100);
  window.electronAPI.resizeCanvas(w, h);
  window.electronAPI.cancelNew();
};

cancelBtn.addEventListener('click', () => {
  clearFields();
  window.electronAPI.cancelNew();
});

confirmBtn.addEventListener('click', () => {
  resize();
  clearFields();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    resize();
    clearFields();
  }
});

// window close event
window.electronAPI.onClearNewFields(clearFields);