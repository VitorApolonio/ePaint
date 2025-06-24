import './new-canvas.css'

const cancelBtn = document.getElementById('cancel-btn')
const confirmBtn = document.getElementById('confirm-btn')
const widthField = document.getElementById('width')
const heightField = document.getElementById('height')

const clearFields = () => {
  widthField.value = ''
  heightField.value = ''
}
const resize = () => {
  window.electronAPI.resizeCanvas(widthField.value, heightField.value)
  window.electronAPI.cancelNew()
}

cancelBtn.addEventListener('click', () => {
  clearFields()
  window.electronAPI.cancelNew()
})

confirmBtn.addEventListener('click', resize)

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    resize()
  }
})

// window close event
window.electronAPI.onClearNewFields(clearFields)