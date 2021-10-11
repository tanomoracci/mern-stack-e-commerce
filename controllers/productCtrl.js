const Products = require('../models/productModel')

class APIfeatures {
    constructor(query, queryString){
        this.query = query
        this.queryString = queryString
    }
    filtering() {
        const queryObj = {...this.queryString}
        const excludedFields = ['page', 'sort', 'limit']
        excludedFields.forEach(el => delete(queryObj[el]))

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt\regex)\b/g, match => '$' + match)

        this.query.find(JSON.parse(queryStr))

    }

    sorting(){}

    paginating(){

    }
}

const productCtrl =  {

    getProducts: async (req, res) => {
        try {
            const features = new APIfeatures(Products.find(), req.query).filtering()
            const products = await features.query

            res.status(200).json({products})
        }catch (err) {
           return res.status(500).json({msg: err.message})
        }
    },
    
    createProduct: async (req, res) => {
        try {
            const {product_id, title, description, price, content, images, category} = req.body
            if(!images) return res.status(400).json({msg: 'No images uploaded'})

            const product = await Products.findOne({product_id})
            if (product) return res.status(400).json({msg: 'Product already exists'})

            const newProduct = new Products({
                product_id, title, description, price, content, images, category
            })
            await newProduct.save()
            res.status(201).json({msg: 'The product has been created'})
        }catch (err) {
           return res.status(500).json({msg: err.message})
        }
    },
    deleteProduct: async (req, res) => {
        try {
            await Products.findByIdAndDelete(req.params.id)
            res.json({msg: 'Product deleted'})
        }catch (err) {
           return res.status(500).json({msg: err.message})
        }
    },
    uploadProduct: async (req, res) => {
        try {
            const {product_id, title, description, price, content, images, category} = req.body
            if(!images) return res.status(400).json({msg: 'No images uploaded'})

            await Products.findOneAndUpdate({_id: req.params.id}, {
                title, description, price, content, images, category
            })
            res.json({msg: 'Product Updated.'})
        }catch (err) {
           return res.status(500).json({msg: err.message})
        }
    }
}

module.exports = productCtrl