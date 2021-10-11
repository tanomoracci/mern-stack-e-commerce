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
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body
            
            const user = await Users.findOne({email})
            if (!user) return res.status(400).json({msg: 'User does not exist'})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: 'User or password is incorrect'})

            const accessToken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshToken', refreshToken, {
                hhtpOnly: true, 
                path: '/user/refresh_token'
            })

            res.json(accessToken)


        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshToken', {path: '/user/refresh_token'})
            return res.json({msg: 'User Logged out'})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    refreshToken: (req, res) => {
        console.log('entro')
        try {
            const rf_token = req.cookies.refreshToken;

            if(!rf_token) return res.status(400).json({msg: 'Please Login or Register'})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({msg: 'Please Login or Register'}) 

                const accessToken = createAccessToken({id: user._id})
                
                res.json({accessToken})
            })

        } catch (error) {
            return res.status(500).json({msg: error.message})
        }

    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')
            if(!user) return res.status(400).json({msg: 'User does not exist'})
            res.json({user})

        } catch (error) {
            return res.status(500).json({msg: error.message})
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