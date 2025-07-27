import { BrushCleaning } from 'lucide-react';
import { RefObject, useEffect } from 'react';
import { ClearAction, DrawAction } from '../logic/action';
import Brush from '../logic/brush';
import DrawStack from '../logic/draw-stack';
import { PosVector } from '../logic/position';

interface ClearCanvasProps {
  /* main paintbrush */
  brushRef: RefObject<Brush>;
  /* action stack */
  stackRef: RefObject<DrawStack>;
  /* positions composing the current mouse path */
  posRef: RefObject<PosVector>;
  /* setters for undo/redo state */
  undoStateFn: (enabled: boolean) => void;
  redoStateFn: (enabled: boolean) => void;
}

const ClearCanvas = (props: ClearCanvasProps) => {
  const onClick = () => {
    // wiping the canvas counts as an action only if it's not already blank
    if (!props.brushRef.current.canvasIsBlank()) {
      // if pressed while drawing, save current path before erasing
      if (props.posRef.current.length > 1) {
        props.stackRef.current.add(new DrawAction(
          props.brushRef.current.size,
          props.brushRef.current.color,
          props.posRef.current,
        ));
        props.posRef.current.slice(props.posRef.current.length - 1);
      }
      props.brushRef.current.clearCanvas();
      props.stackRef.current.add(new ClearAction());
      props.undoStateFn(true);
      props.redoStateFn(false);
    }
  };

  // handle clearing by shortcut
  useEffect(() => {
    window.electronAPI.onClearShortcut(onClick);
  }, []);

  return (
    <div className="tool">
      <p><strong>Clear&nbsp;canvas</strong></p>
      <button className="button is-warning" onClick={onClick}>
        <span className="icon"><BrushCleaning /></span>
        <span>Clear</span>
      </button>
    </div>
  );
};

export default ClearCanvas;
