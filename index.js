import express from 'express';
import path from 'path';
import {connection as db} from './config/index.js'
import { createToken } from './middleware/AuthenticateUser.js'
import {hash} from 'bcryt'
import bodyParser from 'body-parser';
// Create an express app
const app = express()
const port = +process.env.PORT
const router = express.Router()
// Middleware  
app.use(router, 
    express.static('./static'),
    express.json(),
    express.urlencoded({extended: true}))
// Endpoint
router.use(bodyParser.json())
router.get('^/$|/eShop', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})
router.get('/users', (req, res) =>{
    try {
        const strQry = `
        SELECT firstName, lastName, age, emailAdd
        FROM Users;
        `
        db.query(strQry, (err, results) => {
            if (err) throw new Error ('Unable to fetch all users')
                res.json({
            status: res.statusCode,
            results
            })
        })
    } catch (e) {
        res.json({
            status: 404,
            msg: e.message
        })
    }
})
app.listen(port, () => {
    console.log(`Serve is running on ${port}`);
})
router.get('/user/:id', (req, res) => {
    try {
        const strQry = `
        SELECT firstName, lastName, age, emailAdd
        FROM Users;
        `
        db.query(strQry, (err, results) => {
            if (err) throw new Error ('Issue when retrieving a single user')
                res.json({
            status: res.statusCode,
            result: result[0]
            })
        })
    } catch (e) {
        res.json({
            status: 404,
            msg: e.message
        })
    }
})
router.post('/register' ,async (req, res) => {
    try{

    } catch (e){
        let data = req.body
        if(data.pwd){
            data.pwd = await hash(data.pwd, 12)
        }
    }
    //Patload
    let user = {emailAdd: data.emailAdd}
})
router.get('*', (req, res) => {
    res.json({
        status: 404,
        msg: 'Resource not found    '
    })
})
let strQry = `INSERT INTO USERS VALUES?;`
//Payload
let user = {
    emailAdd: data.emailAdd,
    pwd: data.pwd
}

 db.query(strQry, [data], (err) => {
    if (err){
        res.json({
            status: res.statusCode,
            msg:'This email has already been taken'
        })
    }
    else{
        const token = createToken(user)
        res.json({
            token,
            msg: 'You are now registered.'
        })
    }
 })
 router.patch('./user/:id', async (req, res) => {
    try{

        let data = req.body
        if (data.pwd){
            data.pwd = await hash(data.pwd, 12)
        }
        const strQry = `
        UPDATE Users
        SET ?
        WHERE userID = ${req.params.id}`

        db.query(strQry,[data], (err) =>{
            if (err) throw new Error('Unable to update new user')
                res.json({
            status: res.statusCode,
            msg: 'The user record was updated'
            })
        })
    } catch (e) {
        res.json({
            status: 400,
            msg: e.message
        })
    }
 })
 router.get('*')