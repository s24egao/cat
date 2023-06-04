class Input {
    walk = false
    turnLeft = false
    turnRight = false
    mousePressed = false
    firstX = 0
    firstY = 0
    x = 0
    y = 0
    dir = 0

    constructor(domElement) {
        this.guiCanvas = document.createElement('canvas')
        this.guiCanvas.setAttribute('id', 'gui')
        this.guiCanvas.setAttribute('style', `position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; pointer-events: none; z-index: 2;`)
        document.body.append(this.guiCanvas)
        this.gui = this.guiCanvas.getContext('2d')
        this.guiCanvas.width = innerWidth * devicePixelRatio
        this.guiCanvas.height = innerHeight * devicePixelRatio
        this.gui.scale(devicePixelRatio, devicePixelRatio)
        this.gui.lineWidth = 3

        addEventListener('resize' , () => {
            this.guiCanvas.width = innerWidth * devicePixelRatio
            this.guiCanvas.height = innerHeight * devicePixelRatio
            this.gui.scale(devicePixelRatio, devicePixelRatio)
            this.gui.lineWidth = 3
        })

        addEventListener('keydown', e => {
            if(e.repeat) return
            if(e.code == 'ArrowLeft' || e.code == 'KeyA') this.turnLeft = true
            if(e.code == 'ArrowRight' || e.code == 'KeyD') this.turnRight = true
            if(e.code == 'ArrowUp' || e.code == 'KeyW') this.walk = true
        })

        addEventListener('keyup', e => {
            if(e.code == 'ArrowLeft' || e.code == 'KeyA') this.turnLeft = false
            if(e.code == 'ArrowRight' || e.code == 'KeyD') this.turnRight = false
            if(e.code == 'ArrowUp' || e.code == 'KeyW') this.walk = false
        })

        for(let event of ['touchstart', 'mousedown']) domElement.addEventListener(event, e => {
            if(event.startsWith('mouse') && e.button != 0) return
            this.mousePressed = true
            this.walk = true
            this.firstX = (e.type.startsWith('touch'))? e.touches[0].clientX : e.clientX
            this.firstY = (e.type.startsWith('touch'))? e.touches[0].clientY : e.clientY
            this.x = this.firstX
            this.y = this.firstY
        })

        for(let event of ['touchmove', 'mousemove']) addEventListener(event, e => {
            if(!this.mousePressed) return
            this.x = (e.type.startsWith('touch'))? e.touches[0].clientX : e.clientX
            this.y = (e.type.startsWith('touch'))? e.touches[0].clientY : e.clientY
            this.dir = Math.atan2(-(this.y - this.firstY), this.x - this.firstX)
        })

        for(let event of ['touchend', 'mouseup']) addEventListener(event, e => {
            this.mousePressed = false
            this.walk = false
            this.turnLeft = false
            this.turnRight = false
        })
    }

    drawUI() {
        this.gui.clearRect(0, 0, this.guiCanvas.width, this.guiCanvas.height)
        if(this.mousePressed) {
            this.gui.beginPath()
            this.gui.strokeStyle = `rgba(255, 255, 255, 0.3)`
            this.gui.arc(this.firstX, this.firstY, 50, 0, 6.28318)
            this.gui.stroke()
            this.gui.beginPath()
            this.gui.fillStyle = `rgba(255, 255, 255, 0.8)`
            let dir = Math.atan2(this.y - this.firstY, this.x - this.firstX)
            let dist = Math.min(Math.sqrt(Math.pow(this.firstX - this.x, 2) + Math.pow(this.firstY - this.y, 2)), 50)
            this.gui.arc(this.firstX + Math.cos(dir) * dist, this.firstY + Math.sin(dir) * dist, 25, 0, 6.28318)
            this.gui.fill()
        }
    }
}