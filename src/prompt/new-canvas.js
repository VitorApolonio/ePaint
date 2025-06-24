import './new-canvas.css'
document.querySelector('body').removeAttribute('hidden')

const cancelBtn = document.getElementById('cancel-btn')

cancelBtn.addEventListener('click', window.electronAPI.cancelNew)