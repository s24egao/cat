import * as THREE from 'three'

export class ParticleSystem {
	updated = false
	capacity = 1000
	array = []

	constructor(scene, geometry, material, capacity, updateParticle) {
		this.capacity = capacity
		this.mesh = new THREE.InstancedMesh(geometry, material, capacity)
        this.updateParticle = updateParticle
		scene.add(this.mesh)
	}

	add(p) {
		if(this.array.length >= this.capacity) return
		this.array.push(p)
		this.updated = true
	}

	update(delta) {
		if(!this.updated && !this.updateParticle) return
        this.array = this.array.filter(p =>  !p.remove)
		for(let [i, p] of this.array.entries()) {
            if(this.updateParticle) this.updateParticle(p, delta)
            let matrix = new THREE.Matrix4()
            let quaternion = new THREE.Quaternion()
            quaternion.setFromEuler(p.rotation)
			this.mesh.setMatrixAt(i, matrix.compose(p.position, quaternion, p.scale))
		}
		this.mesh.count = Math.min(this.array.length, this.capacity)
        this.mesh.instanceMatrix.needsUpdate = true
	}
}