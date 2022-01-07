const img = document.createElement("img")
img.src = "tode.png"

const state = {
	todes: [],
}

on.load(() => {
	const show = Show.start({})
	const {context, canvas} = show

	//======//
	// PLAN //
	//======//
	const makePlan = (type, value) => {
		return {type, value}
	}

	const MOVE = (x, y) => (tode) => {

	}

	const CHECK_FREE = (tode) => {

	}

	const DRAW = (tode) => {
		
	}

	//======//
	// TODE //
	//======//
	const makeTode = ({progress = 1.0, scale = 0.5, x = 0, y = 0} = {}) => {
		const tode = {progress, scale, x, y, subject: undefined, plans: []}
		return tode
	}

	const drawTode = (tode) => {
		const x = tode.x
		const y = tode.y
		const width = img.width * tode.scale
		const height = img.height * tode.scale
		context.drawImage(img, x, y, width, height)
	}

	const updateTode = (tode) => {
		if (tode.plans.length === 0) {
			const x = Math.random() * canvas.width
			const y = Math.random() * canvas.height
			tode.plans.push(MOVE(x, y))
			tode.plans.push(CHECK_FREE)
			tode.plans.push(DRAW)
		}
	}

	//======//
	// TICK //
	//======//
	state.todes.push(makeTode())

	show.tick = () => {

		context.clearRect(0, 0, canvas.width, canvas.height)

		for (let i = state.todes.length-1; i >= 0; i--) {
			const tode = state.todes[i]
			updateTode(tode)
			drawTode(tode)
		}

	}


})