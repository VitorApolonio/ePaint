import { ArrowLeftRight } from 'lucide-react';
import { MouseEvent } from 'react';

interface SwapButtonProps {
  /* colors to swap */
  colorA: string;
  colorB: string;
  /* the colors' respective setters */
  setterA: (color: string) => void;
  setterB: (color: string) => void;
}

const SwapButton = (props: SwapButtonProps) => {
  const onClick = () => {
    const helper = props.colorA;
    props.setterA(props.colorB);
    props.setterB(helper);
  };
  return (
    <p className="control">
      <button className="button" title="Swap colors" onClick={onClick}>
        <span className="icon"><ArrowLeftRight /></span>
      </button>
    </p>
  );
};

interface ColorSelectButtonProps {
  /* this button's color */
  color: string;
  /* a function to set the button color */
  colorSetterFn: (color: string) => void;
  /* whether this button represents the primary color */
  isPrimary: boolean;
}

const ColorSelectButton = (props: ColorSelectButtonProps) => {
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    window.electronAPI.onColorPickerButton(props.isPrimary);
  };

  return (
    <p className="control">
      <input
        type="color"
        className="input color-picker"
        value={props.color}
        onChange={e => props.colorSetterFn(e.target.value)}
        onClick={onClick} />
    </p>
  );
};

interface BrushColorSelectProps {
  /* main color */
  colorPrimary: string;
  /* secondary color */
  colorSecondary: string;
  /* main color setter */
  colorPrimarySetterFn: (color: string) => void;
  /* secondary color setter */
  colorSecondarySetterFn: (color: string) => void;
}

const BrushColorSelect = (props: BrushColorSelectProps) => {
  return (
    <div className="tool">
      <label className="label">Color&nbsp;1&nbsp;/&nbsp;Color&nbsp;2</label>
      <div className="field is-grouped">
        <ColorSelectButton color={props.colorPrimary} colorSetterFn={props.colorPrimarySetterFn} isPrimary={true} />
        <SwapButton
          colorA={props.colorPrimary}
          colorB={props.colorSecondary}
          setterA={props.colorPrimarySetterFn}
          setterB={props.colorSecondarySetterFn} />
        <ColorSelectButton color={props.colorSecondary} colorSetterFn={props.colorSecondarySetterFn} isPrimary={false} />
      </div>
    </div>
  );
};

export default BrushColorSelect;
