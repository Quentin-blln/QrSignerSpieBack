const mysql = require('mysql2');
const express = require('express');
import sequelize from './utils/database.js';
import router from './routes/routes.js';
const session = require('express-session');
const path = require('path');
import bcrypt from 'bcryptjs';


const connection = mysql.createConnection({
	host     : 'localhost',
    port     : '3306',
	user     : 'root',
	password : 'RootooR',
	database : 'QrScanner'
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((_, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
next();
});

app.use(router);
sequelize.sync(); 


bcrypt.hash('test', 12, (err, passwordHash) => {
	console.log('passHash: ',passwordHash)
})
// // http://localhost:3000/
// app.get('/', function(req, res) {
// 	// Render login template
// 	res.sendFile(path.join(__dirname + '/login.html'));
// });

// // http://localhost:3000/auth
// app.post('/auth', function(req, res) {
// 	// Capture the input fields
// 	let username = req.body.username;
// 	let password = req.body.password;
// 	// Ensure the input fields exists and are not empty
// 	if (username && password) {
// 		// Execute SQL query that'll select the account from the database based on the specified username and password
// 		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
// 			// If there is an issue with the query, output the error
// 			if (error) throw error;
// 			// If the account exists
// 			if (results.length > 0) {
// 				// Authenticate the user
// 				req.session.loggedin = true;
// 				req.session.username = username;
// 				// Redirect to home page
// 				res.redirect('/home');
// 			} else {
// 				res.send('Incorrect Username and/or Password!');
// 			}			
// 			res.end();
// 		});
// 	} else {
// 		res.send('Please enter Username and Password!');
// 		res.end();
// 	}
// });

// // http://localhost:3000/home
// app.get('/home', function(req, res) {
// 	// If the user is loggedin
// 	if (req.session.loggedin) {
// 		// Output username
// 		res.send('Welcome back, ' + req.session.username + '!');
// 	} else {
// 		// Not logged in
// 		res.send('Please login to view this page!');
// 	}
// 	res.end();
// });

app.listen(3000);
