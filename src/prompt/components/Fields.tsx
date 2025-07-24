import React from 'react'
import { RefObject } from 'react'

interface ValueFieldProps {
  fieldRef: RefObject<HTMLInputElement>;
  text: string;
  unit: string;
  focus: boolean;
}

const ValueField = (props: ValueFieldProps) => {
  // allow only numbers to be typed
  const restrictInput = () => {
    props.fieldRef.current.value = props.fieldRef.current.value.replace(/\D/g, '')
  }

  return (
    <div className="field has-addons">
      <div className="control">
        <input
          type="text"
          className="input"
          placeholder={props.text}
          onInput={restrictInput}
          autoFocus={props.focus}
          ref={props.fieldRef} />
      </div>
      <div className="control">
        <span className="button is-static">{props.unit}</span>
      </div>
    </div>
  )
}

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
      props.resizeFn()
      props.clearFieldsFn()
    }
  }

  return (
    <div className="fields-container" onKeyDown={e => onKeyPress(e)}>
      <label className="label">Resolution:</label>
      <ValueField
        text="Width"
        unit="px"
        fieldRef={props.widthFieldRef}
        focus={true} />
      <ValueField
        text="Height"
        unit="px"
        fieldRef={props.heightFieldRef}
        focus={false} />
    </div>
  )
}

export default Fields;