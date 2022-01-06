const before = document.createElement("img")
before.src = "before.png"

const after = document.createElement("img")
after.src = "after.png"

const after2 = document.createElement("img")
after2.src = "after2.png"

const sources = [
	after,
	after2,
	before,
]

const state = {
	touchMode: false,
	source: 0,
	upped: true,
}

let BRUSH_SIZE = 10
let BRUSH_COUNT = 1
let BRUSH_JITTER = 200

on.load(() => {

	const show = Show.start({})
	const {context, canvas} = show

	const scale = canvas.height / before.height

	context.scale(scale, scale)
	context.drawImage(before, 0, 0, before.height, before.width)

	show.tick = () => {

		if (!state.touchMode && Touches.length > 0) state.touchMode = true

		let [cx, cy] = [undefined, undefined]
		let cursorUp = false

		if (state.touchMode) {
			if (Touches.length === 0) cursorUp = true
			else {
				const [x, y] = Touches[0].position
				cx = x / scale
				cy = y / scale
			}
		} else {
			if (!Mouse.Left) cursorUp = true
			else {
				const [x, y] = Mouse.position
				cx = x / scale
				cy = y / scale
			}
		}

		if (cursorUp) {
			if (!state.upped) {
				BRUSH_SIZE = 10
				BRUSH_COUNT = 1
				BRUSH_JITTER = 200
				state.source++
				if (state.source >= sources.length) state.source = 0
				state.upped = true
			}
			return
		}

		state.upped = false

		for (let i = 0; i < BRUSH_COUNT; i++) {

			const jx = Math.random() * BRUSH_JITTER - BRUSH_JITTER/2
			const jy = Math.random() * BRUSH_JITTER - BRUSH_JITTER/2

			const w = BRUSH_SIZE
			const h = BRUSH_SIZE
			const x = cx - w/2 + jx
			const y = cy - h/2 + jy
	
			context.drawImage(sources[state.source], x, y, w, h, x, y, w, h)
		}

		BRUSH_SIZE += 1

	}

})