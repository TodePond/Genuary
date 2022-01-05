
const red = document.createElement("img")
red.src = "red.png"


on.load(() => {
	
	const show = Show.start()
	const {context, canvas} = show

	
	let prevMouse = canvas.width/2
	let touchMode = false

	const PAD_Y = 0.9
	const PAD_DDX = 0.1
	const PAD_HEIGHT = 20
	const PAD_WIDTH = 150
	const STEER = 0.1
	const pad = {
		x: canvas.width/2,
		dx: 0,
	}

	const FROG_SCALE = 0.15
	const FROG_BOOST = 1.01
	const FROG_SQUISH = 0.05
	const FROG_MAX_SPEED = 10.0
	const frog = {
		x: 0,
		y: 500,
		dx: 5,
		dy: 5,
		sx: 0.0,
		sy: 0.0,
		ds: 0.9,
		prevX: 5,
		prevY: 5,
		prevAbove: true,
	}

	const GRID_SIZE = 10
	const GRID_SCALE = 0.5
	const SQUARE_SCALE = 0.9
	const grid = new Map()
	const getKey = (x, y) => `${x},${y}`
	const getPosition = (key) => key.split(",").map(n => parseInt(n))

	const gwidth = canvas.width * GRID_SCALE
	const gheight = canvas.height * GRID_SCALE

	const swidth = gwidth / GRID_SIZE
	const sheight = gheight / GRID_SIZE

	const gx = (canvas.width - gwidth)/2
	const gy = (canvas.height - gheight)/4

	for (let x = 0; x < GRID_SIZE; x++) {
		for (let y = 0; y < GRID_SIZE; y++) {
			const key = getKey(x, y)
			grid.set(key, {
				alive: true,
				x: x*swidth + gx,
				y: y*sheight + gy,

			})
		}
	}

	// Init
	/*context.fillStyle = Colour.Green
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = Colour.Black
	context.globalAlpha = 0.1
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.globalAlpha = 1.0*/



	show.tick = () => {
		
		// Clear
		context.fillStyle = Colour.Black
		//context.globalAlpha = 1/2
		context.fillRect(0, 0, canvas.width, canvas.height)
		//context.globalAlpha = 1.0

		// Pad
		let mx = 0
		if (Touches.length > 0) {
			mx = Touches[0].position[0]
			prevMouse = mx
			touchMode = true
		}
		else if (!touchMode) {
			mx = Mouse.position[0] !== undefined? Mouse.position[0] : prevMouse
		}
		else {
			mx = prevMouse
		}
		prevMouse = mx
		const distanceToMouse = mx - pad.x - PAD_WIDTH/2
		pad.dx = distanceToMouse * PAD_DDX
		pad.x += pad.dx
		context.fillStyle = Colour.Green
		context.fillRect(pad.x, canvas.height * PAD_Y, PAD_WIDTH, PAD_HEIGHT)

		// Frog
		frog.x += frog.dx
		frog.y += frog.dy

		frog.sx *= frog.ds
		frog.sy *= frog.ds
		
		if (frog.sx > 1) frog.sx = 0.5
		if (frog.sy > 1) frog.sy = 0.5

		let fheight = red.height * FROG_SCALE * (1-frog.sy)
		let fwidth = red.width * FROG_SCALE * (1-frog.sx)

		const fbottom = frog.y + fheight
		const ftop = frog.y
		const fright = frog.x + fwidth
		const fleft = frog.x

		const ptop = canvas.height * PAD_Y
		const pleft = pad.x
		const pright = pad.x + PAD_WIDTH

		if (ftop > canvas.height) {
			frog.x = canvas.width/4
			frog.y = 3*canvas.height/4
			frog.dx = 5
			frog.dy = 5
			frog.prevX = canvas.width/4
			frog.prevY = 3*canvas.height/4
			let score = 0
			for (const square of grid.values()) {
				if (!square.alive) score++
				square.alive = true
			}
			//grid.score = score
		}

		if (fright > canvas.width) {
			frog.dx *= -1 * FROG_BOOST
			frog.sx += FROG_SQUISH * Math.abs(frog.dx)
			fwidth = red.width * FROG_SCALE * (1-frog.sx)
			frog.x = canvas.width - fwidth
		}

		if (fleft < 0) {
			frog.dx *= -1 * FROG_BOOST
			frog.x = 0
			frog.sx += FROG_SQUISH * Math.abs(frog.dx)
		}

		if (ftop < 0) {
			frog.dy *= -1 * FROG_BOOST
			frog.y = 0
			frog.sy += FROG_SQUISH * Math.abs(frog.dy)
		}

		if (frog.prevAbove && frog.dy > 0 && fbottom > ptop) {
			if (fleft > pleft && fleft < pright || fright > pleft && fright < pright) {
				frog.dy *= -1 * FROG_BOOST
				frog.sy += FROG_SQUISH * Math.abs(frog.dy)
				fheight = red.height * FROG_SCALE * (1-frog.sy)
				frog.y = ptop - fheight
				const fmid = frog.x + fwidth/2
				const pmid = pad.x + PAD_WIDTH/2
				const position = fmid - pmid
				const speed = Math.hypot(frog.dx, frog.dy)
				frog.dx = position * STEER
				const newSpeed = Math.hypot(frog.dx, frog.dy)
				const speedRatio = newSpeed / speed
				frog.dy /= speedRatio
			}
		}

		fwidth = red.width * FROG_SCALE * (1-frog.sx)
		const fmidx = frog.x + fwidth/2
		const fmidy = frog.y + fheight/2

		const fpbottom = frog.prevY + fheight
		const fptop = frog.prevY
		const fpright = frog.prevX + fwidth
		const fpleft = frog.prevX

		for (const square of grid.values()) {

			if (!square.alive) continue

			const stop = square.y
			const sbottom = stop + sheight*SQUARE_SCALE
			const sleft = square.x
			const sright = sleft + swidth*SQUARE_SCALE

			if (frog.dx > 0 && ((ftop < sbottom && ftop > stop) || (fbottom < sbottom && fbottom > stop) ) && fpright < sleft && fright >= sleft) {
				square.alive = false
				frog.dx = Math.abs(frog.dx) * -1 * FROG_BOOST
				frog.x = sleft - fwidth
				frog.sx += FROG_SQUISH * Math.abs(frog.dx)
				break
			}

			if (frog.dy > 0 && ((fleft < sright && fleft > sleft) || (fright < sright && fright > sleft) || (fmidx < sright && fmidx > sleft)) && fpbottom < stop && fbottom >= stop) {
				square.alive = false
				frog.dy = Math.abs(frog.dy) * -1 * FROG_BOOST
				frog.y = stop - fheight
				frog.sy += FROG_SQUISH * Math.abs(frog.dy)
				break
			}
			
			if (frog.dx < 0 && ((ftop < sbottom && ftop > stop) || (fbottom < sbottom && fbottom > stop) ) && fpleft > sright && fleft <= sright) {
				square.alive = false
				frog.dx = Math.abs(frog.dx) * 1 * FROG_BOOST
				frog.x = sright
				frog.sx += FROG_SQUISH * Math.abs(frog.dx)
				break
			}
			

			if (frog.dy < 0 && ((fleft < sright && fleft > sleft) || (fright < sright && fright > sleft) || (fmidx < sright && fmidx > sleft)) && fptop > sbottom && ftop <= sbottom) {
				square.alive = false
				frog.dy = Math.abs(frog.dy) * 1 * FROG_BOOST
				frog.y = sbottom
				frog.sy += FROG_SQUISH * Math.abs(frog.dy)
				break
			}

		}

		if (frog.dx > FROG_MAX_SPEED) frog.dx = FROG_MAX_SPEED
		if (frog.dx < -FROG_MAX_SPEED) frog.dx = -FROG_MAX_SPEED
		
		if (frog.dy > FROG_MAX_SPEED) frog.dy = FROG_MAX_SPEED
		if (frog.dy < -FROG_MAX_SPEED) frog.dy = -FROG_MAX_SPEED

		frog.prevX = frog.x
		frog.prevY = frog.y

		frog.prevAbove = frog.y + red.height * FROG_SCALE * (1-frog.sy) < ptop

		if (frog.sx > 1) frog.sx = 0.5
		if (frog.sy > 1) frog.sy = 0.5

		fheight = red.height * FROG_SCALE * (1-frog.sy)
		fwidth = red.width * FROG_SCALE * (1-frog.sx)
		
		context.drawImage(red, frog.x, frog.y, fwidth, fheight)

		// Square
		context.fillStyle = Colour.Grey
		let winner = true
		for (const square of grid.values()) {
			if (!square.alive) continue
			winner = false
			context.fillRect(square.x, square.y, swidth * SQUARE_SCALE, sheight * SQUARE_SCALE)
		}

		if (winner && window.won === undefined) {
			won = true
			alert("You WIN! As a prize, you can join the secret TodePond discord server!")

			// WAIT wait wait, you can't just come snooping in the source code for the invite link!
			// That's cheating!
			// I'm kidding. You also win because you put in enough effort to look at the source code!
			// Well done!
			window.location.href = "https://discord.gg/AYDXBVPAzz"
		}

	}

})
