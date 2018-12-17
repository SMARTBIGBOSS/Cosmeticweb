let Seller = require('../models/sellers');
let bcrypt = require('bcrypt-nodejs');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
//let jwt = require('jsonwebtoken');

let mongodbUri = 'mongodb://cosmeticdb:cosmeticdb100@ds157538.mlab.com:57538/cosmeticdb';

mongoose.connect(mongodbUri,{ useNewUrlParser: true });

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ]');
});



router.register = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let seller = new Seller();
    seller.name = req.body.name;
    seller.email = req.body.email;
    seller.description = req.body.description;
    seller.register_date = Date.now();
    seller.password = bcrypt.hashSync(req.body.password);

    seller.save(function (err){
        if(err)
            res.json({ message: 'Seller NOT Sign Up!', errmsg : err, data: null });
        else
            res.json({ message: 'seller Successfully Sign Up', data: seller });
    });
}

router.login = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Seller.findOne({email: req.body.email},function (err, seller) {
        if(!seller)
            res.json({ message: 'Seller NOT Login!', errmsg : err, data: null });
        else{
            if(bcrypt.compareSync(req.body.password,seller.password)){
                // let token = jwt.sign({_id: seller._id}, 'sellerJwtKey');
                let token = seller.generateAuthToken();
                res.header('token',token);
                res.json({message: 'Seller Successfully Login', data: seller });
            }
            else
                res.json({ message: 'Email Address or Password Incorrect!', errmsg : err, data: null });
        }
    });
}

router.findOne = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Seller.findById(req.params.id,function(err, seller) {
        if (err)
            res.json({ message: 'Seller NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(seller,null,5));
    });
}

router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Seller.find(function(err, seller) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(seller,null,5));
    });
}

router.editByID = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let seller = new Seller({
        name: req.body.name,
        email:  req.body.email,
        password: bcrypt.hashSync(req.body.password),
        description: req.body.description
    });
    let validate = seller.validateSync();

    if(validate != null){
        res.json(validate);
    }else{
        Seller.update({"_id": req.params.id},
            {   name: seller.name,
                email: seller.email,
                password: seller.password,
                description: seller.description
                //img_url:
            },
            function(err,seller) {
                if(err)
                    res.json({ message: 'Seller NOT Edited!', errmsg : err });
                else
                    res.json({ message: 'Seller Successfully Edited!', data: seller });
            });
    }
};

module.exports = router;
