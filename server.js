var express = require('express');
var app = express();
const cors = require('cors');
var bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');
let upcommingMovies = [];
let favoriteMovies = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.options('*', cors());

var port = process.env.PORT || 8080;
var router = express.Router();

app.use('/api', router);


router.get('/', (req, res) => {
  res.json({ data: "Welcome" });
});

const getupcommingMovies = async () => {
  const resp = await axios.get('https://api.themoviedb.org/3/movie/popular?api_key=0c1e8da2e9c9c27817279e3d01152994&language=en-US&page=1')
  upcommingMovies = resp.data.results.map(item => {
    item.favorite = false;
    return item;
  });
  return upcommingMovies;
}

const getMovieDetails = async (movieId) => {
  return await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=0c1e8da2e9c9c27817279e3d01152994&language=en-US`);
}

router.get('/upcommingMovies', async (req, res) => {
  if(upcommingMovies.length < 1){
    await getupcommingMovies()
  }
  res.json({ results: upcommingMovies , message: 'Listed Successfully' });
});

router.get('/upcommingMovies/:movieId', async (req, res) => {
  if(upcommingMovies.length < 1){
    await getupcommingMovies()
  }
  const { movieId } = req.params;
  const { data } = await getMovieDetails(movieId);
  upcommingMovies.map(item => {
    if (item.id == movieId) {
      data.favorite = item.favorite;
    }
  })
  return res.json({ result: data, message: 'Movie Details listed' });
})

router.post('/favorites', async (req, res) => {
  if(upcommingMovies.length < 1){
    await getupcommingMovies()
  }
  const { movieId } = req.body;
  const { data } = await getMovieDetails(movieId);
  data.favorite = true;
  const favMovieresp = favoriteMovies.filter(item => item.id === movieId);
  const selMovie = upcommingMovies.filter(item => item.id === movieId)[0]
  if ((favMovieresp.length < 1) && selMovie) {
    selMovie.favorite = true;
    favoriteMovies.push(selMovie);
  }
  if(!selMovie){
    return res.status(422).json({message: 'Failed to add favorite'});
  }
  return res.status(200).json({ result: data, message: 'Favorite added.' });
});

router.get('/favorites', async (req, res) => {
  return res.json({ result: favoriteMovies, message: 'Favorites Listed.' });
})



app.listen(port);
console.log('Server started at: localhost:' + port);
