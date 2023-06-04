import * as THREE from 'three'

export default class ParticleSystem {
	needsUpdate = false
	capacity = 1000
	spawnRate = 0
	array = []
	time = 0

	constructor(capacity, geometry, material, spawnRate, spawnFunction, updateFunction) {
		this.capacity = capacity
		this.mesh = new THREE.InstancedMesh(geometry, material, capacity)
		this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
		this.mesh.frustumCulled = false
		this.spawnRate = spawnRate
		this.spawnFunction = spawnFunction
        this.updateFunction = updateFunction
	}

	spawn(amount) {
		for(let i = 0; i < amount && this.array.length < this.capacity; i++) {
			let newParticle = {
				position: new THREE.Vector3(),
				rotation: new THREE.Euler(),
				scale: new THREE.Vector3(1, 1, 1)
			}
			this.spawnFunction(newParticle, this.array.length)
			this.array.push(newParticle)
		}
		this.needsUpdate = true
	}

	update(delta) {
		delta = Math.min(delta, 1)
		if(this.spawnRate > 0) {
			this.time += delta
			while(this.array.length < this.capacity && this.time > 1 / this.spawnRate && this.spawnFunction) {
				this.time -= 1 / this.spawnRate
				let newParticle = {
					position: new THREE.Vector3(),
					rotation: new THREE.Euler(),
					scale: new THREE.Vector3(1, 1, 1)
				}
				this.spawnFunction(newParticle, this.array.length)
				this.array.push(newParticle)
				this.needsUpdate = true
			}
		}
		if(!this.needsUpdate && !this.updateFunction) return
        this.array = this.array.filter(p => !p.remove)
		for(let [i, particle] of this.array.entries()) {
            if(this.updateFunction) this.updateFunction(particle, delta)
            let matrix = new THREE.Matrix4()
            let quaternion = new THREE.Quaternion()
            quaternion.setFromEuler(particle.rotation)
			this.mesh.setMatrixAt(i, matrix.compose(particle.position, quaternion, particle.scale))
		}
		this.mesh.count = Math.min(this.array.length, this.capacity)
        this.mesh.instanceMatrix.needsUpdate = true
		this.needsUpdate = false
	}
}