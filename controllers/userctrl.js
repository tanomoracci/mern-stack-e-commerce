const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body

            let user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: 'The mail is already registered'})

            if (password.length < 6) return res.status(400).json({msg: "Password must contain at least 6 characters"})
            
            // Password encryption
            const passwordHash = await bcrypt.hash(password, 10)    
            const newUser = new Users({name, email, password: passwordHash})
            await newUser.save()

            // Create the JWT
            const accessToken = createAccessToken({id: newUser._id})
            const refreshToken = createRefreshToken({id: newUser._id})

            res.cookie('refreshToken', refreshToken, {
                hhtpOnly: true, 
                path: '/user/refresh_token'
            })

            res.json(accessToken)

        } catch (err){
            return res.status(500).json({msg: err.message})
        }
    }
}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userCtrl