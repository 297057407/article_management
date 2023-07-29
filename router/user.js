const express = require('express')

const router = express.Router()

const userHandler = require('../router_handler/user')

const expressJOI = require('@escook/express-joi')
const {reg_login_schema} = require('../schema/user')
//expressJOI(reg_login_schema) 为验证规则
router.post('/reguser', expressJOI(reg_login_schema), userHandler.reguser)

router.post('/login', expressJOI(reg_login_schema), userHandler.login)

module.exports = router