const Category = require('../models/categoryModel')

const categoryCtrl = {

    getCategories: async (req, res) => {
        try {
            const categories = await Category.find()
            return res.status(200).json(categories)
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    createCategory: async (req, res) => {
        try {
            //Only admins can create, modify or delete categories
            const {name} = req.body
            const category = await Category.findOne({name})
            if(category) return res.status(400).json({msg: 'This category already exists'})

            const newCategory = new Category({name})
            await newCategory.save()
            res.json({msg: 'New category created'})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    deleteCategory: async (req, res) => {
        try {
            await Category.findByIdAndDelete(req.params.id)
            res.json({msg: 'Category deleted'})
        } catch (error) {
            return res.status(500).json({msg: error.message})

        }
    },
    updateCategory: async (req, res) => {
        try {
            const {name} = req.body
            await Category.findOneAndUpdate({_id: req.params.id}, {name})
            res.json({msg: 'Category Updated'})
        } catch (error) {
            return res.status(500).json({msg: error.message})

        }
    }

}

module.exports = categoryCtrl