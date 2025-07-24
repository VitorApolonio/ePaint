import { Redo, Undo } from "lucide-react";
import { ReactNode } from "react"

interface StateControlButtonProps {
  onClick: () => void;
  iconLucide: ReactNode;
}

const StateControlButton = (props: StateControlButtonProps) => {
  return (
    <p className="control">
      <button disabled className="button" onClick={props.onClick}>
        <span className="icon">{props.iconLucide}</span>
      </button>
    </p>
  )
}

const UndoRedo = () => {
  const undoHandler = () => {}
  const redoHandler = () => {}

  return (
    <div className="tool">
      <p><strong>Undo&nbsp;/&nbsp;Redo</strong></p>
      <div className="field has-addons">
        <StateControlButton onClick={undoHandler} iconLucide={<Undo />} />
        <StateControlButton onClick={redoHandler} iconLucide={<Redo />} />
      </div>
    </div>
  )
}

export default UndoRedo;