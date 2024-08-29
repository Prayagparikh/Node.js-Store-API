const mongoose = require('mongoose')

// Schema of each of the product in json
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'product name must be provided'],
    },

    price: {
        type: Number,
        required: [true, 'product price must be provided'],
    }, 

    featured: {
        type: Boolean,
        required: false,
    },

    rating: {
        type: Number,
        default: 4.5,
    }, 

    createdAt: {
        type: Date,
        default: Date.now(),
    },

    // company is enum type: choosing from only a list of companies
    company: {
        type: String,
        enum: {
            values: ['ikea', 'liddy', 'caressa', 'marcos'],
            message: '{VALUE} is not supported',
        },
    },
})

// 'Product' is the name of schema and since it is mongoose model, it's exported in the controllers/products.js and Product supports query functions such as Product.find() to query.
module.exports = mongoose.model('Product', productSchema);