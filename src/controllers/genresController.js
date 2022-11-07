const db = require('../database/models');
const sequelize = db.sequelize;


const genresController = {
    list: async (req, res) => {
/*         db.Genre.findAll()
            .then(genres => {
                res.render('genresList.ejs', {genres})
            }) */
            
            try{

                let {order = 'id'} = req.query;
                let orders = ['id','name','ranking']

                if (!orders.includes(order)) {     
                    throw new Error(`El campo ${order} no existe!, Campos admitidos [name, ranking]`)
                }
                

                let genres = await db.Genre.findAll({
                    order: [order],
                    attributes : {
                        exclide :['creaated_at', 'update_at']
                    }
                })
                if(genres.length){
                    return res.status(200).json({
                        ok : true,
                        meta : {
                            total : genres.length
                        },
                        data: genres
                    })
                }
                throw new Error({
                    ok : false,
                    msg : 'Upss, hubo un error'
                })
            } catch ( error) {
                console.log(error)
                return res.status(500).json({
                    ok : false,
                    msg : error.message ? error.message : 'comuniquese con el admin'
                })
            }
    },
    detail: async (req, res) => {
        /*  db.Genre.findByPk(req.params.id)
            .then(genre => {
                res.render('genresDetail.ejs', {genre});
            }); */
            try {

                const {id} = req.params;

                if (isNan(id)) {
                    throw new Error({
                        ok : false,
                        msg : 'El id debe ser un numero'
                    })
                }

                let genre = await db.Genres.findByPk(req.params.id, {
                    attributes : {
                        exclide :['creaated_at', 'update_at']
                    }
                });
                if(genre){
                    return res.status(200).json({
                        ok : true,
                        meta : {
                            status : 200,
                            total : genres.length
                        },
                        data: genre
                    })
                }
                throw new Error({
                    ok : false,
                    msg : 'No se encuentra el genero'
                })
                
            } catch (error) {
                console.log(error)
                return res.status(500).json({
                    ok : false,
                    msg : error.message ? error.message : 'comuniquese con el admin'
                })

            }
    }

}

module.exports = genresController;