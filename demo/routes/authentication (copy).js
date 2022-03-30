const express = require("express")
const app = express()
const fs = require("fs");
var cors =require('cors');
var path = require('path');
var mysql = require('mysql2');
var jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
//token
//a10d502b6097ab9c15dfa33091c904ad6b073384111df1bd4c999236fd1b8736f3a0156d395f4e4cdf8db6bfb18bb76dc7c3c8456209f8fdf2c450c297da3c48
TOKEN_SECRET=a10d502b6097ab9c15dfa33091c904ad6b073384111df1bd4c999236fd1b8736f3a0156d395f4e4cdf8db6bfb18bb76dc7c3c8456209f8fdf2c450c297da3c48
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});


module.exports = { 
	authentication: function (req, res, next) {
    const auth1 = {login: 'PNU', password: '1234'}
	var authheader = req.headers.authorization;
	console.log(req.headers);

	if (!authheader) {
		var err = new Error('You are not authenticated!');
		res.setHeader('WWW-Authenticate', 'Basic');
		err.status = 401;
		return next(err)
	}

	var auth = new Buffer.from(authheader.split(' ')[1],
	'base64').toString().split(':');
	var user_id = auth[0];
	var PIN = auth[1];
    //console.log(user)
            con.query('SELECT * FROM users WHERE user_id = ? and is_admin=1', [user_id], function(error, results, fields) {
			if(results.length>0){
			if (results[0].active==true) {
				console.log(results);
				console.log(results[0].PIN);
				bcrypt.compare(PIN,results[0].PIN,(error,match)=>{
					if(error){
						var err = new Error('You are not authenticated!');
						res.setHeader('WWW-Authenticate', 'Basic'); err.status = 401; 
						return next(err);
					}
					else if (match){
						console.log("done");
						return next();
					}
					else {
						var err = new Error('You are not authenticated!');
						res.setHeader('WWW-Authenticate', 'Basic');
						err.status = 401;
						return next(err);
					}
            		});			
			
		
	} 
}else {
	var err = new Error('You are not authenticated!');
	res.setHeader('WWW-Authenticate', 'Basic');
	err.status = 401;
	return next(err);
}
});

}
 };
