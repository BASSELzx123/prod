const express = require("express");
var mysql = require('mysql2');
const crypto = require("crypto");
const router =express.Router();
const bcrypt = require('bcryptjs');
const auth = require("./authentication");
const sendEmail = require("./sendEmail");
const fs = require('fs');
const rounds = 10;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});

con.connect(function(err) {
if (err) throw err;
console.log("Connected!");

});


var jwt = require('jsonwebtoken');
var tokenSecret = "my-token-secret"
router.get('/usercount',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query('SELECT * FROM users WHERE is_admin=0 AND active=1', function(error, results, fields) {
        if (error) throw error;
		var data ={
			status:'ok',
			message:'success',
			totalusers:results.length
		}
		response.status(200).json(data);		
		response.end();
        
        
    });
    
});
router.get('/getuserimage/:user_id',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
	var user_id=request.params.user_id;
    con.query('SELECT * FROM attachment WHERE id=?',[user_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){

			const contents = fs.readFileSync(results[0].photo, {encoding: 'base64'});
			//console.log(contents)
			var data ={
				status:'ok',
				message:'success',
				image:contents,
				data:results
			}
            response.status(200).json(data);		
            response.end();
        }else{
			var data = {
				status: 'error',
				message:'no such id'
			};
            response.status(500).json(data);		
            response.end();
        }
        
    });
    
});
router.get('/getuserbyid/:user_id',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
	var user_id=request.params.user_id;
    con.query('SELECT * FROM users WHERE user_id=?',[user_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			var data ={
				status:'ok',
				message:'success',
				data:results
			}
            response.status(200).json(data);		
            response.end();
        }else{
			var data = {
				status: 'error',
				message:'no such id'
			};
            response.status(500).json(data);		
            response.end();
        }
        
    });
    
});
router.get('/gettrainee',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query('SELECT * FROM users WHERE is_admin=0 AND active=1', function(error, results, fields) {
        if (error) throw error;
		
		//console.log(results.length);
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
			console.log(results[i].user_id);
			con.query('SELECT * FROM attachment WHERE id=?',[results[i].user_id], function(error, res, fields) {
				if (error) throw error;
				console.log(results[i].user_id);
				if(res.length>0){
					
					const contents = fs.readFileSync(res[0].photo, {encoding: 'base64'});
					//console.log(contents)
					results[i].image=contents;
				}
					if(i==results.length-1){
					var data ={
						status:'ok',
						message:'success',
						data:results
					}
					response.status(200).json(data);		
					response.end();
				}
				
		});
		}
        }else{
			var data = {
				status: 'error',
				message:'no such id'
			};
            response.status(500).json(data);		
            response.end();
        }
        
    });
    
});

router.get('/getadmin',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query('SELECT * FROM users WHERE is_admin=1 AND active=1', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
			console.log(results[i].user_id);
			con.query('SELECT * FROM attachment WHERE id=?',[results[i].user_id], function(error, res, fields) {
				if (error) throw error;
				if(res.length>0){
		
					const contents = fs.readFileSync(res[0].photo, {encoding: 'base64'});
					//console.log(contents)
					results[i].image=contents;
				}
					if(i==results.length-1){
					var data ={
						status:'ok',
						message:'success',
						data:results
					}
					response.status(200).json(data);		
					response.end();
				}
				
		});
		}
        }else{
			var data = {
				status: 'error',
				message:'no such id'
			};
            response.status(500).json(data);		
            response.end();
        }
        
    });
    
});

router.post('/login',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var user_id = request.body.user_id;
	var PIN = request.body.PIN;
    console.log(user_id,PIN);
	
        con.query('SELECT * FROM users WHERE user_id = ? and is_admin=1', [user_id], function(error, results, fields) {
			if(results.length>0){
			if (results[0].active==true) {
				console.log(results);
				console.log(results[0].PIN);
				bcrypt.compare(PIN,results[0].PIN,(error,match)=>{
					if(error){
						var data = {
							status: 'error',
							message: 'error in processing'
						};
						response.status(500).json(data)
						response.end();
					}
					else if (match){
						const token=auth.generate(user_id)
						console.log(token)
						var data = {
							status: 'ok',
							message:'matched',
							id:results[0].user_id,
							email:results[0].email,
							token:token
						};
						response.status(200).json(data)
						response.end();
					}
					else {
						var data = {
							status: 'error',
							message:'unmatched'
						};
						response.status(200).json(data)
						response.end();
					}
            		});			
			
		
	} 
}else {
	var data = {
		status: 'error',
		message:'Please enter correct user_id and PIN!'
	};
	response.status(500).json(data);
	response.end();
}
});
    
});

