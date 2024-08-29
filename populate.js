require('dotenv').config()

const connectDB = require('./db/connect');
const Product = require('./models/product');

const jsonProducts = require('./products.json')

const start = async() => {
    try{
        await connectDB(process.env.MONGO_URI);
        await Product.deleteMany();   // delete any previous data from 'Product' model to start from the scratch
        await Product.create(jsonProducts); // add entire product.json data to the model
        console.log('Success!!!');
        process.exit(0)
    } catch(error) {
        console.log(error);
        process.exit(1)
    }
}

start()