const img = document.createElement("img")
img.src = "tode.png"

const bg = document.createElement("img")
bg.src = "bg.png"

const state = {
	todes: [],
}

const SPEED = 0.01
const ACCELERATION = 0.5
const MAX_SPEED = 15.0
const FRICTION = 0.97

const ACCURACY = 15
const BRUSH_X = 0.0
const BRUSH_Y = 0.2

const SHRINK = 0.6
const SPAWN_X = -0.4
const SPAWN_Y = -0.2

const GRID_SIZE = 8
const START_X = 2
const START_Y = 2

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
		const sx = Math.sign(x - tode.x)
		const sy = Math.sign(y - tode.y)

		tode.dx += sx * ACCELERATION
		tode.dy += sy * ACCELERATION

		if (Math.abs(tode.dx) > MAX_SPEED) tode.dx = Math.sign(tode.dx) * MAX_SPEED
		if (Math.abs(tode.dy) > MAX_SPEED) tode.dy = Math.sign(tode.dy) * MAX_SPEED

		//===============//
		// PAINT SUBJECT //
		//===============//
		if (tode.subject !== undefined) {
			
			const width = img.width * tode.subject.scale
			const height = img.height * tode.subject.scale
			const subjectx = tode.subject.x - BRUSH_X*width
			const subjecty = tode.subject.y - BRUSH_Y*height

			const pwidth = width / GRID_SIZE
			const pheight = height / GRID_SIZE

			for (let px = 0; px < GRID_SIZE; px++) {
				for (let py = 0; py < GRID_SIZE; py++) {
					const key = getKey(px, py)
					const p = tode.subject.progress.get(key)
					if (p) continue

					const left = subjectx + px*pwidth
					const top = subjecty + py*pheight

					const right = left + pwidth
					const bottom = top + pheight

					if (tode.x > left-tode.scale*ACCURACY && tode.x < right+tode.scale*ACCURACY) {
						if (tode.y > top-tode.scale*ACCURACY && tode.y < bottom+tode.scale*ACCURACY) {
							tode.subject.progress.set(key, true)
							tode.plans.pop()
						}
					}
				}
			}
		}
		

		const left = x - ACCURACY
		const right = x + ACCURACY
		const top = y - ACCURACY
		const bottom = y + ACCURACY

		if (tode.x > left && tode.x < right) {
			if (tode.y > top && tode.y < bottom) {
				return true
			}
		}

		return false

	}

	const CHECK_FREE = (tode) => {
		return true
	}

	const getEmpties = (tode) => {
		const empties = []
		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				const key = getKey(x, y)
				const p = tode.progress.get(key)
				if (!p) empties.push([x, y])
			}
		}
		return empties
	}

	const MARGIN = 0.1
	const SPAWN = (tode) => {

		
		const scale = tode.scale * SHRINK

		const sx = Math.random() * canvas.width - scale*img.width/2
		const sy = Math.random() * canvas.height - scale*img.height/2

		const x = sx + (scale * img.width) * SPAWN_X
		const y = sy + (scale * img.height) * SPAWN_Y
		const spawn = makeTode({x, y, scale, finished: false})
		tode.subject = spawn
		
		const px = START_X
		const py = START_Y
		const pkey = getKey(px, py)
		//spawn.progress.set(pkey, true)

		state.todes.push(spawn)

		return true
	}

	//==========//
	// PROGRESS //
	//==========//
	const getKey = (x, y) => `${x},${y}`
	const getPosition = (key) => key.split(",").map(n => parseInt(n))

	//======//
	// TODE //
	//======//
	const makeTode = ({finished = true, progress = new Map(), scale = 0.6, x = 0, y = 0, dx = 0, dy = 0} = {}) => {
		const tode = {finished, progress, scale, x, y, dx, dy, subject: undefined, plans: []}
		return tode
	}

	const drawTode = (tode) => {
		const width = img.width * tode.scale
		const height = img.height * tode.scale
		const x = tode.x - BRUSH_X*width
		const y = tode.y - BRUSH_Y*height

		if (tode.finished) {
			context.drawImage(img, x, y, width, height)
			return
		}

		const pwidth = width / GRID_SIZE
		const pheight = height / GRID_SIZE
		const swidth = img.width / GRID_SIZE
		const sheight = img.height / GRID_SIZE
		for (let px = 0; px < GRID_SIZE; px++) {
			for (let py = 0; py < GRID_SIZE; py++) {
				const key = getKey(px, py)
				const p = tode.progress.get(key)
				if (!p) continue
				const sx = px * swidth
				const sy = py * sheight
				const dx = x + px*pwidth
				const dy = y + py*pheight
				context.drawImage(bg, sx, sy, swidth, sheight, dx, dy, pwidth, pheight)
			}
		}
	}

	const updateTode = (tode) => {

		if (!tode.finished) return
		
		tode.x += tode.dx
		tode.y += tode.dy

		tode.dx *= FRICTION
		tode.dy *= FRICTION

		if (tode.plans.length === 0) {
			if (tode.subject === undefined) {
				tode.plans.push(SPAWN)
			}
			else {
				const empties = getEmpties(tode.subject)
				if (empties.length === 0) {
					tode.subject.finished = true
					tode.subject = undefined
					return
				}

				const empty = empties[Math.floor(Math.random()*empties.length)]
				const [ex, ey] = empty

				const swidth = img.width * tode.subject.scale
				const sheight = img.height * tode.subject.scale
				const sx = tode.subject.x - BRUSH_X*swidth
				const sy = tode.subject.y - BRUSH_Y*sheight

				const ewidth = swidth / GRID_SIZE
				const eheight = sheight / GRID_SIZE

				const x = sx + ex * ewidth
				const y = sy + ey * eheight

				tode.plans.push(MOVE(x + ewidth/2, y + eheight/2))
			}
			return
		}

		const plan = tode.plans[tode.plans.length-1]
		const result = plan(tode)
		if (result) {
			tode.plans.pop()
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