router.post('/forget',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', false);
    var user_id = request.body.user_id;
	//var PIN = request.body.PIN;
    //console.log(user_id);
	if (user_id) {
        con.query('SELECT * FROM users WHERE user_id = ? ', [user_id], function(error, results, fields) {
			if (results.length > 0) {
				var id=results[0].id
				var email=results[0].email
				var full_name=results[0].full_name
                console.log(results);
				console.log(id);
				console.log(user_id);
				console.log(email);
				let resetToken = crypto.randomBytes(32).toString("hex");
				const hashreset =bcrypt.hash(resetToken, rounds);
				//console.log(fields);
                //console.log(hashreset);
				con.query('UPDATE users SET token=?,updated_by=? WHERE id=?', [resetToken,global.logged_user_name,id], function(error, res, fields) {
					console.log("updated")			
				});
				const link = `172.17.80.135/forget-reset?token=${resetToken}&id=${user_id}&new_user=false`;
				sendEmail(email,"PIN Reset Request",{name:full_name,user_id: user_id,link: link,},"./requestResetPIN.handlebars");
				var data = {
					status: 'ok',
					message:'correct user_id!'
				};
				response.status(200).json(data)
				response.end();
			} else {
				var data = {
					status: 'error',
					message:'incorrect user_id!'
				};
				response.status(200).json(data)
				response.end();
			}			
		});
	} else {
		var data = {
			status: 'error',
			message:'Please enter user_id!'
		};
		response.status(200).json(data)
		response.end();
	}
    
});

