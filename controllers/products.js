const Product = require('../models/product');

// staic is just for testing - will show static products details
const getAllProductsStatic = async(req, res) => {
    // const products = await Product.find({}).sort('-price name');  // -price: descending order, name: starts with 'a'

    const products = await Product.find({ price: { $gt: 30 }, rating: { $gte: 4} })
        .sort('price')
        .select('name price rating');

    res.status(200).json({ products, nbHits: products.length });
}


// this is the actual dynamic function to retrive info from atlas's Products document, based on the search criteria in the query params
const getAllProducts = async(req, res) => {
    // searching based on the query params of http url -> after "?featured=true&page=2"
    const {featured, company, name, sort, fields, numericFilters} = req.query;
    const queryObject = {}

    if(featured) {
        queryObject.featured = featured === 'true' ? true : false;
    }

    if(company) {
        queryObject.company = company;
    }

    if(name) {
        queryObject.name = { $regex: name, $options:'i' };
    }

    // filters on properties: 'price' & 'rating'
    if(numericFilters) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)   //separating with hyphen at the end to separate field, operator, value below.
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach(item => {
            const [field, operator, value] = item.split('-');
            if(options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) };
            }
        });
    }

    // we get result based on queryObject: company, name, featured value and we can sort it below.
    let result = Product.find(queryObject)  // Mongoose queries are lazy. this will just create query but until 'await' is used it'll not get executed. We need to use sort(), select() etc methods so just making the query ready but executing in the end.

    // sort: sorting is not a http call, just arranging the 'result' from query params sort list: sort=-name, price so using these 2 things in sortList.
    if(sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('createdAt');
    }

    // selecting particular fileds only
    if(fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList)
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = (page-1) * limit;

    result = result.skip(skip).limit(limit);
    // if 23 results
    // 4(pages) : 7 7 7 2

    // Execute the query and return the results
    const products = await result;
    res.status(200).json({ products, nbHits: products.length});
}

module.exports = {
    getAllProducts,
    getAllProductsStatic,
}