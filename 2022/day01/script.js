
const frog = document.createElement("img")
frog.src = "frog.png"

const gorf = document.createElement("img")
gorf.src = "gorf.png"

const state = {
	i: 0,
	inverse: false,
	finished: false,
	age: 1.0,
	speed: 0.002,
	acceleration: 1.0001,
	tick: true,
}

const FROG_SCALE = 1.0
const GROWTH = 0.999


on.load(() => {
	
	const show = Show.start({overload: 5, paused: true})
	const {context, canvas} = show

	show.tick = () => {
		if (state.finished) return

		state.speed *= state.acceleration
		//if (Math.random() > state.speed) return

		const img = state.tick? frog : gorf
		state.tick = !state.tick

		const width = img.width * FROG_SCALE * state.age
		const height = img.height * FROG_SCALE * state.age

		const x = Math.random() * canvas.width - width/2
		const y = Math.random() * canvas.height - height/2

		context.translate(x, y)
		context.drawImage(img, 0, 0, width, height)
		context.translate(-x, -y)

		state.i++
		state.age *= GROWTH
		if (state.i > 5_000) state.inverse = true
		if (state.i > 10_000) state.finished = true
	}
	
})