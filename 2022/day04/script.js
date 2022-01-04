
const blue = document.createElement("img")
blue.src = "blue.png"

const state = {
	grid: new Map(),
	mouse: {prevX: undefined, prevY: undefined}
}

const makeCell = ({dx = 0, dy = 0, x, y, key = getKey(x, y), needsUpdate = true} = {}) => {
	return {dx, dy, x, y, key, needsUpdate, neighbours: []}
}

const getKey = (x, y) => `${x},${y}`
const getPosition = (key) => key.split(",").map(n => parseInt(n))

const NEIGHBOURS = [
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1],
	[0, -1],
	[1, -1],
]

const linkNeighbours = (cell) => {
	for (let i = 0; i < NEIGHBOURS.length; i++) {
		const n = NEIGHBOURS[i]
		const [nx, ny] = n
		const nkey = getKey(cell.x + nx, cell.y + ny)
		const neighbour = state.grid.get(nkey)
		cell.neighbours[i] = neighbour
	}
}

const GRID_SIZE = 20
const INNER_SCALE = 0.5
const DRAG_SPEED = 0.05
const FLOW_TRANSFER = 0.03
const DECAY = 0.95

// Make grid
for (let x = 0; x < GRID_SIZE; x++) {
	for (let y = 0; y < GRID_SIZE; y++) {
		const cell = makeCell({x, y})
		state.grid.set(cell.key, cell)
	}
}

// Link neighbours
for (const cell of state.grid.values()) {
	linkNeighbours(cell)
}

on.load(() => {
	const show = Show.start({overload: 1, paused: false})
	const {context, canvas} = show

	

	on.mousemove((e) => {

		if (state.mouse.prevX === undefined) {
			state.mouse.prevX = e.clientX
			state.mouse.prevY = e.clientY
			return
		}

		const width = canvas.width / GRID_SIZE
		const height = canvas.height / GRID_SIZE
		const x = Math.floor(e.clientX / width)
		const y = Math.floor(e.clientY / height)
		const cell = state.grid.get(getKey(x, y))

		const dx = e.clientX - state.mouse.prevX
		const dy = e.clientY - state.mouse.prevY

		cell.dx += dx * DRAG_SPEED
		cell.dy += dy * DRAG_SPEED
		for (const axis of ["dx", "dy"]) {
			if (cell[axis] > 1.0) cell[axis] = 1.0
			if (cell[axis] <= -1.0) cell[axis] = -1.0
		}
		
		state.mouse.prevX = e.clientX
		state.mouse.prevY = e.clientY
	})

	show.tick = () => {

		for (const cell of state.grid.values()) {

			for (const axis of ["dx", "dy"]) {
				if (cell[axis] !== 0) {
					cell[axis] *= DECAY
					cell.needsUpdate = true

				}
			}
			

			for (let i = 0; i < NEIGHBOURS.length; i++) {
				const N = NEIGHBOURS[i]
				const [NX, NY] = N

				const neighbour = cell.neighbours[i]
				if (neighbour === undefined) continue

				if (cell.dx > 0 && NX > 0) {
					neighbour.dx += cell.dx	* FLOW_TRANSFER
				}
				
				else if (cell.dx < 0 && NX < 0) {
					neighbour.dx += cell.dx	* FLOW_TRANSFER
				}
				
				else if (cell.dy < 0 && NY < 0) {
					neighbour.dy += cell.dy	* FLOW_TRANSFER
				}
				
				else if (cell.dy > 0 && NY > 0) {
					neighbour.dy += cell.dy	* FLOW_TRANSFER
					
				}
				
				for (const axis of ["dx", "dy"]) {
					if (neighbour[axis] > 1.0) neighbour[axis] = 1.0
					if (neighbour[axis] <= -1.0) neighbour[axis] = -1.0
				}

			}
			
			if (!cell.needsUpdate) continue
			drawCell(cell)
			cell.needsUpdate = false
		}
	}

	const drawCell = (cell) => {
		
		const width = canvas.width / GRID_SIZE
		const height = canvas.height / GRID_SIZE

		const x = cell.x * width
		const y = cell.y * height

		const innerWidth = width*INNER_SCALE
		const innerHeight = height*INNER_SCALE

		const centerx = x + innerWidth/2
		const centery = y + innerHeight/2

		const movementx = centerx + innerWidth/2 * cell.dx
		const movementy = centery + innerHeight/2 * cell.dy

		context.fillStyle = Colour.Black
		context.fillRect(x, y, width, height)

		context.fillStyle = Colour.Blue
		context.drawImage(blue, movementx, movementy, width*INNER_SCALE, height * INNER_SCALE)
		//context.fillRect(movementx, movementy, width*INNER_SCALE, height * INNER_SCALE)
	}

})
