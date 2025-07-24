import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Fields from './components/Fields';
import DialogButtons from './components/DialogButtons';

const CanvasResizePrompt = () => {
  const widthRef = useRef(null as null | HTMLInputElement);
  const heightRef = useRef(null as null | HTMLInputElement);

  const clearFields = () => {
    widthRef.current.value = '';
    heightRef.current.value = '';
    widthRef.current.focus();
  };

  const resize = () => {
    const w = parseInt(widthRef.current.value);
    const h = parseInt(heightRef.current.value);

    // minimum resolution
    const minW = 300;
    const minH = 300;
    // maximum resolution
    const maxW = 7680; // 8K
    const maxH = 4320;

    window.electronAPI.resizeCanvas(
      isNaN(w) ? minW : Math.min(maxW, Math.max(minW, w)),
      isNaN(h) ? minH : Math.min(maxH, Math.max(minH, h)),
    );
    window.electronAPI.cancelNew();
  };

  // clear fields on window close
  window.electronAPI.onClearNewFields(clearFields);

  return (
    <>
      <Fields
        widthFieldRef={widthRef}
        heightFieldRef={heightRef}
        clearFieldsFn={clearFields}
        resizeFn={resize} />

      <DialogButtons
        clearFieldsFn={clearFields}
        resizeFn={resize} />
    </>
  );
};

createRoot(document.body).render(
  <CanvasResizePrompt />,
);