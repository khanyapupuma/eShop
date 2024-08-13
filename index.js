import express from 'express'
import path from 'path'
import { connection as db } from './config/index.js'
import { createToken } from './middleware/AuthenticateUser.js'
import { compare, hash } from 'bcrypt'
import bodyParser from 'body-parser'
//Create an Express app
const app = express()
const port = +process.env.PORT || 4000
const router = express.Router()
//Middleware
app.use(
router,
express.static('./static'),
express.json(),
express.urlencoded({
    extended: true
})
)
router.use(bodyParser.json())
//End point
router.get('^/$|/eShop', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})
//Users display
router.get('/users', (req, res) => {
    try {
        const strQry = `
        SELECT firstName, lastName, age, emailAdd, pwd
        FROM Users;
        `
        db.query(strQry, (err, results) => {
            if (err) throw new Error('Issue occured fetching users.')
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
//Make one user display
router.get('/user/:id', (req, res) => {
    try {
        const strQry = `
        SELECT userID, firstName, lastName, age, emailAdd, userRole, userURL
        FROM Users
        WHERE userID = ${req.params.id};
        `
        db.query(strQry, (err, result) => {
            if (err) throw new Error('Issue occured fetching user.')
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
//Registering a user
router.post('/register', async(req,res) => {
    try {
        let data = req.body
            data.pwd = await hash(data.pwd, 12 )
            // Payload
            let user = {
                emailAdd: data.emailAdd,
                pwd: data.pwd
            }
            let strQry = `INSERT INTO Users
                SET ?`;
        db.query(strQry,[data], (err) => {
            if (err) {
                res.json({
                   status: res.statusCode,
                   msg: err
                })
            } else {
                const token = createToken(user)
                res.json({
                    token,
                    msg: 'Successfully registered'
                })
            }
        })
    } catch (e) {
        console.errow(e)
        res.status(500).json({
            msg: 'An error occured during registration'
        })
    }
 })
//Updating a user
router.patch('/user/:id', async (req, res) => {
    try {
        let data = req.body
        if (data.pwd) {
            data.pwd = await hash(data.pwd, 12)
        }
        const strQry = `
        UPDATE Users
        SET ?
        WHERE userID = ${req.params.id}
        `
        db.query(strQry, [data], (err) => {
            if (err) throw new Error ('Unable to update a user')
                res.json({
            status: res.statusCode,
            msg: 'The user\'s record was updated'
                });
        });
    } catch (e) {
        res.json({
            status: 400,
            msg: e.message,
        });
    }
});
//Deleting a user
router.delete('/user/:id', (req, res) => {
    try {
        const strQry = `
        DELETE FROM Users
        WHERE userID = ${req.params.id};
        `
        db.query(strQry, (err) => {
            if (err) throw new Error('To delete a user, please review your delete query.')
                res.json({
            status: res.statusCode,
        msg: 'A user\'s information was removed.'})
        })
    } catch (e) {
        res.json({
            status: 404,
            msg: e.message
        })
    }
})
//Logging
router.post('/login', (req, res) => {
    try {
        const { emailAdd, pwd } = req.body
        const strQry = `
        SELECT userID, firstName, lastName, age, emailAdd, pwd, userRole, userURL
        FROM Users
        WHERE emailAdd = '${emailAdd}';
        `
        db.query(strQry, async (err, result) => {
            if (err) throw new Error('To login, please review your query.')
                if (!result?.length) {
                    res.json({
                        status: 401,
                        msg: 'You provided a wrong email.'
                    })
                } else {
                    const isValid = await compare (pwd, result [0].pwd)
                    if (isValid) {
                        const token = createToken({
                            emailAdd,
                            pwd
                        })
                        res.json({
                            status: res.statusCode,
                            token,
                            result: result[0]
                        })
                    } else {
                        res.json({
                            status: 401,
                            msg: 'Invalid password or you have not been registered.'
                        })
                    }
                }
        })
    } catch (e) {
        res.json({
            status: 404,
            msg: e.message
        })
    }
})
//Specify anything without clear path to throw error
router.get('*', (req, res) => {
    res.json({
        status: 404,
        msg: 'Resource not found'
    })
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
})