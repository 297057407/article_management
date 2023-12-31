const db = require('../db/index')
const bcrypt = require('bcryptjs')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const config = require('../confg')

const dbQuery = promisify(db.query).bind(db)

// 注册处理函数
exports.reguser = async (req, res) => {
    //req.body :{ username: 'user123', password: '111111' }
    const userinfo = req.body
    // 唯一性校验
    const sqlStr = 'select * from en_users where username = ?'
    try {
        const data = await dbQuery(sqlStr, userinfo.username)
        //查询到行数据包：[ RowDataPacket {
        //     id: 1,
        //     username: 'user123',
        //     password: '$2a$10$hjOvlgBbnKbiDCd.ldjCceSfTWWEq4EX.hBkM2mnt9ROUosO7A/Lu',
        //     nickname: null,
        //     email: null,
        //     user_pic: null
        //   }] 如果没有数据则为[]
        if (data.length > 0) {
            return res.cc('用户名已被占用')
        }
    } catch (e) {
        return res.cc(e)
    }
    // 注册用户
    const sqlInsert = 'insert into en_users set ?'

    // 密码加密入库
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)

    try {
        const data = await dbQuery(sqlInsert, { username: userinfo.username, password: userinfo.password })
        //影响的行数不是1就注册失败
        if (data.affectedRows !== 1) {
            return res.cc('注册用户失败，请稍后重试')
        }
        res.cc('注册用户成功', 0)
    } catch (e) {
        return res.cc(e)
    }
}

// 登录处理函数
exports.login = async (req, res) => {
    const userinfo = req.body
    const sqlStr = 'select * from en_users where username = ?'

    let result = [];
    try {
        result = await dbQuery(sqlStr, userinfo.username)
        if (result.length !== 1) {
            return res.cc('登录失败')
        }
    } catch (e) {
        return res.cc(e)
    }

    const compareResult = bcrypt.compareSync(userinfo.password, result[0].password)
    //比较结果不同则登录失败
    if (!compareResult) {
        return res.cc('登录失败')
    }

    const user = { ...result[0], password: null, user_pic: null }

    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })

    res.send({
        status: 0,
        message: '登录成功',
        token: 'Bearer ' + tokenStr
    })
}