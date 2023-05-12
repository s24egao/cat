let moveStatus = { turnLeft: false, turnRight: false, walk: false, speed: 0, animation: false }

addEventListener('keydown', e => {
	if(e.repeat) return
	if(e.code == 'ArrowLeft' || e.code == 'KeyA') moveStatus.turnLeft = true
	if(e.code == 'ArrowRight' || e.code == 'KeyD') moveStatus.turnRight = true
	if(e.code == 'ArrowUp' || e.code == 'KeyW') moveStatus.walk = true
})

addEventListener('keyup', e => {
	if(e.code == 'ArrowLeft' || e.code == 'KeyA') moveStatus.turnLeft = false
	if(e.code == 'ArrowRight' || e.code == 'KeyD') moveStatus.turnRight = false
	if(e.code == 'ArrowUp' || e.code == 'KeyW') moveStatus.walk = false
})

let mouse = { pressed: false, firstX: 0, firstY: 0, x: 0, y: 0 }
let guiCanvas = document.querySelector('#gui')
let gui = guiCanvas.getContext('2d')

for(let event of ['touchstart', 'mousedown']) addEventListener(event, e => {
	mouse.pressed = true
	moveStatus.walk = true
	mouse.firstX = (e.type.startsWith('touch'))? e.touches[0].clientX : e.clientX
	mouse.firstY = (e.type.startsWith('touch'))? e.touches[0].clientY : e.clientY
})

for(let event of ['touchmove', 'mousemove']) addEventListener(event, e => {
	if(!mouse.pressed) return
	mouse.x = (e.type.startsWith('touch'))? e.touches[0].clientX : e.clientX
	mouse.y = (e.type.startsWith('touch'))? e.touches[0].clientY : e.clientY
})

for(let event of ['touchend', 'mouseup']) addEventListener(event, e => {
	mouse.pressed = false
	moveStatus.walk = false
	moveStatus.turnLeft = false
	moveStatus.turnRight = false
})