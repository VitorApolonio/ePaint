import './new-canvas.css'
window.electronAPI.newCanvasWinReady()

const cancelBtn = document.getElementById('cancel-btn')

cancelBtn.addEventListener('click', window.electronAPI.cancelNew)