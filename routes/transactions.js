let Transaction = require('../models/transactions');
let Cosmetic = require('../models/cosmetics');
let Customer = require('../models/customers');
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

router.add = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let transaction = new Transaction();

    transaction.cosmeId = req.params.cosmeId;
    transaction.buyerId = req.params.buyerId;
    transaction.quantity = req.body.quantity;
    transaction.shipping_address = req.body.shipping_address;
    transaction.contact_Num = req.body.contact_Num;
    transaction.last_date = Date.now();
    transaction.status = "unpaid";

    transaction.save(function (err) {
        if(err)
            res.json({ message: 'Transaction NOT Added!', errmsg : err });
        else
            res.json({ message: 'Transaction Successfully Added!', data: transaction });
    });
};

router.remove = (req, res) => {

    Transaction.findOneAndRemove({buyerId: req.params.buyerId, _id: req.params.id, status: "unpaid"}, function (err) {
        if(err)
            res.json({ message: 'Cosmetic NOT DELETED!', errmsg : err } );
        else
            res.json({ message: 'Cosmetic Successfully Deleted!'});
    });
};

router.edit = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Transaction.findOne({_id:req.params.id}, function (err, transaction) {
        if(err)
            res.json({ message: 'Transaction NOT Found!', errmsg : err});
        else if (transaction.status != "unpaid")
            res.json({ message: 'Transaction Cannot Edit!', errmsg : err});
        else{
            Transaction.update({ "_id": req.params.id },
                {   buyerId: req.params.buyerId,
                    quantity: req.body.quantity,
                    contact_Num: req.body.contact_Num,
                    shipping_address: req.body.shipping_address,
                    last_date: Date.now(),
                }, function (err) {
                    if(err)
                        res.json({ message: 'Transaction NOT Edited!', errmsg : err});
                    else
                    res.json({ message: 'Transaction Successfully Edited!', data: transaction });
                });
        }
    });
};

router.order = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Transaction.findOne({_id:req.params.id}, function (err, transaction) {
        if (err)
            res.json({message: 'Transaction NOT Found!', errmsg: err});
        else if (transaction.status != "unpaid")
            res.json({message: 'Transaction Already Ordered!', errmsg: err});
        else {
            Transaction.update({"_id": req.params.id},
                {
                    last_date: Date.now(),
                    status: "paid"
                }, function (err, transaction) {
                    if (err)
                        res.json({message: 'Transaction NOT Found!', errmsg: err});
                    else
                        res.json({message: 'Transaction Successfully Updated!', data: transaction});
                });
        }
    });
};

router.delivery = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Transaction.findOne({_id:req.params.id}, function (err, transaction) {
        if(err)
            res.json({ message: 'Transaction NOT Found!', errmsg : err});
        else if(transaction.status == "paid"){
            Transaction.update({"_id": req.params.id},
                {
                    last_date: Date.now(),
                    status: "delivering"
                }, function (err, transaction) {
                    if (err)
                        res.json({message: 'Transaction NOT Found!', errmsg: err});
                    else
                        res.json({message: 'Transaction Successfully Updated!', data: transaction});
                });
        }
        else
            res.json({ message: 'Transaction Cannot Edit!', errmsg : err});
    });
};

router.ConfirmReceipt = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    Transaction.findOne({_id:req.params.id}, function (err, transaction) {
        if (err)
            res.json({message: 'Transaction NOT Found!', errmsg: err});
        else if (transaction.status == "delivering") {
            Transaction.update({"_id": req.params.id},
                {
                    last_date: Date.now(),
                    status: "finished"
                }, function (err, transaction) {
                    if (err)
                        res.json({message: 'Transaction NOT Found!', errmsg: err});
                    else
                        res.json({message: 'Transaction Successfully Updated!', data: transaction});
                });
        }
        else
            res.json({message: 'Transaction Cannot Edit!', errmsg: err});
    });
};

router.findByBuyerId = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let opts = [
        {path: 'cosmeId', model: Cosmetic, select: {name: 1, price: 1}}
     ];

    Transaction.find().populate(opts).exec({"buyerId": req.params.buyerId }, function (err,transaction) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(transaction,null,5));
    });
};

router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let opts = [
        {path: 'cosmeId', model: Cosmetic, select: {name: 1, price: 1}},
        {path: 'buyerId', model: Customer, select: {name: 1}}
    ];

    Transaction.find().populate(opts).exec(function (err, transactions) {
        if(err)
            res.send(err);
        else
            res.send(JSON.stringify(transactions,null,5));
    });
};

router.countSales = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let rel = [
        {path: '_id', select: {name: 1, publisher: 1}}
    ];
    let opts = [
        { $group: { _id:"$cosmeId", total_sales: {$sum: "$quantity"}}}
    ];

    Transaction.aggregate(opts).exec(function (err, transactions) {
        if(err)
            res.send(err);
        else {
            Cosmetic.populate(transactions, rel, function (err, result) {
                res.send(JSON.stringify(result, null, 5));

            });
        }
    });
};





module.exports = router;
