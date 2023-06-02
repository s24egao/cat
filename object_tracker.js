function map(min1, max1, min2, max2, value) {
    return (value - min1) / (min1 - max1) * (min2 - max2) + min2
}

class ObjectTracker {
    list = []
    maxVisibleDistance = 0

    constructor(camera, maxVisibleDistance) {
        this.camera = camera
        this.maxVisibleDistance = maxVisibleDistance
    }

    add(element, object3D, offsetX, offsetY) {
        this.list.push({ element: element, object3D: object3D, offsetX: offsetX || 0, offsetY: offsetY || 0 })
    }

    update() {
        for(let o of this.list) {
            let project = o.object3D.position.clone().project(this.camera)
            let x = map(-1, 1, 0, innerWidth, project.x) + o.offsetX
            let y = map(1, -1, 0, innerHeight, project.y) + o.offsetY
            o.element.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`
            if(this.maxVisibleDistance) {
                o.element.style.opacity = (this.maxVisibleDistance > Math.sqrt(Math.pow(project.x, 2) + Math.pow(project.y, 2)))? 1 : 0
                o.element.style.pointerActions = (this.maxVisibleDistance > Math.sqrt(Math.pow(project.x, 2) + Math.pow(project.y, 2)))? 'all' : 'none'
            }
        }
    }
}