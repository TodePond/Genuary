
const frog = document.createElement("img")
frog.src = "frog.png"

const state = {
	pixelScale: 1.0,
	distanceScale: 1.0,
	distanceScaleChange: 1.002,
	speed: 1.0,
}

const FROG_SCALE = 1.0
const PIXEL_SIZE = 20
const DITHER_DISTANCE = 2
const DITHER_AREA = 0.3

on.load(() => {
	
	const show = Show.start({overload: 10, paused: true})
	const {context, canvas} = show

	const fw = frog.width * FROG_SCALE
	const fh = frog.height * FROG_SCALE
	const fx = canvas.width/2 - fw/2
	const fy = canvas.height/2 - fh/2

	context.translate(fx, fy)
	context.scale(FROG_SCALE, FROG_SCALE)
	context.drawImage(frog, 0, 0, frog.width, frog.height)

	context.strokeStyle = Colour.White

	show.tick = () => {
		state.speed *= 0.9998
		if (Math.random() > state.speed) return

		const dd = DITHER_DISTANCE * state.distanceScale
		state.distanceScale *= state.distanceScaleChange
		if (state.distanceScale > 100.0) state.distanceScaleChange = 0.999

		const sx = Math.random() * frog.width * DITHER_AREA + frog.width*0.5 - frog.width*DITHER_AREA/2
		const sy = Math.random() * frog.height * DITHER_AREA + frog.height*0.5 - frog.height*DITHER_AREA/2
		const mx = Math.random() * dd*2 - dd
		const my = Math.random() * dd*2 - dd
		const dx = sx + mx
		const dy = sy + my

		const ps = PIXEL_SIZE * state.pixelScale
		state.pixelScale *= 1.0005

		const SX = sx-ps/2
		const SY = sy-ps/2
		const DX = dx-ps/2
		const DY = dy-ps/2

		context.drawImage(frog, SX, SY, ps, ps, DX, DY, ps, ps)
		context.drawImage(frog, DX, DY, ps, ps, SX, SY, ps, ps)

		context.strokeRect(DX, DY, ps, ps)
		context.strokeRect(SX, SY, ps, ps)
		
	}
	
})