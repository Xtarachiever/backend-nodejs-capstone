const express = require('express');
const connectToDatabase = require('../models/db');
const router = express.Router();
const logger = require('../logger');

const bcryptjs = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET

// Register Routes
router.post('/register',async(req,res,next)=>{
    try{
        const { email, password } = req.body
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const existingEmail = await collection.findOne({email: email})

        if(existingEmail){
            logger.error('Email id already exists');
            return res.status(400).json({error:'Email id already exists'})
        }

        // Hashing password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const newUser = await collection.insertOne({
            email: email,
            password: hashPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            createdAt: new Date()
        })

        const payload ={
            user:{
                id: newUser.insertedId
            }
        };

        const authToken = jwt.sign(payload, JWT_SECRET)
        logger.info('User registered successfully');
        res.json({ authToken, email });

    }catch(e){
        return res.status(500).send('Internal server error');
    }
})

module.exports = router;