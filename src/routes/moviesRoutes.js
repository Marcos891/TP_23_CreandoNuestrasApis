const express = require('express');
const router = express.Router();
const {list, detail, newest, recomended, create, update, destroy} = require('../controllers/moviesController');

router.get('/movies', list);
router.get('/movies/new', newest);
router.get('/movies/recommended', recomended);
router.get('/movies/:id', detail);
//Rutas exigidas para la creación del CRUD
/* router.get('/movies/add', add);
 */
router.post('/movies', create);
/* router.get('/movies/edit/:id', edit);
 */
router.put('/movies/:id', update);
/* router.get('/movies/delete/:id', delete);
 */
router.delete('/movies/:id', destroy);

module.exports = router;