router.post('/resetPIN',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var user_id = request.body.user_id;
	var new_user = request.body.new_user;
	var PIN = request.body.PIN;
	var tokenReset    = request.body.token;
	var token;
	con.query('SELECT * FROM users WHERE user_id = ? ', [user_id], function(error, results, fields) {
		if (results.length > 0) {
			var id=results[0].id
			var email=results[0].email
			var full_name=results[0].full_name
			console.log(id);
			console.log(user_id);
			console.log(email);
			if (!results[0].token) {
				//console.log("token does not exist")
				var data = {
					status: 'error',
					message:'token does not exist'
				};
				response.status(500).json(data)
				response.end();
			}else{
				token=results[0].token;
				
				const isValid = bcrypt.compare(token, tokenReset);
				if (!isValid) {
					//console.log("not valid token")
					var data = {
						status:'error',
						message:'not valid token'
					};
					response.status(500).json(data)
					response.end();
				}
				const hash = bcrypt.hash(PIN, rounds, function(err, hash) {
					console.log(hash)
					con.query('UPDATE users SET PIN=?,updated_by=? WHERE id=?', [hash,global.logged_user_name,id], function(error, res, fields) {
						console.log(res)			
					});
				});
				var stat;
				if(new_user==true){
					sendEmail(email,"PIN set Successfully",{name:full_name,user_id: user_id},"./setPIN.handlebars");
					stat= "PIN set done";
				}
				else{
					sendEmail(email,"PIN Reset Successfully",{name:full_name,user_id: user_id},"./resetPIN.handlebars");
					stat= "PIN reset done";
				}
				
				tokenReset=""
				con.query('UPDATE users SET token=?,updated_by=? WHERE id=?', [tokenReset,global.logged_user_name,id], function(error, res, fields) {
				console.log("updated")			
				});
				var data = {
					status: 'ok',
					message:stat
				};
				response.status(200).json(data);
				response.end();
			}
		} else {
			var data = {
				status: 'error',
				message:'incorrect user_id!'
			};
			response.status(200).json(data)
			response.end();
		}		
	
		
				
	});

});
var check =2;
router.post('/signup',(req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	console.log("start")
	//while(check>0){
		var seq = Math.floor(10000 + Math.random() * 90000);
		
		con.query('SELECT user_id FROM users WHERE user_id=?;', [seq], function(error, results, fields) {
			console.log(check)
			check=results.length;
			console.log(results)
		});
	//}	
	console.log(seq);	
	var seq1=seq;
	var full_name = req.body.full_name;
	var email    = req.body.email;
    var is_admin = req.body.is_admin;
	var active = true;
	var created_by    = global.logged_user_name;
	var base64String    = req.body.base64String;
	console.log(full_name)

	con.query('SELECT email,active FROM users WHERE email = ? ', [email], function(error, results, fields) {
		if(results.length>0){
			
			var data 
			if(results[0].active=='1'){
				data= {
				status: 'error',
				message:'A user with this email already exists'
			};
			}else{
				data= {
				status: 'error',
				message:'This user ID is inactive please contact system administrator'
			};
			}
			res.status(200).json(data);		
			res.end();

		}else{
	con.query('INSERT INTO `users` (`user_id`,`full_name`, `email`, `is_admin`, `active`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?, ?);', [seq, full_name,email,is_admin,active,created_by,created_by], function(err, results, fields) {
		console.log(results);
		if (err) throw err;
		console.log("data uploaded in users!");
		
		let resetToken = crypto.randomBytes(32).toString("hex");
		const hashreset =bcrypt.hash(resetToken, rounds);
		//console.log(fields);
		//console.log(hashreset);
		con.query('UPDATE users SET token=?,updated_by=? WHERE user_id=?', [resetToken,created_by,seq], function(error, res1, fields) {
			console.log("updated")			
		});
		const link = `172.17.80.135/forget-reset?token=${resetToken}&id=${seq}&new_user=true`;
		sendEmail(email,"Set your PIN",{name: full_name,user_id: seq,link: link,},"./requestPIN.handlebars");
		var base64Data = base64String.replace(/^data:image\/png;base64,/, "");
		var filename="/var/www/demo/data/user_pictures/"+seq+".png";
		require("fs").writeFile(filename, base64Data, 'base64', function(err) {
		console.log(err);
		});
		console.log(seq1)
		
		con.query('INSERT INTO `attachment` (`id`,`photo`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?);', [seq1, filename,created_by,created_by], function(err, results, fields) {
			
			console.log(results);
			if (err) throw err;
			console.log("signup successful!");
		
		var data = {
			status: 'ok',
			message:'signup successful!',
			is_admin:is_admin,
			active:active,
			user_id:seq
		};
		res.status(200).json(data);		
		res.end();

	});
	});
	}
	}); 

});
router.put('/modifyuser/:user_id',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var user_id = req.params.user_id
    var full_name;
    var email;
    var active=true;
    var updated_by=global.logged_user_name;
	var base64String;
    con.query('SELECT * FROM users WHERE user_id=?',[user_id], function(error, results, fields) {
        if (results.length > 0) {
            console.log(results);	
            full_name=results[0].full_name;
            email=results[0].email;
            active=results[0].active;
            if(req.body.full_name){
                full_name=req.body.full_name
            }
            if(req.body.email){
                email=req.body.email
            }
            if(req.body.active){
                active=req.body.active
            }
			if(req.body.base64String){
				base64String=req.body.base64String
				//console.log(base64String);
				var base64Data = base64String.replace(/^data:image\/png;base64,/, "");
				var filename="/var/www/demo/data/user_pictures/"+user_id+".png";
				require("fs").writeFile(filename, base64Data, 'base64', function(err) {
				console.log(err);
				});
				//console.log(seq)
				
				con.query('UPDATE attachment SET photo=?,updated_by=? WHERE id=?', [filename,updated_by,user_id], function(err, results, fields) {
					console.log(results);
					if (err) throw err;
					console.log("updated!");
				});
			}
			con.query('UPDATE users SET full_name=?,email=?,active=?,updated_by=? WHERE user_id=?', [full_name,email,active,updated_by,user_id], function(error, res, fields) {
				console.log("updated")		
					
			});
			var data = {
				status: 'ok',
				message:'updated user_id!'
			};
			res.status(200).json(data)
			res.end();
        }else {
			var data = {
				status: 'error',
				message:'incorrect user_id!'
			};
            res.status(200).json(data)
            res.end();
        }
        
    });
    
   
});
router.delete('/deleteuser/:user_id',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
	var user_id = req.params.user_id
	var active = false;
    var updated_by=global.logged_user_name;
	con.query('SELECT * FROM users WHERE user_id=?',[user_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
	con.query('UPDATE users SET active=?,updated_by=? WHERE user_id=?', [active,updated_by,user_id], function(error, res, fields) {
		console.log("updated")	
		
			
	});
	var data = {
		status: 'ok',
		message:'Deleted Successfully'
	};
	res.status(200).json(data);		
	res.end();	
}else{
	var data = {
		status: 'error',
		message:'no such id'
	};
	res.status(500).json(data);		
	res.end();
}
	});
		
});
module.exports = router
