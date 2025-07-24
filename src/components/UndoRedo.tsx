import { Redo, Undo } from "lucide-react";
import { ReactNode, RefObject, useEffect } from "react"
import DrawStack from "src/logic/draw-stack";

interface StateControlButtonProps {
  /* whether this button is disabled */
  disabled: boolean;
  /* handler for click event */
  onClick: () => void;
  /* a lucide-react icon element */
  iconLucide: ReactNode;
}

const StateControlButton = (props: StateControlButtonProps) => {
  return (
    <p className="control">
      <button disabled={props.disabled} className="button" onClick={props.onClick}>
        <span className="icon">{props.iconLucide}</span>
      </button>
    </p>
  )
}

interface UndoRedoProps {
  /* the action stack */
  stackRef: RefObject<DrawStack>;
  /* state and state setters for undo */
  undoActive: boolean;
  undoSetterFn: (active: boolean) => void;
  /* state and state setters for redo */
  redoActive: boolean;
  redoSetterFn: (active: boolean) => void;
}

const UndoRedo = (props: UndoRedoProps) => {
  const undoHandler = () => {
    props.stackRef.current.undo()
    if (!props.stackRef.current.canUndo()) {
      props.undoSetterFn(false);
    }
    props.redoSetterFn(true);
  }
  const redoHandler = () => {
    props.stackRef.current.redo()
    if (!props.stackRef.current.canRedo()) {
      props.redoSetterFn(false);
    }
    props.undoSetterFn(true);
  }

  // set up shortcuts
  useEffect(() => {
    window.electronAPI.onUndoShortcut(undoHandler);
    window.electronAPI.onRedoShortcut(redoHandler);
  }, [])

  return (
    <div className="tool">
      <p><strong>Undo&nbsp;/&nbsp;Redo</strong></p>
      <div className="field has-addons">
        <StateControlButton disabled={!props.undoActive} onClick={undoHandler} iconLucide={<Undo />} />
        <StateControlButton disabled={!props.redoActive} onClick={redoHandler} iconLucide={<Redo />} />
      </div>
    </div>
  )
}

export default UndoRedo;