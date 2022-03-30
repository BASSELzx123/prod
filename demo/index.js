const express = require("express")
const app = express()
const fs = require("fs");
var cors =require('cors');
var path = require('path');
var mysql = require('mysql2');
var jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});
global.logged_user_name="PNU";
function authentication(req, res, next) {
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
app.options('*', cors())
const authRoute=require('./routes/auth')
const aboutRoute=require('./routes/about')
const courseRoute=require('./routes/course')
const questionRoute=require('./routes/question')
const attendanceRoute=require('./routes/attendance')
const subtitleRoute=require('./routes/subtitle')
// First step is the authentication of the client
/*app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
next();
    });*/
//app.use(authentication)
app.use(express.static(path.join(__dirname, 'public')));



app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use('/api/auth',authRoute);
app.use('/api/about',aboutRoute);
app.use('/api/course',courseRoute);
app.use('/api/question',questionRoute);
app.use('/api/attendance',attendanceRoute);
app.use('/api/subtitle',subtitleRoute);
//app.use(cors());


  
const port = process.env.PORT || 4000;
app.listen(port,() => console.log('Server listening at port '+ port));

module.exports = { authentication };
