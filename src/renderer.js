/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css'
import { Brush, DrawStack } from './drawing.js'

const brushSizeSelect = document.getElementById('brushSizeSelect')
const brushColorSelect = document.getElementById('color-select')
const canvas = document.querySelector('canvas')
const undoBtn = document.getElementById('undo-btn')
const redoBtn = document.getElementById('redo-btn')

// whether the mouse is being held down
let mouseClicked = false

// auto resize canvas, preserving current drawing
window.electronAPI.onResize((width, height) => {
  const bkpCanvas = document.createElement('canvas')
  bkpCanvas.width = canvas.width
  bkpCanvas.height = canvas.height
  bkpCanvas.getContext('2d').drawImage(canvas, 0, 0)

  canvas.width = width * 0.8
  canvas.height = height * 0.8

  canvas.getContext('2d').drawImage(bkpCanvas, 0, 0)
})

// brush settings
const brush = new Brush(canvas, 2, '#ffffff')
const actionStack = new DrawStack(canvas)
const action = {
  positions: [],
  brushState: { size: null, color: null }
}

// setup brush sizes
const sizes = [2, 5, 10, 15, 20, 25, 30]

sizes.forEach(s => {
  const e = document.createElement('option')
  e.innerHTML = s
  brushSizeSelect.appendChild(e)
})

// use selected brush size
brushSizeSelect.addEventListener('change', e => {
  brush.size = e.target.value
})

// set default brush color
brushColorSelect.value = '#ffffff'

// use selected color
brushColorSelect.addEventListener('change', e => {
  brush.color = e.target.value
})

// position to begin line
const startPos = { x: 0, y: 0 }

// set line start position on mouse click
canvas.addEventListener('mousedown', e => {
  // record current brush settings
  action.brushState.color = brush.color
  action.brushState.size = brush.size

  mouseClicked = true
  startPos.x = e.layerX - canvas.offsetLeft
  startPos.y = e.layerY - canvas.offsetTop

  action.positions.push({ x: startPos.x, y: startPos.y })
})

// stop drawing when mouse is released
document.addEventListener('mouseup', e => {
  if (mouseClicked) {
    actionStack.add(action)
    action.positions = []
  }
  mouseClicked = false
})

// draw line from startPos to current mouse position, then set startPos to current
canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    const endPos = { x: e.layerX - canvas.offsetLeft, y: e.layerY - canvas.offsetTop }
    brush.drawLine(startPos.x, startPos.y, endPos.x, endPos.y)
    startPos.x = endPos.x
    startPos.y = endPos.y
    action.positions.push({ x: endPos.x, y: endPos.y })
  }
})

// draw a dot on mouse click
canvas.addEventListener('mouseup', e => {
  brush.drawPoint(e.layerX - canvas.offsetLeft, e.layerY - canvas.offsetTop)
})

// Undo.
undoBtn.addEventListener('click', () => {
  actionStack.undo()
})