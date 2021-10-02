const Users = require('../models/userModel')

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: 'The mail is already registered'})
            const user = {
                name, 
                email,
                password
            }
            

        } catch (err){
            return res.status(500).json({msg: err.message})
        }
    }
}


module.exports = userCtrl