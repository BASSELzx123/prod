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
TOKEN_SECRET="a10d502b6097ab9c15dfa33091c904ad6b073384111df1bd4c999236fd1b8736f3a0156d395f4e4cdf8db6bfb18bb76dc7c3c8456209f8fdf2c450c297da3c48"
// get config vars

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});


module.exports = { 
	generate: function (username) {
		return jwt.sign({id:username}, TOKEN_SECRET, { expiresIn: "2h" });
	},
	authentication: function (req, res, next) {
    const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
  jwt.verify(token, TOKEN_SECRET, function (err, decoded) {
    
   
	if (err) {
		console.log(err.name)
      return res.status(401).json(err);
    }
    console.log(decoded)
    next();
  });
}
 };
