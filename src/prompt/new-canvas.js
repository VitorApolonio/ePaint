import './new-canvas.css'

const cancelBtn = document.getElementById('cancel-btn')
const confirmBtn = document.getElementById('confirm-btn')
const widthField = document.getElementById('width')
const heightField = document.getElementById('height')

// prevent non-numeric values from being typed
const restrict = e => {
  e.target.value = e.target.value.replace(/\D/g, '')
}

widthField.addEventListener('input', e => restrict(e))
heightField.addEventListener('input', e => restrict(e))

const clearFields = () => {
  widthField.value = ''
  heightField.value = ''
  widthField.focus()
}
const resize = () => {
  const w = Math.max(widthField.value, 100)
  const h = Math.max(heightField.value, 100)
  window.electronAPI.resizeCanvas(w, h)
  window.electronAPI.cancelNew()
}

cancelBtn.addEventListener('click', () => {
  clearFields()
  window.electronAPI.cancelNew()
})

confirmBtn.addEventListener('click', () => {
  resize()
  clearFields()
})

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    resize()
    clearFields()
  }
})

// window close event
window.electronAPI.onClearNewFields(clearFields)