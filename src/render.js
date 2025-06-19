const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let mouseClicked = false

let brushSize = 5
let brushColor = '#ffffff'

document.addEventListener('mousedown', () => {
  mouseClicked = true
})

document.addEventListener('mouseup', () => {
  mouseClicked = false
})

canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    ctx.beginPath()
    ctx.fillStyle = brushColor
    ctx.ellipse(e.x - canvas.offsetLeft, e.y - canvas.offsetTop, brushSize, brushSize, 0, 0, Math.PI * 2)
    ctx.fill()
  }
})

canvas.addEventListener('mouseup', e => {
  ctx.beginPath()
  ctx.fillStyle = brushColor
  ctx.ellipse(e.x - canvas.offsetLeft, e.y - canvas.offsetTop, brushSize, brushSize, 0, 0, Math.PI * 2)
  ctx.fill()
})