import { ArrowLeftRight } from 'lucide-react';

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
}

const ColorSelectButton = (props: ColorSelectButtonProps) => {
  return (
    <p className="control">
      <input type="color" className="input color-picker" value={props.color} onChange={e => props.colorSetterFn(e.target.value)} />
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
      <p><strong>Color&nbsp;1&nbsp;/&nbsp;Color&nbsp;2</strong></p>
      <div className="field is-grouped">
        <ColorSelectButton color={props.colorPrimary} colorSetterFn={props.colorPrimarySetterFn} />
        <SwapButton
          colorA={props.colorPrimary}
          colorB={props.colorSecondary}
          setterA={props.colorPrimarySetterFn}
          setterB={props.colorSecondarySetterFn} />
        <ColorSelectButton color={props.colorSecondary} colorSetterFn={props.colorSecondarySetterFn} />
      </div>
    </div>
  );
};

export default BrushColorSelect;