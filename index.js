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
let cat
let moveStatus = { turnLeft: false, turnRight: false, walk: false }
let mixer, walk, idle

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(25, 25, 25)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xffffff, 0, 100)
scene.background = new THREE.Color(0xffffff)

const light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(-10, 10, 0)
scene.add(light)

scene.add(new THREE.HemisphereLight( 0xffcccc, 0xccffff, 1))

const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0xcccccc }))
plane.rotation.set(-Math.PI / 2, 0, 0)
scene.add(plane)

new THREE.GLTFLoader(loadingManager).load('./cat.glb', gltf => {
	cat = gltf.scene
	cat.scale.set(0.5, 0.5, 0.5)
	scene.add(gltf.scene)

	mixer = new THREE.AnimationMixer(cat)
	walk = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Walk'))
	idle = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Idle'))
	walk.play()
	walk.enabled = false
	walk.setDuration(0.6)
	idle.play()
	camera.lookAt(cat.position)
})

addEventListener('keydown', e => {
	if(e.repeat) return
	if(e.code == 'ArrowLeft' || e.code == 'KeyA') moveStatus.turnLeft = true
	if(e.code == 'ArrowRight' || e.code == 'KeyD') moveStatus.turnRight = true
	if(e.code == 'ArrowUp' || e.code == 'KeyW') {
		walk.enabled = true
		walk.fadeIn(0.5)
		idle.fadeOut(0.5)
		moveStatus.walk = true
	}
})

addEventListener('keyup', e => {
	if(e.code == 'ArrowLeft' || e.code == 'KeyA') moveStatus.turnLeft = false
	if(e.code == 'ArrowRight' || e.code == 'KeyD') moveStatus.turnRight = false
	if(e.code == 'ArrowUp' || e.code == 'KeyW') {
		walk.fadeOut(0.5)
		idle.enabled = true
		idle.fadeIn(0.5)
		moveStatus.walk = false
	}
})

function catMove() {
	if(moveStatus.walk) {
		cat.position.add(new THREE.Vector3(Math.sin(cat.rotation.y), 0, Math.cos(cat.rotation.y)).multiplyScalar(0.15))
		if(moveStatus.turnLeft) cat.rotation.y += 0.05
		if(moveStatus.turnRight) cat.rotation.y -= 0.05
	}
}

function animate() {
	requestAnimationFrame(animate)

	if(cat) {
		catMove()
		camera.position.lerp(new THREE.Vector3(cat.position.x + 25, cat.position.y + 25, cat.position.z + 25), 0.1)
		mixer.update(clock.getDelta())
	}

	renderer.render(scene, camera)
}
animate()

onresize = e => {
	camera.aspect = innerWidth / innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(innerWidth, innerHeight)
}
onresize()