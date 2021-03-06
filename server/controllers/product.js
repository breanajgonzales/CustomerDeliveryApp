/*
** Load the appropriate models
 */

var Product = require('../models/product.js');

/*
** GET requests
 */
module.exports.list = function (req, res) {
    Product.find({}, function(err, products) {
        if (err) {
            res.send(err);
        }

//        products.forEach(function(product) {
//            console.log('Product found: ' + product._id);
//        });

        res.json({
            products: products
        });
    });
};

/*
    POST requests
    Type of request is used when server-side state does not matter (e.g. state could exist, be modified or not exist)

    http://www.stormpath.com/blog/put-or-post - provides a good explanation of POST vs. PUT requests
*/
module.exports.addProduct = function (req, res) {
    // Create a product in database
    var product = new Product ({
        'product_name': req.body.product_name,
        'description': req.body.description,
        'price': req.body.price,
        'created': req.body.created
    });

    product.save(function(err){
        if (err) {
            console.log('Error saving product: ' + err);
            res.json({'error': 'addProduct'});
        }

        res.json({
            product: product
        });
    });
};

module.exports.getProduct = function (req, res) {
    Product.find({'_id': req.params.id}, function (err, product) {
        if (err) {
            res.send(err);
        }
        res.json({
            product: product
        });

    });


};

module.exports.putProduct = function (req, res) {
    var price = req.body.price;
    var description = req.body.description;
    var product_name = req.body.product_name;

    Product.find({'_id': req.params.id}, function (err, product) {

       var currentProduct = product[0];


       currentProduct['price'] = price;
       currentProduct['description'] = description;
       currentProduct['product_name'] = product_name;

       currentProduct.save(function (err) {
            if (err) {
                console.log('Error editing product: ' + err);
                res.json({'error': 'putProduct'});
            }

            res.json({
                product: currentProduct
            });
        });
    });


};

module.exports.deleteProduct = function (req, res) {
    Product.find({'_id': req.params.id}, function (err, product) {
        if (err) {
            res.send(err);
        }

        product.forEach(function (product) {
            product.remove(function (err, response) {
                if (err) {
                    res.send(err);
                }

                Product.find({}, function (err, products) {
                    if (err) {
                        res.send(err);
                    }

                    res.json({
                        products: products
                    });
                });
            })
        });
    });
};
