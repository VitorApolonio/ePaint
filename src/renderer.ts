import './app';
import './index.css';
// display window
window.electronAPI.mainWinReady();

import { DrawAction, FillAction, ClearAction } from './logic/action';
import Brush from './logic/brush';
import DrawStack from './logic/draw-stack';
import Tool from './logic/tool';
import MouseButton from './logic/mouse-button';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const toolSelectBrush = document.getElementById('brush-tool') as HTMLButtonElement;
const toolSelectEraser = document.getElementById('eraser-tool') as HTMLButtonElement;
const toolSelectFloodFill = document.getElementById('fill-tool') as HTMLButtonElement;
const toolSelectEyedropper = document.getElementById('eyedropper-tool') as HTMLButtonElement;
const toolsContainer = document.getElementById('tools-container') as HTMLDivElement;
const brushSizeSelect = document.getElementById('brush-size-select') as HTMLSelectElement;
const brushColorSelectPrimary = document.getElementById('color-select-primary') as HTMLInputElement;
const brushColorSelectSecondary = document.getElementById('color-select-secondary') as HTMLInputElement;
const colorSwapBtn = document.getElementById('swap-colors') as HTMLButtonElement;
const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

// currently selected tool
let curTool: Tool = Tool.PAINTBRUSH;

// whether the mouse is being held down
let mouseClicked: boolean = false;

// the currently clicked mouse button
let curButtonCode: MouseButton = null;

// positions the mouse pointer has passed through while drawing a path
let positions: { x: number, y: number }[] = [];

// brush and undo/redo stack
const paintbrush: Brush = new Brush(canvas);
const actionStack: DrawStack = new DrawStack(canvas);

// toggle undo/redo
const setUndoEnabled = (enable: boolean) => {
  if (enable) {
    undoBtn.disabled = false;
    window.electronAPI.enableUndo();
  } else {
    undoBtn.disabled = true;
    window.electronAPI.disableUndo();
  }
};
const setRedoEnabled = (enable: boolean) => {
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
window.electronAPI.onResizeCanvas((width: number, height: number) => {
  paintbrush.clearCanvas();
  actionStack.clear();
  setUndoEnabled(false);
  setRedoEnabled(false);
  canvas.width = width;
  canvas.height = height;
});

// set up brush sizes
const sizes = [2, 5, 10, 15, 20, 25, 30];
sizes.forEach(size => {
  brushSizeSelect.appendChild(new Option(size.toString(), size.toString()));
});

// set default brush size
paintbrush.size = sizes[1];
brushSizeSelect.value = paintbrush.size.toString();

// use selected brush size
brushSizeSelect.addEventListener('change', e => {
  paintbrush.size = Number((e.target as HTMLSelectElement).value);
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
const selectTool = (tool: HTMLButtonElement) => {
  toolsContainer.querySelectorAll('button').forEach(b => b.classList.remove('is-primary', 'is-selected'));
  tool.classList.add('is-primary', 'is-selected');
};
toolSelectBrush.addEventListener('click', e => {
  curTool = Tool.PAINTBRUSH;
  selectTool(e.currentTarget as HTMLButtonElement);
});
toolSelectEraser.addEventListener('click', e => {
  curTool = Tool.ERASER;
  selectTool(e.currentTarget as HTMLButtonElement);
});
toolSelectFloodFill.addEventListener('click', e => {
  curTool = Tool.BUCKET;
  selectTool(e.currentTarget as HTMLButtonElement);
});
toolSelectEyedropper.addEventListener('click', e => {
  curTool = Tool.EYEDROPPER;
  selectTool(e.currentTarget as HTMLButtonElement);
});

// position at which to begin a line
let startPos = { x: 0, y: 0 };

// brush color to use (based on button clicked)
let brushColor = '';

// handle mouse click
canvas.addEventListener('mousedown', e => {
  // make new action
  if (!mouseClicked) {
    mouseClicked = true;
    curButtonCode = e.button;

    // set color to use for path (none for eyedropper)
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.BUCKET: {
        brushColor = curButtonCode === MouseButton.MAIN
          ? brushColorSelectPrimary.value
          : brushColorSelectSecondary.value;
        break;
      }
      case Tool.ERASER: {
        brushColor = Brush.COLOR_ERASER;
        break;
      }
    }

    if (brushColor) {
      // begin path at current position
      startPos = { x: e.offsetX, y: e.offsetY };
      positions.push(startPos);
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
        paintbrush.color = brushColor;
        paintbrush.drawLine(startPos.x, startPos.y, curPos.x, curPos.y);
        positions.push(curPos);
        startPos = { x: curPos.x, y: curPos.y };
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
    paintbrush.color = brushColor;
    const curPos = { x: e.offsetX, y: e.offsetY };
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        if (e.target === canvas) {
          paintbrush.drawPoint(curPos.x, curPos.y);
        }
        // add action to stack
        actionStack.add(new DrawAction(paintbrush.size, paintbrush.color, positions.slice()));
        setUndoEnabled(true);
        setRedoEnabled(false);
        break;
      }
      case Tool.BUCKET: {
        // only add action if fill was performed on valid coordinate and selected color != pixel color
        if (e.target === canvas && paintbrush.floodFill(curPos.x, curPos.y)) {
          const fillData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
          actionStack.add(new FillAction(fillData));
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

    positions.length = 0;
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
    if (positions.length > 0) {
      paintbrush.color = brushColor;
      actionStack.add(new DrawAction(paintbrush.size, paintbrush.color, positions.slice()));
      positions = positions.slice(positions.length - 1, positions.length);
    }
    paintbrush.clearCanvas();
    actionStack.add(new ClearAction());
    setUndoEnabled(true);
    setRedoEnabled(false);
  }
});

// save drawing as image
window.electronAPI.onSaveImage((path: string) => {
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