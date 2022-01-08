const plane = document.createElement("img")
plane.src = "plane.png"

const PLANE_SCALE = 0.2

on.load(() => {
	const show = Show.start()
	const {context, canvas} = show

	const state = {
		x: canvas.width * 0.5,
		y: canvas.height * 0.95,
		direction: 270,
		speed: 5,
		dspeed: 1.00035,
		rotation: -0.6,
		drotation: 1.0005,
		history: [],
		zoom: 1.0,
		dzoom: 1.0,
	}

	state.start = [state.x, state.y]

	show.tick = () => {

		context.clearRect(0, 0, canvas.width, canvas.height)
		context.translate(canvas.width/2, canvas.height/2)
		context.scale(state.zoom, state.zoom)
		context.translate(-canvas.width/2, -canvas.height/2)


		const dx = state.speed * Math.sin(state.direction * Math.PI/180)
		const dy = state.speed * Math.cos(state.direction * Math.PI/180)

		state.x += dx
		state.y += dy

		state.direction += state.rotation
		state.rotation *= state.drotation
		state.speed *= state.dspeed

		state.history.push([state.x, state.y])

		const [sx, sy] = state.start
		context.fillStyle = Colour.White
		context.beginPath()
		context.arc(sx, sy, 10, 0, 2*Math.PI)
		context.fill()
		
		context.beginPath()
		context.moveTo(sx, sy)

		for (const [x, y] of state.history) {
			context.lineTo(x, y)
		}

		context.lineWidth = 10
		context.setLineDash([1000 / state.speed, 200 / state.speed])
		context.strokeStyle = Colour.White
		context.stroke()

		context.translate(state.x, state.y)
		context.scale(PLANE_SCALE, PLANE_SCALE)
		context.rotate((-state.direction + 90) * Math.PI/180)
		context.drawImage(plane, -plane.width/2, -plane.height/2)

		state.zoom *= state.dzoom

		context.resetTransform()

	}
})
