const loadingManager = new THREE.LoadingManager()
loadingManager.onProgress = (url, loaded, total) => {
	document.querySelector('#progress div div').style.width = `${loaded / total * 100}%`
	if(loaded / total >= 1) {
		setTimeout(() => { document.querySelector('#loading').style.opacity = 0 }, 500)
		setTimeout(() => { document.querySelector('#loading').style.display = 'none' }, 1000)
	}
}

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

let clock = new THREE.Clock()
let moveStatus = { turnLeft: false, turnRight: false, walk: false, speed: 0, animation: false }
let cat, mixer, walk, idle, turnLeft, turnRight

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(25, 25, 25)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xffffff, 0, 100)
scene.background = new THREE.Color(0xffffff)

const light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(-10, 10, 0)
scene.add(light)

const plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0xbbbbbb }))
plane.rotation.set(-Math.PI / 2, 0, 0)
scene.add(plane)

new THREE.GLTFLoader(loadingManager).load('./cat.glb', gltf => {
	gltf.scene.traverse(child => { if(child.type == 'SkinnedMesh') child.material = new THREE.MeshBasicMaterial({ color:0x333333 }) })
	cat = gltf.scene
	cat.scale.set(0.5, 0.5, 0.5)
	scene.add(cat)

	mixer = new THREE.AnimationMixer(cat)
	walk = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Walk'))
	idle = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Idle'))
	walk.play()
	walk.enabled = false
	walk.setDuration(0.5)
	idle.play()
	camera.lookAt(cat.position)
	
	animate()
})

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

function catMove() {
	if(moveStatus.walk) {
		moveStatus.speed += (1 - moveStatus.speed) * 0.1

		if(!moveStatus.animation) {
			moveStatus.animation = true
			walk.enabled = true
			walk.fadeIn(0.5)
			idle.fadeOut(0.5)
		}

		if(mouse.pressed) {
			let dir = ((Math.atan2(-(mouse.y - mouse.firstY), mouse.x - mouse.firstX) + Math.PI * 1.75 - cat.rotation.y % 6.28318) + 6.28318) % 6.28318
			moveStatus.turnLeft = dir > Math.PI + 0.2
			moveStatus.turnRight = dir < Math.PI - 0.2
		}

		if(moveStatus.turnLeft) cat.rotation.y += 0.05 * moveStatus.speed
		if(moveStatus.turnRight) cat.rotation.y -= 0.05 * moveStatus.speed
		cat.position.add(new THREE.Vector3(Math.sin(cat.rotation.y), 0, Math.cos(cat.rotation.y)).multiplyScalar(0.15).multiplyScalar(moveStatus.speed))
	} else {
		moveStatus.speed = 0
		
		if(moveStatus.animation) {
			moveStatus.animation = false
			idle.enabled = true
			walk.fadeOut(0.5)
			idle.fadeIn(0.5)
		}
	}
}

function animate() {
	requestAnimationFrame(animate)

	catMove()
	camera.position.lerp(new THREE.Vector3(cat.position.x + 25, cat.position.y + 25, cat.position.z + 25), 0.1)
	mixer.update(clock.getDelta())
	renderer.render(scene, camera)

	gui.clearRect(0, 0, guiCanvas.width, guiCanvas.height)
	if(mouse.pressed) {
		gui.beginPath()
		gui.strokeStyle = `rgba(255, 255, 255, 0.3)`
		gui.arc(mouse.firstX, mouse.firstY, 50, 0, 6.28318)
		gui.stroke()
		gui.beginPath()
		gui.fillStyle = `rgba(255, 255, 255, 0.8)`
		let dir = Math.atan2(mouse.y - mouse.firstY, mouse.x - mouse.firstX)
		let dist = Math.min(Math.sqrt(Math.pow(mouse.firstX - mouse.x, 2) + Math.pow(mouse.firstY - mouse.y, 2)), 50)
		gui.arc(mouse.firstX + Math.cos(dir) * dist, mouse.firstY + Math.sin(dir) * dist, 25, 0, 6.28318)
		gui.fill()
	}
}

onresize = () => {
	camera.aspect = innerWidth / innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(innerWidth, innerHeight)
	
	guiCanvas.width = innerWidth * devicePixelRatio
	guiCanvas.height = innerHeight * devicePixelRatio
	gui.scale(devicePixelRatio, devicePixelRatio)
	gui.lineWidth = 6
}
onresize()