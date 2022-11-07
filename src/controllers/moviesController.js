const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    list: async (req, res) => {
        /*         db.Movie.findAll({
                    include: ['genre']
                })
                    .then(movies => {
                        res.render('moviesList.ejs', {movies})
                    }) */

        try {

            let { order = 'id' } = req.query;
            let orders = ['id', 'tittle', 'rating', 'release_date']

            if (!orders.includes(order)) {
                throw new Error(`El campo ${order} no existe!, Campos admitidos [tittle, rating, awards, release_date]`)
            };


            let movies = await db.Movie.findAll({
                include: [{
                    association: 'genre',
                    attributes: ['name']
                }],
                order: [order],
                attributes: {
                    exclide: ['creaated_at', 'update_at']
                }
            })
            if (movies.length) {
                return res.status(200).json({
                    ok: true,
                    meta: {
                        total: movies.length
                    },
                    data: movies
                })
            }
            throw new Error('Upps, no hay peliculas')

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                msg: error.message ? error.message : 'comuniquese con el admin'
            })
        }
    },
    detail: async (req, res) => {
        /*         db.Movie.findByPk(req.params.id,
                    {
                        include : ['genre']
                    })
                    .then(movie => {
                        res.render('moviesDetail.ejs', {movie});
                    }); */
        try {
            let error;
            if (isNaN(req.params.id)) {
                error = new Error('El ID debe ser un numero');
                error.status = 404;
                throw error;
            }

            let movie = await db.Movie.findByPk(req.params.id, {
                include: [{
                    all: true
                }]
            });

            if (movie) {
                return res.status(200).json({
                    ok: true,
                    meta: {
                        total: 1
                    },
                    data: movie
                });
            };
            error = new Error('Upps, no existe');
            error.status = 403;
            throw error;

        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'comuniquese con el admin'
            })
        }

    },
    newest: async (req, res) => {

        try {

            let movies = await db.Movie.findAll({
                order: [
                    ['release_date', 'DESC']
                ],
                limit: +req.query.limit || 5
            });
            if (movies.length) {
                return res.status(200).json({
                    ok: true,
                    meta: {
                        total: movies.length
                    },
                    data: movies
                })
            };
            error = new Error('Upps, no hay peliculas');
            error.status = 403;
            throw error;

        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'comuniquese con el admin'
            })

        }

    },
    recomended: async (req, res) => {
        let error;
        try {
            let movies = await db.Movie.findAll({
                include: ['genre'],
                limit: +req.query.limit || 5,
                where: {
                    rating: { [db.Sequelize.Op.gte]: req.query.rating || 8 }
                },
                order: [
                    ['rating', 'DESC']
                ]
            })
            if (movies.length) {
                return res.status(200).json({
                    ok: true,
                    meta: {
                        total: movies.length
                    },
                    data: movies
                })
            };
            error = new Error('Upps, no hay peliculas');
            error.status = 403;
            throw error;

        } catch (error) {

            console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'comuniquese con el admin'
            })
        }


    },
    //Aqui dispongo las rutas para trabajar con el CRUD
   /*  add: function (req, res) {
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();

        Promise
            .all([promGenres, promActors])
            .then(([allGenres, allActors]) => {
                return res.render(path.resolve(__dirname, '..', 'views', 'moviesAdd'), { allGenres, allActors })
            })
            .catch(error => res.send(error))
    }, */
    create: async (req, res) => {
        const {title,rating,awards,recomended,release_date,length,genre_id} = req.body
        try {
           let  newMovie = await db.Movie.create(
                {
                    title: title && title.trim(),
                    rating: rating,
                    awards: awards,
                    release_date: release_date,
                    length: length,
                    genre_id: genre_id
                }
            )
            if (newMovie) {
                return res.status(200).json({
                    ok: true,
                    meta: {
                        total: 1,
                        url : `${req.protocol}://${req.get('host')}/movies/${newMovie.id}`
                    },
                    data: newMovie
                })
            };
        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'comuniquese con el admin'
            })
        }
        
    },
    /* edit: function (req, res) {
        let movieId = req.params.id;
        let promMovies = Movies.findByPk(movieId, { include: ['genre', 'actors'] });
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();
        Promise
            .all([promMovies, promGenres, promActors])
            .then(([Movie, allGenres, allActors]) => {
                Movie.release_date = moment(Movie.release_date).format('L');
                return res.render(path.resolve(__dirname, '..', 'views', 'moviesEdit'), { Movie, allGenres, allActors })
            })
            .catch(error => res.send(error))
    }, */
    update: async (req,res) => {
        try {
            let movieId = req.params.id;
            const movie = await db.Movie.update(
                {
                    title: req.body.title,
                    rating: req.body.rating,
                    awards: req.body.awards,
                    release_date: req.body.release_date,
                    length: req.body.length,
                    genre_id: req.body.genre_id
                },
                {
                    where: {id: movieId}
                })
            if (movie) {
                return res.status(200).json({
                    ok:true,
                    meta: {
                        total: 1
                    },
                    data: movie
                })
            }      

            } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'Comuníquese con el administrador del sitio'
            })
        }
        
    },
    /* delete: function (req, res) {
        let movieId = req.params.id;
        Movies
            .findByPk(movieId)
            .then(Movie => {
                return res.render(path.resolve(__dirname, '..', 'views', 'moviesDelete'), { Movie })
            })
            .catch(error => res.send(error))
    }, */
    destroy: async (req,res) => {
        try {
            let movieId = req.params.id;
            const movie = db.Movie.destroy({
                where: {id: movieId}, 
                force: true          // force: true es para asegurar que se ejecute la acción
            }) 
            if (movie) {
                return res.status(200).json({
                    ok:true,
                    meta: {
                        total: 1
                    },
                    data: movie
                })
            }
            
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'Comuníquese con el administrador del sitio'
            })
        }
    }
}

module.exports = moviesController;