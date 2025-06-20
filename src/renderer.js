import './index.css'
import { Action, Brush, DrawStack } from './drawing.js'

const brushSizeSelect = document.getElementById('brushSizeSelect')
const brushColorSelect = document.getElementById('color-select')
const canvas = document.querySelector('canvas')
const undoBtn = document.getElementById('undo-btn')
const redoBtn = document.getElementById('redo-btn')
const clearBtn = document.getElementById('clear-btn')

// whether the mouse is being held down
let mouseClicked = false

// current action (i.e. shape drawn with mouse)
let curAction = null

// brush and undo/redo stack
const paintbrush = new Brush(canvas, 5, '#ffffff')
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
brushColorSelect.value = '#ffffff'

// use selected color
brushColorSelect.addEventListener('change', e => {
  paintbrush.color = e.target.value
})

// position at which to begin line
const startPos = { x: 0, y: 0 }

// begin action on mouse click
canvas.addEventListener('mousedown', e => {
  // make new action
  curAction = new Action(paintbrush.size, paintbrush.color)

  mouseClicked = true

  // begin path at current position
  startPos.x = e.layerX - canvas.offsetLeft
  startPos.y = e.layerY - canvas.offsetTop
  curAction.addPosition(startPos.x, startPos.y)
})

// stop drawing when mouse is released
document.addEventListener('mouseup', e => {
  if (mouseClicked) {
    actionStack.add(curAction)
    curAction = null
    undoBtn.removeAttribute('disabled')
    redoBtn.setAttribute('disabled', null)
  }
  mouseClicked = false
})

// draw line from startPos to current mouse position, then set startPos to current
canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    const endPos = { x: e.layerX - canvas.offsetLeft, y: e.layerY - canvas.offsetTop }
    paintbrush.drawLine(startPos.x, startPos.y, endPos.x, endPos.y)
    curAction.addPosition(endPos.x, endPos.y)
    startPos.x = endPos.x
    startPos.y = endPos.y
  }
})

// draw a dot on mouse click
canvas.addEventListener('mouseup', e => {
  paintbrush.drawPoint(e.layerX - canvas.offsetLeft, e.layerY - canvas.offsetTop)
})

// Undo.
undoBtn.addEventListener('click', () => {
  actionStack.undo()
  if (!actionStack.canUndo()) {
    undoBtn.setAttribute('disabled', null)
  }
  redoBtn.removeAttribute('disabled')
})

// Redo.
redoBtn.addEventListener('click', () => {
  actionStack.redo()
  if (!actionStack.canRedo()) {
    redoBtn.setAttribute('disabled', null)
  }
  undoBtn.removeAttribute('disabled')
})

// clear canvas
clearBtn.addEventListener('click', () => {
  // wiping the canvas counts as an action only if it's not already blank
  if (!paintbrush.canvasIsBlank()) {
    paintbrush.clearCanvas()
    actionStack.add(new Action(null, null))
    undoBtn.removeAttribute('disabled')
    redoBtn.setAttribute('disabled', null)
  }
})