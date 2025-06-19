const brushSizeSelect = document.getElementById('brushSizeSelect')
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let mouseClicked = false


// brush settings
let brushSize = 2
let brushColor = '#ffffff'

// setup brush sizes
const sizes = [2, 5, 10, 15, 20, 25, 30]

sizes.forEach(s => {
  const e = document.createElement('option')
  e.innerHTML = s
  brushSizeSelect.appendChild(e)
})

// use selected brush size
brushSizeSelect.addEventListener('change', e => {
  brushSize = e.target.value
})

// positions to begin line
const startPos = { x: 0, y: 0 }

// set line start position on mouse click
canvas.addEventListener('mousedown', e => {
  mouseClicked = true
  startPos.x = e.x - canvas.offsetLeft
  startPos.y = e.y - canvas.offsetTop
})

// stop drawing when mouse is released
canvas.addEventListener('mouseup', () => {
  mouseClicked = false
})

// draw line from startPos to current mouse position, then set startPos to current
canvas.addEventListener('mousemove', e => {
  if (mouseClicked) {
    draw(e)
    startPos.x = e.x - canvas.offsetLeft
    startPos.y = e.y - canvas.offsetTop
  }
})

// draw a dot on mouse click
canvas.addEventListener('mouseup', e => {
  ctx.beginPath()
  ctx.fillStyle = brushColor
  ctx.ellipse(e.x - canvas.offsetLeft, e.y - canvas.offsetTop, brushSize / 2, brushSize / 2, 0, 0, Math.PI * 2)
  ctx.fill()
})

// drawing algorithm
const draw = (e) => {
  ctx.beginPath()
  ctx.lineCap = 'round'
  ctx.lineWidth = brushSize
  ctx.strokeStyle = brushColor
  ctx.moveTo(startPos.x, startPos.y)
  ctx.lineTo(e.x - canvas.offsetLeft, e.y - canvas.offsetTop)
  ctx.stroke()
}