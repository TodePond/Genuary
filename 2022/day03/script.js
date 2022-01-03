
const frog = document.createElement("img")
frog.src = "frog.png"

const makePlanet = ({source, distance = 0.0, movementSpeed = 0.1, rotationSpeed = 0.1, scale = 1.0, planets = [], position = 0, rotation = 0} = {}) => {
	const image = document.createElement("img")
	image.src = source
	return {image, source, distance, movementSpeed, rotationSpeed, scale, position, rotation, planets}
}

const state = {
	sun: makePlanet({
		source: "sun.png",
		distance: 4000.0,
		scale: 0.5,
		rotationSpeed: 0.004,
		movementSpeed: -0.001,
		planets: [

			makePlanet({
				source: "pink.png",
				scale: 0.1,
				distance: 150.0,
				movementSpeed: 0.03,
				rotationSpeed: -0.05,
			}),
		
			makePlanet({
				source: "orange.png",
				scale: 0.2,
				distance: 300.0,
				movementSpeed: 0.02,
				rotationSpeed: -0.04,
			}),
		
			makePlanet({
				source: "blue.png",
				scale: 0.22,
				distance: 450.0,
				movementSpeed: 0.01,
				rotationSpeed: -0.02,
				planets: [
					
					makePlanet({
						source: "grey.png",
						distance: 80,
						scale: 0.1
					}),

				]

			}),
		
			makePlanet({
				source: "red.png",
				scale: 0.18,
				distance: 700.0,
				movementSpeed: 0.015,
				rotationSpeed: -0.03,
				planets: [
					
					makePlanet({
						source: "red.png",
						distance: 90,
						scale: 0.09,
						rotationSpeed: 0.01,
						movementSpeed: 0.05,
					}),
					
					makePlanet({
						source: "grey.png",
						distance: 70,
						scale: 0.08,
						rotationSpeed: 0.1,
						movementSpeed: 0.05,
						position: 2,
					}),

				]

			}),
		
			makePlanet({
				source: "green.png",
				scale: 0.4,
				distance: 1200.0,
				movementSpeed: 0.001,
				rotationSpeed: -0.03,
				planets: [
					
					makePlanet({
						source: "green.png",
						distance: 300,
						scale: 0.3,
						rotationSpeed: 0.05,
						movementSpeed: 0.06,
						planets: [
					
							makePlanet({
								source: "green.png",
								distance: 150,
								scale: 0.2,
								rotationSpeed: -0.05,
								movementSpeed: -0.1,
		
							}),
		
						]
					}),

				]
				
			}),

			makePlanet({
				source: "grey.png",
				scale: 0.2,
				distance: 1600.0,
				movementSpeed: 0.025,
				rotationSpeed: 0.025,
				rotation: 3*Math.PI/2,
			}),

			makePlanet({
				source: "grey.png",
				scale: 0.25,
				distance: 1600.0,
				movementSpeed: 0.025,
				rotationSpeed: 0.025,
				rotation: 3*Math.PI/2,
				position: 5 * Math.PI / 180,
			}),

			makePlanet({
				source: "grey.png",
				scale: 0.3,
				distance: 1600.0,
				movementSpeed: 0.025,
				rotationSpeed: 0.025,
				rotation: 3*Math.PI/2,
				position: 10 * Math.PI / 180,
			}),
		]
	}),
	scale: 5.0,
	dscale: 0.999,
}


const scalePlanets = (planets, scale) => planets.map(p => ({
	...p,
	scale: p.scale * scale,
	distance: p.distance * scale,
	planets: scalePlanets(p.planets),
}))

state.supersun = makePlanet({
	source: "white.png",
	scale: 2.0,
	rotationSpeed: -0.001,
	planets: [
		state.sun,
		{
			...state.sun,
			position: 90 * Math.PI / 180,
			distance: state.sun.distance * 2.5,
			movementSpeed: state.sun.movementSpeed * 10,
			rotationSpeed: 	state.sun.rotationSpeed * 0.7,
			scale: state.sun.scale * 2.5,
			planets: scalePlanets(state.sun.planets, 2.5),
		},
		{
			...state.sun,
			position: 90 * Math.PI / 180,
			scale: state.sun.scale * 0.3,
			distance: state.sun.distance * 0.4,
			movementSpeed: state.sun.movementSpeed * 15,
			rotationSpeed: 	state.sun.rotationSpeed * 25,
			planets: scalePlanets(state.sun.planets, 0.3),
		},
		{
			...state.sun,
			position: 90 * Math.PI / 180,
			distance: state.sun.distance * 5,
			movementSpeed: state.sun.movementSpeed * 0.1,
			rotationSpeed: 	state.sun.rotationSpeed * 0.2,
			scale: state.sun.scale * 10,
			planets: scalePlanets(state.sun.planets, 5),
		},
	],
})

on.load(() => {
	
	const show = Show.start({overload: 1, paused: true})
	const {context, canvas} = show

	const tickPlanet = (planet) => {
		
		planet.rotation += planet.rotationSpeed
		planet.position += planet.movementSpeed

		const width = planet.image.width * planet.scale
		const height = planet.image.height * planet.scale

		const x = planet.distance * Math.cos(planet.position)
		const y = planet.distance * Math.sin(planet.position)

		context.save()



		context.translate(x, y)
		context.rotate(planet.rotation)
		context.drawImage(planet.image, -width/2, -height/2, width, height)

		for (const p of planet.planets) {
			tickPlanet(p)
		}

		context.restore()

	}

	context.fillStyle = Colour.Black
	show.tick = () => {

		context.save()
		context.fillRect(0, 0, canvas.width, canvas.height)

		// Zoom
		context.translate(canvas.width/2, canvas.height/2)
		context.scale(state.scale, state.scale)
		
		const x = state.sun.distance * Math.cos(state.sun.position + state.supersun.rotation)
		const y = state.sun.distance * Math.sin(state.sun.position + state.supersun.rotation)
		context.translate(-x, -y)

		tickPlanet(state.supersun)


		context.restore()

		state.scale *= state.dscale
	}

	show.tick()
	
})