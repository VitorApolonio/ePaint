import './index.css'
import { Action, Brush, DrawStack, Tool } from './drawing.js'
import './lucide.js'

const toolSelectBrush = document.getElementById('brush-tool')
const toolSelectEraser = document.getElementById('eraser-tool')
const brushSizeSelect = document.getElementById('brush-size-select')
const brushColorSelectPrimary = document.getElementById('color-select-primary')
const brushColorSelectSecondary = document.getElementById('color-select-secondary')
const colorSwapBtn = document.getElementById('swap-colors')
const canvas = document.querySelector('canvas')
const undoBtn = document.getElementById('undo-btn')
const redoBtn = document.getElementById('redo-btn')
const clearBtn = document.getElementById('clear-btn')

// selected tool code
let curTool = Tool.PAINTBRUSH

// whether the mouse is being held down
let mouseClicked = false

// current action (i.e. shape drawn with mouse)
let curAction = null

// brush and undo/redo stack
const paintbrush = new Brush(canvas, 5, null)
const actionStack = new DrawStack(canvas)

// auto resize canvas, preserving current drawing
window.electronAPI.onResize((width, height) => {
  const bkpCanvas = document.createElement('canvas')
  bkpCanvas.width = canvas.width
  bkpCanvas.height = canvas.height
  bkpCanvas.getContext('2d').drawImage(canvas, 0, 0)

  canvas.width = width * 0.8
  canvas.height = height * 0.75

  canvas.getContext('2d').drawImage(bkpCanvas, 0, 0)
})

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
toolSelectBrush.addEventListener('click', e => {
  curTool = Tool.PAINTBRUSH
  toolSelectBrush.classList.add('is-primary')
  toolSelectEraser.classList.remove('is-primary')
})
toolSelectEraser.addEventListener('click', e => {
  curTool = Tool.ERASER
  toolSelectEraser.classList.add('is-primary')
  toolSelectBrush.classList.remove('is-primary')
})

// position at which to begin line
const startPos = { x: 0, y: 0 }

// begin action on mouse click
canvas.addEventListener('mousedown', e => {
  // make new action
  if (!mouseClicked) {
    let color
    switch (curTool) {
      case Tool.PAINTBRUSH: {
        color = e.button === 0 ? brushColorSelectPrimary.value : brushColorSelectSecondary.value
        break
      }
      case Tool.ERASER: {
        color = Brush.COLOR_ERASER
        break
      }
    }
    curAction = new Action(paintbrush.size, color)

    mouseClicked = true

    // begin path at current position
    startPos.x = e.layerX - canvas.offsetLeft
    startPos.y = e.layerY - canvas.offsetTop
    curAction.addPosition(startPos.x, startPos.y)
  }
})

// stop drawing when mouse is released
document.addEventListener('mouseup', e => {
  if (mouseClicked) {
    actionStack.add(curAction)
    curAction = null
    undoBtn.removeAttribute('disabled')
    redoBtn.setAttribute('disabled', null)
    mouseClicked = false
  }
})

// draw line from startPos to current mouse position, then set startPos to current
canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    const endPos = { x: e.layerX - canvas.offsetLeft, y: e.layerY - canvas.offsetTop }
    paintbrush.color = curAction.brushColor
    paintbrush.drawLine(startPos.x, startPos.y, endPos.x, endPos.y)
    curAction.addPosition(endPos.x, endPos.y)
    startPos.x = endPos.x
    startPos.y = endPos.y
  }
})

// draw a dot on mouse click
canvas.addEventListener('mouseup', e => {
  if (mouseClicked) {
    paintbrush.color = curAction.brushColor
    paintbrush.drawPoint(e.layerX - canvas.offsetLeft, e.layerY - canvas.offsetTop)
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