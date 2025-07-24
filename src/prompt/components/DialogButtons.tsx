interface ButtonProps {
  text: string;
  confirm: boolean;
  clickHandler: () => void;
}

const Button = (props: ButtonProps) => {
  return (
    <div className="control">
      <button className={`button${props.confirm ? ' is-link' : ''}`} onClick={props.clickHandler}>{props.text}</button>
    </div>
  );
};

interface DialogButtonsProps {
  clearFieldsFn: () => void;
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