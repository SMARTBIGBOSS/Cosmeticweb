let Cosmetic = require('../models/cosmetics');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

let mongodbUri = 'mongodb://cosmeticdb:cosmeticdb100@ds157538.mlab.com:57538/cosmeticdb';

mongoose.connect(mongodbUri,{ useNewUrlParser: true });

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ]');
});

router.filterByBrand = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Cosmetic.find({"name": req.params.name,"brand": req.params.brand }, function (err,cosmetics) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(cosmetics,null,5));
    });
};

router.findByName = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Cosmetic.find({ "name": req.params.name }, function (err,cosmetics) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(cosmetics,null,5));
    });
};

function escapeRegex(str){
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
};

router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    //console.log(req.query.name);
    if(req.query.name){
        const regex = new RegExp(escapeRegex(req.query.name), 'gi')
        Cosmetic.find({name: regex}, function (err, cosmetics) {
            if(err)
                res.send(err);
            else
                res.send(JSON.stringify(cosmetics,null,5));
        });
    }else{
        Cosmetic.find(function (err, cosmetics) {
            if(err)
                res.send(err);
            else
                res.send(JSON.stringify(cosmetics,null,5));
        });
    }
};

router.findOne = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Cosmetic.findById(req.params.id,function(err, cosmetic) {
        if (err)
            res.json({ message: 'Cosmetic NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(cosmetic,null,5));
    });
}

router.sortByLowPrice = (req, res) =>{
    res.setHeader('Content-Type', 'application/json');

    Cosmetic.find(function (err, cosmetics) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(cosmetics,null,5));
    }).sort({price: 1});
};

router.sortByHighPrice = (req, res) =>{
    res.setHeader('Content-Type', 'application/json');

    Cosmetic.find(function (err, cosmetics) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(cosmetics,null,5));
    }).sort({price: -1});
};

router.editByID = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Cosmetic.updateOne({ "_id": req.params.id },
        {   name: req.body.name,
            brand: req.body.brand,
            price: req.body.price,
            publisher: req.body.publisher,
            release_date: Date.now()
        }, function (err, cosmetic) {
        if(err)
            res.json({ message: 'Cosmetic NOT Found!', errmsg : err});
        else
            res.json({ message: 'Cosmetic Successfully Edited!', data: cosmetic });
    });
};

router.removeCosmetic = (req, res) =>{
    Cosmetic.findOneAndRemove({publisher: req.params.publisher, _id: req.params.id}, function (err) {
        if(err)
            res.json({ message: 'Cosmetic NOT DELETED!', errmsg : err } );
        else
            res.json({ message: 'Cosmetic Successfully Deleted!'});
    });
};

router.addCosmetic = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let cosmetic = new Cosmetic();

    cosmetic.name = req.body.name;
    cosmetic.brand = req.body.brand;
    cosmetic.price = req.body.price;
    cosmetic.publisher = req.params.publisher;
    cosmetic.release_date = Date.now();

    cosmetic.save(function (err) {
        if(err)
            res.json({ message: 'Cosmetic NOT Added!', errmsg : err });
        else
            res.json({ message: 'Cosmetic Successfully Added!', data: cosmetic });
    });
};

module.exports = router;
