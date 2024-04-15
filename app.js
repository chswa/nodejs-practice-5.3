const express=require('express')
const app = express()
const sqlite3 = require('sqlite3')
const path = require('path')
const {open} = require('sqlite')
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null
const initilizeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})

    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

initilizeDBAndServer()

//get movie names

app.get('/movies/', async (request, response) => {
  const getMovieNamesQuery = `SELECT movie_name FROM movie `

  const movieNamesArray = await db.all(getMovieNamesQuery)

  response.send(
    movieNamesArray.map(eachMovie => {
      return {movieName: eachMovie.movie_name}
    }),
  )
})

//create new movie

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}')`
  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//get movie

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getmovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`

  const movie = await db.get(getmovieQuery)
  response.send(movie)
})

//update movie

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const updateMovieQuery = `UPDATE movie SET director_id=${directorId}, movie_name='${movieName}', lead_actor='${leadActor}' WHERE movie_id=${movieId}`
  await db.run(updateMovieQuery)
  response.send('MovieDetails Updated')
})

//delete movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId}`

  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//get directors

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`

  const dbResponse = await db.all(getDirectorsQuery)

  response.send(dbResponse)
})

//get director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId}`
  const dbResponse = await db.all(getDirectorQuery)

  response.send(
    dbResponse.map(eachMovie => {
      return {movieName: eachMovie.movie_name}
    }),
  )
})

