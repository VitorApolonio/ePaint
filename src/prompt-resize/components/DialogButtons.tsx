interface ButtonProps {
  /* text displayed on the button */
  text: string;
  /* whether this button is a confirm button (defines appearance) */
  confirm: boolean;
  /* a function to run when this button is clicked */
  clickHandler: () => void;
}

const Button = (props: ButtonProps) => {
  return (
    <div className="control">
      <button className={`button${props.confirm ? ' is-primary' : ''}`} onClick={props.clickHandler}>{props.text}</button>
    </div>
  );
};

interface DialogButtonsProps {
  /* a function to clear the input fields */
  clearFieldsFn: () => void;
  /* a function to resize the canvas according to the values in the fields */
  resizeFn: () => void;
}

const DialogButtons = (props: DialogButtonsProps) => {
  const cancelHandler = () => {
    props.clearFieldsFn();
    window.electronAPI.cancelNew();
  };

  const confirmHandler = () => {
    props.resizeFn();
    props.clearFieldsFn();
  };

  return (
    <div className="buttons-container">
      <div className="field is-grouped is-grouped-right">
        <Button
          text="Cancel"
          confirm={false}
          clickHandler={cancelHandler} />
        <Button
          text="Confirm"
          confirm={true}
          clickHandler={confirmHandler} />
      </div>
    </div>
  );
};

export default DialogButtons;
