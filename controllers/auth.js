import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import Users_to_create from '../models/users_to_create.js';

const sendPasswordReset = (email, newpassword) => {

    var transporter = nodemailer.createTransport({
        service: 'Outlook365',
        auth: {
            user: 'assistant-qrscanner@outlook.fr',
            pass: 'qrscannerassistant1'
        }
    });

    var mailOptions = {
        from: 'assistant-qrscanner@outlook.fr',
        to: email,
        subject: 'Your brand new password !',
        html: `Hello, here is your new password: <br><br> ${newpassword} <br><br>Please change it as soon as you can to secure your account !<br>See you soon on QRScanner !<br>QRScanner Support`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const signup = (req, res, next) => {
    if (req.body.email && req.body.password && req.body.firstname && req.body.lastname) {
        // password hash
        bcrypt.hash(req.body.password, 12, (err, passwordHash) => {
            if (err) {
                return res.status(500).json({ message: "500: Couldnt hash the password" });
            } else if (passwordHash) {
                return User.create(({
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    password: passwordHash,
                    isAdmin: false
                }))
                    .then(() => {
                        Users_to_create.destroy({
                            where: { email: req.body.email }
                        }).then(() => {
                            res.status(200).json({ message: "200: User created" });
                        }).catch(err => {
                            res.status(500).json({ message: "500: User created but couldnt delete from users_to_create." })
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ message: "500: Error while creating the user" });
                    });
            };
        });
    } else if (!req.body.password) {
        return res.status(400).json({ message: "400: Password not provided" });
    } else if (!req.body.email) {
        return res.status(400).json({ message: "400: Email not provided" });
    } else if (!req.body.firstname) {
        return res.status(400).json({ message: "400: Firstname not provided" });
    } else if (!req.body.lastname) {
        return res.status(400).json({ message: "400: Lastname not provided" });
    }
};

const login = (req, res, next) => {
    // checks if email exists
    User.findOne({
        where: {
            email: req.body.email,
        }
    })
        .then(dbUser => {
            if (!dbUser) {
                console.log('user not found')
                return res.status(404).json({ message: "404: User not found" });
            } else {
                // password hash
                bcrypt.compare(req.body.password, dbUser.password, (err, compareRes) => {
                    if (err) { // error while comparing
                        res.status(502).json({ message: "502: Error while checking user password" });
                    } else if (compareRes) { // password match
                        console.log('Password match!')
                        const token = jwt.sign({ email: req.body.email }, 'secret', { expiresIn: '1h' });
                        delete dbUser.dataValues.password;
                        res.status(200).json({ message: "200: User logged in", "token": token, "user": dbUser.dataValues });
                    } else { // password doesnt match
                        res.status(401).json({ message: "401: Invalid credentials" });
                    };
                });
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: '401: Not authenticated' });
    };
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || '500: Could not decode the token' });
    };
    if (!decodedToken) {
        res.status(401).json({ message: '401: Unauthorized' });
    } else {
        res.status(200).json({ message: '200: Here is your resource' });
    };
};

const addUserToCreate = (req, res, next) => {
    // checks if id exists
    User.findOne({
        where: {
            id: req.body.userID,
        }
    })
        .then(dbUser => {
            if (!dbUser) {
                console.log('user not found')
                return res.status(404).json({ message: "404: User not found" });
            } else {
                Users_to_create.create({
                    email: req.body.email
                }).then(result => {
                    console.log(result)
                    res.status(200).json({ message: "200: E-mail added. User can now create his account." })
                }).catch(err => {
                    if (err.errno == 1062) {
                        console.log('E-mail already added.')
                        res.status(409).json({ message: "409: E-mail already added." })
                    }
                    else {
                        res.status(401).json({ message: "401: E-mail couldnt be added" })
                    }
                })
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

const checkEmailToCreateUser = (req, res, next) => {
    // checks if email exists
    Users_to_create.findOne({
        where: {
            email: req.query.email,
        }
    })
        .then(usr => {
            if (!usr) {
                console.log('user not found')
                return res.status(404).json({ message: "404: Email not found" });
            } else {
                return res.status(200).json({ message: "200: E-mail found." })
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

const forgotPassword = (req, res, next) => {
    // checks if email exists
    User.findOne({
        where: {
            email: req.body.email,
        }
    })
        .then(usr => {
            if (!usr) {
                console.log('user not found')
                return res.status(404).json({ message: "404: Email not found" });
            } else {
                var newPass = Math.random().toString(36).slice(-8);
                bcrypt.hash(newPass, 12, (err, passwordHash) => {
                    if (err) {
                        console.log('1')
                        return res.status(500).json({ message: "500: couldnt hash the password" });
                    } else if (passwordHash) {
                        User.update({
                            password: passwordHash
                        },
                            {
                                where: { email: req.body.email }
                            }).then(() => {
                                sendPasswordReset(req.body.email, newPass)
                                res.status(200).json({ message: "200: Password successfully reset." })
                            }).catch(err => {
                                console.log(err)
                                res.status(500).json({ message: "500: couldnt update password" })
                            })
                    }
                })
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

const updatePassword = (req, res, next) => {
    // checks if email exists
    User.findOne({
        where: {
            email: req.body.email,
        }
    })
        .then(usr => {
            if (!usr) {
                console.log('user not found')
                return res.status(404).json({ message: "404: Email not found" });
            } else {
                // password hash
                bcrypt.compare(req.body.oldpassword, usr.password, (err, compareRes) => {
                    if (err) { // error while comparing
                        res.status(502).json({ message: "502: Error while checking user password" });
                    } else if (compareRes) { // password match
                        console.log('Password match!')
                        // password hash
                        bcrypt.hash(req.body.newpassword, 12, (err, passwordHash) => {
                            if (err) {
                                return res.status(500).json({ message: "500: Couldnt hash the password" });
                            } else if (passwordHash) { 
                                User.update({
                                    password: passwordHash
                                },
                                    {
                                        where: { email: usr.email }
                                    }).then(resp=>{
                                        res.status(200).json({message:"Password successfully updated."})
                                    }).catch(err=>{
                                        console.log(err)
                                        res.status(500).json({message:"Couldnt update password."})
                                    })
                            }
                        })
                    } else { // password doesnt match
                        res.status(401).json({ message: "401: Invalid credentials" });
                    };
                });
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

const getAllUsers = (req, res, next) => {
    // checks if email exists
    User.findOne({
        where: {
            email: req.query.email,
        }
    }).then(usr => {
            if (!usr) {
                console.log('user not found')
                return res.status(404).json({ message: "404: Email not found" });
            } else {
                User.findAll().then(users=>{
                    res.status(200).json({users:users})
                }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt collect users."})})
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

const getUser = (req, res, next) => {
    // checks if email exists
    User.findOne({
        where: {
            email: req.query.email,
        }
    }).then(usr => {
            if (!usr) {
                console.log('user not found')
                return res.status(404).json({ message: "404: Email not found" });
            } else {
                User.findOne({where:{id: req.query.userID}}).then(user=>{
                    res.status(200).json({user:user})
                }).catch(err=>{console.log(err);res.status(500).json({message:"500: Couldnt collect user."})})
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

export { signup, login, isAuth, addUserToCreate, checkEmailToCreateUser, forgotPassword, updatePassword, getAllUsers, getUser };