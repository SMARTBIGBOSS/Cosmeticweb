const jwt = require("jsonwebtoken");

function authSeller(req, res, next){
    let token = req.header('token');
    if(!token)
        return res.status(401).send('Access denied. No Token Provided!');
    else{
        try{
            let decoded = jwt.verify(token, 'sellerJwtKey');
            req.seller = decoded;
            next();
        }
        catch (e) {
            res.status(400).send('Invalid token!');
        }
    }
};

function authCustomer(req, res, next){
    let token = req.header('token');
    if(!token)
        return res.status(401).send('Access denied. No Token Provided!');
    else{
        try{
            let decoded = jwt.verify(token, 'customerJwtKey');
            req.customer = decoded;
            next();
        }
        catch (e) {
            res.status(400).send('Invalid token!');
        }
    }
};

module.exports.authSeller = authSeller;
module.exports.authCustomer = authCustomer;
