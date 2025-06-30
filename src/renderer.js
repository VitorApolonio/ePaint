import './index.css';
import './lucide.js';
// display window
window.electronAPI.mainWinReady();

import Action from './logic/action.js';
import Brush from './logic/brush.js';
import DrawStack from './logic/draw-stack.js';
import Tool from './logic/tool.js';
import MouseButton from './logic/mouse-button.js';

const toolSelectBrush = document.getElementById('brush-tool');
const toolSelectEraser = document.getElementById('eraser-tool');
const toolSelectFloodFill = document.getElementById('fill-tool');
const toolSelectEyedropper = document.getElementById('eyedropper-tool');
const toolsContainer = document.getElementById('tools-container');
const brushSizeSelect = document.getElementById('brush-size-select');
const brushColorSelectPrimary = document.getElementById('color-select-primary');
const brushColorSelectSecondary = document.getElementById('color-select-secondary');
const colorSwapBtn = document.getElementById('swap-colors');
const canvas = document.querySelector('canvas');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const clearBtn = document.getElementById('clear-btn');

// currently selected tool
let curTool = Tool.PAINTBRUSH;

// whether the mouse is being held down
let mouseClicked = false;

// currently clicked mouse button
let curButtonCode = null;

// current action (i.e. shape drawn with mouse)
let curAction = null;

// brush and undo/redo stack
const paintbrush = new Brush(canvas);
const actionStack = new DrawStack(canvas);

// toggle undo/redo
const setUndoEnabled = enable => {
  if (enable) {
    undoBtn.disabled = false;
    window.electronAPI.enableUndo();
  } else {
    undoBtn.disabled = true;
    window.electronAPI.disableUndo();
  }
};
const setRedoEnabled = enable => {
  if (enable) {
    redoBtn.disabled = false;
    window.electronAPI.enableRedo();
  } else {
    redoBtn.disabled = true;
    window.electronAPI.disableRedo();
  }
};

// initial canvas size
canvas.width = 800;
canvas.height = 600;

// new canvas
window.electronAPI.onResizeCanvas((width, height) => {
  paintbrush.clearCanvas();
  actionStack.clear();
  setUndoEnabled(false);
  setRedoEnabled(false);
  canvas.width = width;
  canvas.height = height;
});

// setup brush sizes
const sizes = {
  xsmall: 2,
  small: 5,
  medium: 10,
  large: 15,
  xlarge: 20,
  xxlarge: 25,
  xxxlarge: 30,
};

for (const s in sizes) {
  const o = document.createElement('option');
  o.innerHTML = sizes[s];
  brushSizeSelect.appendChild(o);
}

// set default brush size
brushSizeSelect.value = sizes.small;
paintbrush.size = brushSizeSelect.value;

// use selected brush size
brushSizeSelect.addEventListener('change', e => {
  paintbrush.size = Number(e.target.value);
});

// set default brush color
brushColorSelectPrimary.value = '#ff7f00';
brushColorSelectSecondary.value = '#007fff';

// swap colors
colorSwapBtn.addEventListener('click', () => {
  const helper = brushColorSelectPrimary.value;
  brushColorSelectPrimary.value = brushColorSelectSecondary.value;
  brushColorSelectSecondary.value = helper;
});

// tool select
const selectTool = tool => {
  toolsContainer.querySelectorAll('button').forEach(b => b.classList.remove('is-primary', 'is-selected'));
  tool.classList.add('is-primary', 'is-selected');
};
toolSelectBrush.addEventListener('click', e => {
  curTool = Tool.PAINTBRUSH;
  selectTool(e.currentTarget);
});
toolSelectEraser.addEventListener('click', e => {
  curTool = Tool.ERASER;
  selectTool(e.currentTarget);
});
toolSelectFloodFill.addEventListener('click', e => {
  curTool = Tool.BUCKET;
  selectTool(e.currentTarget);
});
toolSelectEyedropper.addEventListener('click', e => {
  curTool = Tool.EYEDROPPER;
  selectTool(e.currentTarget);
});

// position at which to begin line
const startPos = { x: 0, y: 0 };

