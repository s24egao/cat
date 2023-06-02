import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ParticleSystem } from './particle.js'

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

let input = new Input(renderer.domElement)

let clock = new THREE.Clock()
let cat, mixer, walk, idle, speed = 0

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(25, 15, 25)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xdddddd, 10, 90)
scene.background = new THREE.Color(0xdddddd)

const plane = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshBasicMaterial({ color: 0x222222 }))
plane.rotation.set(-Math.PI / 2, 0, 0)
scene.add(plane)

new GLTFLoader(loadingManager).load('./cat.glb', gltf => {
	gltf.scene.traverse(child => { if(child.type == 'SkinnedMesh') child.material = new THREE.MeshBasicMaterial({ color: 0x222222 }) })
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
	
	requestAnimationFrame(animate)
})

function catMove(d) {
	if(input.walk) {
		if(!walk.enabled) {
			walk.enabled = true
			walk.fadeIn(0.5)
			idle.fadeOut(0.5)
		}

		if(input.mousePressed) {
			let dir = ((input.dir + Math.PI * 1.75 - cat.rotation.y % 6.28318) + 6.28318) % 6.28318
			input.turnLeft = dir > Math.PI + 0.2
			input.turnRight = dir < Math.PI - 0.2
		}
		
		if(input.turnLeft) cat.rotation.y += 2 * speed * d
		if(input.turnRight) cat.rotation.y -= 2 * speed * d
	} else if(!idle.enabled) {
		idle.enabled = true
		walk.fadeOut(0.5)
		idle.fadeIn(0.5)
	}
	speed += ((input.walk? 1 : 0) - speed) * 5 * d
	cat.position.add(new THREE.Vector3(Math.sin(cat.rotation.y), 0, Math.cos(cat.rotation.y)).multiplyScalar(9 * speed * d))
}

let particles = new ParticleSystem(scene, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x222222 }), 5000)

for(let i = 0; i < 2048; i++) {
	particles.add({
		position: new THREE.Vector3(Math.random() * 100 - 50, 0, Math.random() * 100 - 50),
		rotation: new THREE.Euler(0, 0, 0),
		scale: new THREE.Vector3(0.1, 2, 0.1)
	})
}

let box1 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: 0x222222 }))
box1.position.set(5, 1, 0)
scene.add(box1)

let box2 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: 0x222222 }))
box2.position.set(-3, 1, 3)
scene.add(box2)

let objectTracker = new ObjectTracker(camera, 0.5)
objectTracker.add(document.querySelector('#card-1'), box1, 0, -100)
objectTracker.add(document.querySelector('#card-2'), box2, 0, -100)

function animate() {
	requestAnimationFrame(animate)

	let d = clock.getDelta()
	catMove(d)
	mixer.update(d)
	input.drawUI()
	particles.update(d)
	camera.position.lerp(new THREE.Vector3(cat.position.x + 25, cat.position.y + 15, cat.position.z + 25), 0.1)
	objectTracker.update()

	renderer.render(scene, camera)
}

addEventListener('resize', () => {
	camera.aspect = innerWidth / innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(innerWidth, innerHeight)
})