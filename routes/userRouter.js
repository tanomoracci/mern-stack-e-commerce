const router = require('express').Router()
const userCtrl = require('../controllers/userctrl')


router.post('/register', userCtrl.register)

module.exports = router