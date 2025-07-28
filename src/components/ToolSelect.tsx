import Tool from '../logic/tool';
import { ReactNode } from 'react';
import { Brush, Eraser, PaintBucket, Pipette } from 'lucide-react';

interface ToolButtonProps {
  /* hover text */
  title: string;
  /* React component from lucide-react */
  iconLucide: ReactNode;
  /* function to run when clicking the button */
  onClick: () => void;
  /* whether this button is currently selected */
  selected: boolean;
}

const ToolButton = (props: ToolButtonProps) => {
  return (
    <p className="control">
      <button
        className={`button${props.selected ? ' is-primary is-selected' : ''}`}
        title={props.title}
        onClick={props.onClick}>
        <span className="icon">{props.iconLucide}</span>
      </button>
    </p>
  );
};

interface ToolSelectProps {
  /* the currently selected Tool enum */
  curTool: Tool;
  /* setter for curTool */
  toolSetterFn: (tool: Tool) => void;
}

const ToolSelect = (props: ToolSelectProps) => {
  return (
    <div className="tool">
      <label className="label">Selected tool</label>
      <div className="field has-addons">
        <ToolButton
          title={Tool.PAINTBRUSH}
          iconLucide={<Brush />}
          onClick={() => props.toolSetterFn(Tool.PAINTBRUSH)}
          selected={props.curTool === Tool.PAINTBRUSH} />
        <ToolButton
          title={Tool.ERASER}
          iconLucide={<Eraser />}
          onClick={() => props.toolSetterFn(Tool.ERASER)}
          selected={props.curTool === Tool.ERASER} />
        <ToolButton
          title={Tool.BUCKET}
          iconLucide={<PaintBucket />}
          onClick={() => props.toolSetterFn(Tool.BUCKET)}
          selected={props.curTool === Tool.BUCKET} />
        <ToolButton
          title={Tool.EYEDROPPER}
          iconLucide={<Pipette />}
          onClick={() => props.toolSetterFn(Tool.EYEDROPPER)}
          selected={props.curTool === Tool.EYEDROPPER} />
      </div>
    </div>
  );
};

export default ToolSelect;
