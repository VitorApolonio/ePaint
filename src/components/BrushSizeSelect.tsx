interface BrushSizeSelectProps {
  /* possible sizes in px */
  sizes: number[];
  /* the currently selected brush size */
  curSize: number;
  /* a function to change the current size */
  sizeSetterFn: (size: number) => void;
}

const BrushSizeSelect = (props: BrushSizeSelectProps) => {
  return (
    <div className="tool">
      <p><strong>Brush&nbsp;size</strong></p>
      <div className="select">
        <select value={props.curSize} onChange={e => props.sizeSetterFn(parseInt(e.target.value))}>
          {props.sizes.map(size => (<option key={size} value={size}>{size}</option>))}
        </select>
      </div>
    </div>
  );
};

export default BrushSizeSelect;