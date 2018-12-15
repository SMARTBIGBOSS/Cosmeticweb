const multer = require('multer');
let path = require('path');
let express = require('express');
let router = express.Router();
/*
let mongoose = require('mongoose');

let mongodbUri = 'mongodb://cosmeticdb:cosmeticdb100@ds157538.mlab.com:57538/cosmeticdb';

mongoose.connect(mongodbUri);

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ]');
});

router.get('/', function(req, res, next) {
    res.render('index', {page:'Home', menuId:'home'});
});
*/

function checkFileType(file, img){
    const filetypes = /png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimeType);

    if(mimetype && extname){
        return img(null, true);
    }else{
        img('Error: Only jpeg, jpg, png Images !');
    }
}

router.uploadImage = (req, res) => {
    const storage = multer.diskStorage({
        destination: function (req, file, logo) {
            logo(null, './userLogo');
        },
        filename: function (req,file,logo) {
            logo(null, req.params.id + '_' + Date.now() + path.extname(file.originalname));
        }
    });
    const upload = multer({
        storage: storage,
        limits: {fileSize:1024 * 1024},
        // fileFilter: function (req, file, logo) {
        //     checkFileType(file, logo);
        // }
    }).single('userLogo');

    upload(req,res,(err) => {
        if(err){
            res.send(err);
            // res.render('uploadImage',{
            //     msg: err
            // });
        }else{
            console.log(req.file);
            console.log(path.extname(req.file.originalname));
            res.json( {message: 'Image Uploaded!', file: `userLogo/${req.file.filename}` });
            // res.render('uploadImage',{
            //     msg: 'File Uploaded',
            //     file: `userLogo/${req.file.filename}`
            // })

        }
    });
}



module.exports = router;