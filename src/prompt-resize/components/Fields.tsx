import React from 'react';
import { RefObject } from 'react';

interface ValueFieldProps {
  /* a ref to this field */
  fieldRef: RefObject<HTMLInputElement>;
  /* placeholder text */
  text: string;
  /* whether this field should have autofocus active */
  focus: boolean;
}

const ValueField = (props: ValueFieldProps) => {
  // allow only numbers to be typed
  const restrictInput = () => {
    props.fieldRef.current.value = props.fieldRef.current.value.replace(/\D/g, '');
  };

  return (
    <div className="control">
      <input
        type="text"
        className="input"
        placeholder={props.text}
        onInput={restrictInput}
        autoFocus={props.focus}
        ref={props.fieldRef} />
    </div>
  );
};

interface FieldsProps {
  widthFieldRef: RefObject<HTMLInputElement>;
  heightFieldRef: RefObject<HTMLInputElement>;
  clearFieldsFn: () => void;
  resizeFn: () => void;
}

const Fields = (props: FieldsProps) => {
  // resize if user presses enter
  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      props.resizeFn();
      props.clearFieldsFn();
    }
  };

  return (
    <div className="fields-container" onKeyDown={e => onKeyPress(e)}>
      <label className="label">New resolution:</label>
      <div className="field has-addons">
        <ValueField
          text="Width"
          fieldRef={props.widthFieldRef}
          focus={true} />
        <div className="control">
          <span className="button is-static">x</span>
        </div>
        <ValueField
          text="Height"
          fieldRef={props.heightFieldRef}
          focus={false} />
        </div>
    </div>
  );
};

export default Fields;
