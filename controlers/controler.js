const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mailer = require('../modules/mailer');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

const User = require('../models/user');
const Tshirt = require('../models/tshirt');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    })
}

//authentications

router.post('/authenticate', async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).send({ error: 'User not found'});
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Invalid password'});
    }

    user.password = undefined;

    res.send({user, token: generateToken({id: user.id})});
})

router.post('/forgot_password', async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).send({ error: 'User not found'});
        }
        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        mailer.sendMail({
            to: email,
            from: 'vina@gmail.com',
            template: 'auth/forgot_password',
            context: {token},
        }, (err) => {
            if(err){
                return res.status(400).send({ error: 'Cannot send forgot password email'})
            }
            return res.send();
        })

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        })
        console.log(token, now)

    } catch (err) {
        res.status(400).send({ error: 'Error on forgot password, try again'});

    }
})

router.post('/reset_password', async (req, res) => {
    const {email, token, password} = req.body;

    try {
        const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires');
        if(!user){
            return res.status(400).send({ error: 'User not found'});
        }
        if(token !== user.passwordResetToken){
            return res.status(400).send({error: 'Token invalid'})
        }
        const now = new Date();
        if(now > user.passwordResetExpires){
            return res.status(400).send({error: 'Token expired, generate a new one'});
        }
        user.password = password;

        await user.save();

        res.send();
    } catch (err) {
        res.status(400).send({error: 'Cannot reset password, try again'});
    }
})

//user

router.post('/userRegister', async(req,res)=> {
    try {
        const user = await User.create(req.body);
        return res.send({user, token:generateToken({ id: user.id }),
    });

    } catch (error) {
        return res.status(400).send({error: "User registration failed"})
    }
})

//tshirts

router.get('/', async (req,res) => {
    try {
        const tshirts = await Tshirt.find().populate('user');
        return res.send({tshirts})
    } catch (error) {
        return res.status(400).send({error: 'Error to find tshirts'})
    }
});

router.get('/:tshirtId', async (req,res) => {
    try {
        const tshirts = await Tshirt.findById(req.params.tshirtId).populate('user');
        return res.send({tshirts})
    } catch (error) {
        return res.status(400).send({error: 'Error to find the tshirt'})
    }
})

router.put('/:tshirtId', async (req,res) => {
    try {
        const {price} = req.body;
        const tshirt = await Tshirt.findByIdAndUpdate(req.params.tshirtId, {
            price
        }, { new: true});
        await tshirt.save();
        return res.send({tshirt});
    } catch (err) {
        return res.status(400).send({error: 'Error to update the tshirt'})
    }
})

router.delete('/:tshirtId', async (req,res) => {
    try {
        await Tshirt.findByIdAndRemove(req.params.tshirtId);
        return res.send();
    } catch (error) {
        return res.status(400).send({error: 'Error deleting the Tshirt'})
    }
})

router.post('/tshirtRegister', async(req,res)=> {
    try {

        const tshirt = await Tshirt.create(req.body);
        return res.send({tshirt})

    } catch (error) {
        return res.status(400).send({error: "Tshirt registration failed"})
    }
})



module.exports = app => app.use('/auth', router);