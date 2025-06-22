import './index.css'
import { Action, Brush, DrawStack, Tool } from './drawing.js'
import './lucide.js'

const toolSelectBrush = document.getElementById('brush-tool')
const toolSelectEraser = document.getElementById('eraser-tool')
const toolSelectFloodFill = document.getElementById('fill-tool')
const toolSelectEyedropper = document.getElementById('eyedropper-tool')
const toolsContainer = document.getElementById('tools-container')
const brushSizeSelect = document.getElementById('brush-size-select')
const brushColorSelectPrimary = document.getElementById('color-select-primary')
const brushColorSelectSecondary = document.getElementById('color-select-secondary')
const colorSwapBtn = document.getElementById('swap-colors')
const canvas = document.querySelector('canvas')
const undoBtn = document.getElementById('undo-btn')
const redoBtn = document.getElementById('redo-btn')
const clearBtn = document.getElementById('clear-btn')

// currently selected tool
let curTool = Tool.PAINTBRUSH

// whether the mouse is being held down
let mouseClicked = false

/* HTML mouse button code
 * 0 - left button
 * 1 - mouse wheel
 * 2 - right button */
let curButtonCode = null

// current action (i.e. shape drawn with mouse)
let curAction = null

// brush and undo/redo stack
const paintbrush = new Brush(canvas, 5, null)
const actionStack = new DrawStack(canvas)

// auto resize canvas, preserving current drawing
/*
window.electronAPI.onResize((width, height) => {
  const bkpCanvas = document.createElement('canvas')
  bkpCanvas.width = canvas.width
  bkpCanvas.height = canvas.height
  bkpCanvas.getContext('2d').drawImage(canvas, 0, 0)

  canvas.width = width * 0.8
  canvas.height = height * 0.75

  canvas.getContext('2d').drawImage(bkpCanvas, 0, 0)
})
  */

// TODO: allow users to pick this
// fix canvas size
canvas.width = 800
canvas.height = 600

// setup brush sizes
const sizes = [2, 5, 10, 15, 20, 25, 30]

sizes.forEach(s => {
  const e = document.createElement('option')
  e.innerHTML = s
  brushSizeSelect.appendChild(e)
})

// set default brush size
brushSizeSelect.value = 5

// use selected brush size
brushSizeSelect.addEventListener('change', e => {
  paintbrush.size = Number(e.target.value)
})

// set default brush color
brushColorSelectPrimary.value = '#ffffff'
brushColorSelectSecondary.value = '#ff00ff'

// swap colors
colorSwapBtn.addEventListener('click', () => {
  const helper = brushColorSelectPrimary.value
  brushColorSelectPrimary.value = brushColorSelectSecondary.value
  brushColorSelectSecondary.value = helper
})

// tool select
const selectTool = tool => {
  toolsContainer.querySelectorAll('button').forEach(b => b.classList.remove('is-primary', 'is-selected'))
  tool.classList.add('is-primary', 'is-selected')
}
toolSelectBrush.addEventListener('click', e => {
  curTool = Tool.PAINTBRUSH
  selectTool(e.currentTarget)
})
toolSelectEraser.addEventListener('click', e => {
  curTool = Tool.ERASER
  selectTool(e.currentTarget)
})
toolSelectFloodFill.addEventListener('click', e => {
  curTool = Tool.BUCKET
  selectTool(e.currentTarget)
})
toolSelectEyedropper.addEventListener('click', e => {
  curTool = Tool.EYEDROPPER
  selectTool(e.currentTarget)
})

// position at which to begin line
const startPos = { x: 0, y: 0 }

// handle mouse click
canvas.addEventListener('mousedown', e => {
  // make new action
  if (!mouseClicked) {
    mouseClicked = true
    curButtonCode = e.button

    // set color to use for path (none for eyedropper)
    let color = ''
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.BUCKET: {
        color = curButtonCode === 0 ? brushColorSelectPrimary.value : brushColorSelectSecondary.value
        break
      }
      case Tool.ERASER: {
        color = Brush.COLOR_ERASER
        break
      }
    }

    if (color) {
      curAction = new Action(paintbrush.size, color, curTool === Tool.BUCKET)
      // begin path at current position
      startPos.x = e.layerX - canvas.offsetLeft
      startPos.y = e.layerY - canvas.offsetTop
      curAction.addPosition(startPos.x, startPos.y)
    }
  }
})

