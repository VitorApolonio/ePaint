import './new-canvas.css'

const cancelBtn = document.getElementById('cancel-btn')

cancelBtn.addEventListener('click', window.electronAPI.cancelNew)