// handle mouse click
canvas.addEventListener('mousedown', e => {
  // make new action
  if (!mouseClicked) {
    mouseClicked = true;
    curButtonCode = e.button;

    // set color to use for path (none for eyedropper)
    let color = '';
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.BUCKET: {
        color = curButtonCode === MouseButton.MAIN ? brushColorSelectPrimary.value : brushColorSelectSecondary.value;
        break;
      }
      case Tool.ERASER: {
        color = Brush.COLOR_ERASER;
        break;
      }
    }

    if (color) {
      curAction = new Action(paintbrush.size, color, curTool === Tool.BUCKET);
      // begin path at current position
      startPos.x = e.offsetX;
      startPos.y = e.offsetY;
      curAction.addPosition(startPos.x, startPos.y);
    }
  }
});

// handle mouse movement
canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    const curPos = { x: e.offsetX, y: e.offsetY };
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        // draw line from startPos to current mouse position, then set startPos to current
        paintbrush.color = curAction.brushColor;
        paintbrush.drawLine(startPos.x, startPos.y, curPos.x, curPos.y);
        curAction.addPosition(curPos.x, curPos.y);
        startPos.x = curPos.x;
        startPos.y = curPos.y;
        break;
      }
      case Tool.EYEDROPPER: {
        // update selected color
        const color = paintbrush.getColorAtPixel(curPos.x, curPos.y);
        if (curButtonCode === MouseButton.MAIN) {
          brushColorSelectPrimary.value = color;
        } else {
          brushColorSelectSecondary.value = color;
        }
        break;
      }
    }
  }
});

// handle mouse release
document.addEventListener('mouseup', e => {
  if (mouseClicked) {
    const curPos = { x: e.offsetX, y: e.offsetY };
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        if (e.target === canvas) {
          paintbrush.color = curAction.brushColor;
          paintbrush.drawPoint(curPos.x, curPos.y);
        }
        // add action to stack
        actionStack.add(curAction);
        setUndoEnabled(true);
        setRedoEnabled(false);
        break;
      }
      case Tool.BUCKET: {
        paintbrush.color = curAction.brushColor;
        // only add action if fill was performed on valid coordinate and selected color != pixel color
        if (e.target === canvas && paintbrush.floodFill(curPos.x, curPos.y)) {
          curAction.fillData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
          actionStack.add(curAction);
          setUndoEnabled(true);
          setRedoEnabled(false);
        }
        break;
      }
      case Tool.EYEDROPPER: {
        if (e.target === canvas) {
          // update selected color
          const color = paintbrush.getColorAtPixel(curPos.x, curPos.y);
          if (curButtonCode === MouseButton.MAIN) {
            brushColorSelectPrimary.value = color;
          } else {
            brushColorSelectSecondary.value = color;
          }
          break;
        }
      }
    }

    curAction = null;
    mouseClicked = false;
    curButtonCode = null; 
  }
});

// Undo/Redo
const undoHandler = () => {
  actionStack.undo();
  if (!actionStack.canUndo()) {
    setUndoEnabled(false);
  }
  setRedoEnabled(true);
};
const redoHandler = () => {
  actionStack.redo();
  if (!actionStack.canRedo()) {
    setRedoEnabled(false);
  }
  setUndoEnabled(true);
};

// undo/redo buttons
undoBtn.addEventListener('click', undoHandler);
redoBtn.addEventListener('click', redoHandler);

// undo/redo shortcuts
window.electronAPI.onUndoShortcut(undoHandler);
window.electronAPI.onRedoShortcut(redoHandler);

// clear canvas
clearBtn.addEventListener('click', () => {
  // wiping the canvas counts as an action only if it's not already blank
  if (!paintbrush.canvasIsBlank()) {
    // if pressed while drawing, save current path before erasing
    if (curAction) {
      actionStack.add(curAction);
      curAction = new Action(curAction.brushSize, curAction.brushColor);
    }
    paintbrush.clearCanvas();
    actionStack.add(new Action(null, null));
    setUndoEnabled(true);
    setRedoEnabled(false);
  }
});

// save drawing as image
window.electronAPI.onSaveImage(path => {
  if (path) {
    canvas.toBlob(blob => {
      if (blob) {
        blob.arrayBuffer().then(buf => {
          window.electronAPI.saveImageToFile(path, buf);
        });
      }
    });
  }
});