// handle mouse movement
canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    const curPos = { x: e.layerX - canvas.offsetLeft, y: e.layerY - canvas.offsetTop }
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        // draw line from startPos to current mouse position, then set startPos to current
        paintbrush.color = curAction.brushColor
        paintbrush.drawLine(startPos.x, startPos.y, curPos.x, curPos.y)
        curAction.addPosition(curPos.x, curPos.y)
        startPos.x = curPos.x
        startPos.y = curPos.y
        break
      }
      case Tool.EYEDROPPER: {
        // update selected color
        const color = paintbrush.getColorAtPixel(curPos.x, curPos.y)
        if (curButtonCode === 0) {
          brushColorSelectPrimary.value = color
        } else {
          brushColorSelectSecondary.value = color
        }
        break
      }
    }
  }
})

// handle mouse release
document.addEventListener('mouseup', e => {
  if (mouseClicked) {
    const curPos = { x: e.layerX - canvas.offsetLeft, y: e.layerY - canvas.offsetTop }
    switch (curTool) {
      case Tool.PAINTBRUSH:
      case Tool.ERASER: {
        if (e.target === canvas) {
          paintbrush.color = curAction.brushColor
          paintbrush.drawPoint(curPos.x, curPos.y)
        }
        // add action to stack
        actionStack.add(curAction)
        undoBtn.removeAttribute('disabled')
        redoBtn.setAttribute('disabled', null)
        break
      }
      case Tool.BUCKET: {
        paintbrush.color = curAction.brushColor
        // only add action if fill was performed on valid coordinate and selected color != pixel color
        if (e.target === canvas && paintbrush.floodFill(curPos.x, curPos.y)) {
          curAction.fillData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
          actionStack.add(curAction)
          undoBtn.removeAttribute('disabled')
          redoBtn.setAttribute('disabled', null)
        }
        break
      }
      case Tool.EYEDROPPER: {
        if (e.target === canvas) {
          // update selected color
          const color = paintbrush.getColorAtPixel(curPos.x, curPos.y)
          if (curButtonCode === 0) {
            brushColorSelectPrimary.value = color
          } else {
            brushColorSelectSecondary.value = color
          }
          break
        }
      }
    }

    curAction = null
    mouseClicked = false
    curButtonCode = null 
  }
})

// Undo/Redo
const undoHandler = () => {
  actionStack.undo()
  if (!actionStack.canUndo()) {
    undoBtn.setAttribute('disabled', null)
  }
  redoBtn.removeAttribute('disabled')
}
const redoHandler = () => {
  actionStack.redo()
  if (!actionStack.canRedo()) {
    redoBtn.setAttribute('disabled', null)
  }
  undoBtn.removeAttribute('disabled')
}

// undo/redo buttons
undoBtn.addEventListener('click', undoHandler)
redoBtn.addEventListener('click', redoHandler)

// undo/redo shortcuts
window.electronAPI.onUndoShortcut(undoHandler)
window.electronAPI.onRedoShortcut(redoHandler)

// clear canvas
clearBtn.addEventListener('click', () => {
  // wiping the canvas counts as an action only if it's not already blank
  if (!paintbrush.canvasIsBlank()) {
    // if pressed while drawing, save current path before erasing
    if (curAction) {
      actionStack.add(curAction)
      curAction = new Action(curAction.brushSize, curAction.brushColor)
    }
    paintbrush.clearCanvas()
    actionStack.add(new Action(null, null))
    undoBtn.removeAttribute('disabled')
    redoBtn.setAttribute('disabled', null)
  }
})

// save drawing as image
window.electronAPI.onSaveImage(path => {
  if (path) {
    canvas.toBlob(blob => {
      if (blob) {
        blob.arrayBuffer().then(buf => {
          window.electronAPI.saveImageToFile(path, buf)
        })
      }
    })
  }
}, 'image/png')