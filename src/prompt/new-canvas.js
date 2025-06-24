import './new-canvas.css'

const cancelBtn = document.getElementById('cancel-btn')
const widthField = document.getElementById('width')
const heightField = document.getElementById('height')

const clearFields = () => {
  widthField.value = ''
  heightField.value = ''
}

cancelBtn.addEventListener('click', () => {
  clearFields()
  window.electronAPI.cancelNew()
})

// window close event
window.electronAPI.onClearNewFields(clearFields)