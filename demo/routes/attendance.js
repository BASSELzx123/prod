const express = require("express");
var mysql = require('mysql2');
const auth = require("./authentication");
const router =express.Router();
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});

router.get('/getattendancebyuserid/:user_id',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var user_id=request.params.user_id;
    con.query('SELECT * FROM attendance WHERE user_id=?',[user_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var data = {
                status:'ok',
                message:'success',
                attendance:results
            }
            response.status(200).json(data);	
            response.end();
        }else{
            var data = {
				status: 'error',
                message:'no such id'
			};
            response.status(200).json(data);	
            response.end();
        }
        
    });
    
});
router.get('/sessionpm',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query("Select COUNT(*), course_id as course_id FROM PNU.attendance GROUP BY course_id;", function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){	
				con.query("Select course_id,coursename FROM PNU.course", function(error, res1, fields) {
				for (let x = 0; x < res1.length; x++) {
					res1[x].count=0
					for (let i = 0; i < results.length; i++) {
						if(res1[x].course_id==results[i].course_id){
							res1[x].count=Math.round(results[i]['COUNT(*)'] )
							
						}
						
					}
					if(x==res1.length-1){
						var data = {
							status:'ok',
							message:'success',
							data:res1
						}
						response.status(200).json(data);	
						response.end();
					}
					
				}
				});
           
        }
        
    });
    
});

router.get('/minutespm',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query("SELECT AVG(score), course_id as course_id FROM PNU.attendance  GROUP BY course_id;", function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			con.query("Select course_id,coursename FROM PNU.course", function(error, res1, fields) {
				for (let x = 0; x < res1.length; x++) {
					res1[x].score=0
					for (let i = 0; i < results.length; i++) {
						if(res1[x].course_id==results[i].course_id){
							res1[x].score=Math.round(results[i]['AVG(score)'] )
							
						}
						
					}
					if(x==res1.length-1){
						var data = {
							status:'ok',
							message:'success',
							data:res1
						}
						response.status(200).json(data);	
						response.end();
					}
					
				}
				});
        }
        
    });
    
});
router.get('/sessioncount',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query('SELECT DATE(date) FROM attendance;', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var data = {
                status:'ok',
                message:'success',
                totalsession:results.length
            }
            response.status(200).json(data);	
            response.end();
        }
        
    });
    
});
router.get('/sessionscore',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query('SELECT AVG(score) FROM attendance;', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var data = {
                status:'ok',
                message:'success',
                score:Math.round(results[0]["AVG(score)"])
            }
            response.status(200).json(data);	
            response.end();
        }
        
    });
    
});
router.get('/getattendance',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    con.query('SELECT * FROM attendance ORDER BY date DESC;', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            for (let i = 0; i < results.length; i++) {
                //console.log(results[i].user_id);
                con.query('SELECT full_name FROM users WHERE user_id=? ', [results[i].user_id], function(error, res, fields) {
                   
                    con.query('SELECT coursename FROM course WHERE course_id=?;', [results[i].course_id], function(error, res1, fields) {
                        
                        if(res.length>0){
                            results[i].fullname=res[0].full_name;
                        }
                            if(res1.length>0){
                            results[i].coursename=res1[0].coursename;
                            }
                           // console.log(results[i]);
                            if(i==results.length-1){
                            var data = {
                                status:'ok',
                                message:'success',
                                attendance:results
                            }
                            response.status(200).json(data);	
                            response.end();
                        }
    
                            
                            //console.log(results)
                            
                    }); 
                  
                });
            }
            
        }else{
            var data = {
				status: 'error',
                message:'no such id'
			};
            response.status(200).json(data);	
            response.end();
        }
        
    });
    
});
router.get('/getattendancebycourseid/:course_id',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.params.course_id;
    con.query('SELECT * FROM attendance WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var data = {
                status:'ok',
                message:'success',
                attendance:results
            }
            response.status(200).json(data);		
            response.end();
        }else{
            var data = {
				status: 'error',
                message:'no such id'
			};
            response.status(200).json(data);		
            response.end();
        }
        
    });
    
});
router.post('/poststart',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var user_id=request.body.user_id;
    var course_id=request.body.course_id;
    var created_by=global.logged_user_name;
    con.query('INSERT INTO `attendance` (`user_id`,`course_id`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?);', [user_id,course_id,created_by,created_by], function(err, results, fields) {
		console.log(results);
		if (err) throw err;
        con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
        var id=results[0]['LAST_INSERT_ID()'];
		var data = {
            status:'ok',
            message:"session started",
            attendance_id:id
        };
        response.status(200).json(data);		
		response.end();
        });
		
	}); 
    
});
router.post('/postend',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var score=request.body.score;
    var attendance_id=request.body.attendance_id;
    var created_by=global.logged_user_name;
    con.query('UPDATE attendance SET score=?,updated_by=? WHERE attendance_id=?', [score,created_by,attendance_id], function(err, results, fields) {
		console.log(results);
		if (err) throw err;
		var data = {
            status:'ok',
            message:"session ended",
            attendance_id:attendance_id
        };
        response.status(200).json(data);		
		response.end();
	}); 
    
});
/*
router.put('/modifyinfo/:sc_id', (req, res) => {
    var sc_id = req.params.sc_id
    var about_pnu;
    var about_program;
    var contacts;
    var updated_by=global.logged_user_name;
    con.query('SELECT * FROM static_content WHERE sc_id=?',[sc_id], function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            console.log(results);	
            about_pnu=results[0].about_pnu;
            about_program=results[0].about_program;
            contacts=results[0].contacts;
            if(req.body.about_pnu){
                about_pnu=req.body.about_pnu
            }
            if(req.body.about_program){
                about_program=req.body.about_program
            }
            if(req.body.contacts){
                contacts=req.body.contacts
            }
            console.log(contacts)
            console.log(contacts)
            con.query('UPDATE static_content SET about_pnu=?,about_program=?,contacts=?,updated_by=? WHERE sc_id=?', [about_pnu,about_program,contacts,updated_by,sc_id], function(error, res, fields) {
                console.log("updated")		
                    
            });
            res.status(200).json("updated sc_id!")
            res.end();
        }else {
            res.status(200).json("incorrect sc_id!")
            res.end();
        }
        
    });
    
   
});
router.delete('/deleteinfo/:sc_id', (req, res) => {
var sc_id = req.params.sc_id
con.query('DELETE FROM static_content WHERE sc_id=?',[sc_id], function(error, results, fields) {
    if (error) throw error;
    console.log(results);
    if(results.affectedRows>0){	
        res.status(200).json("Deleted Successfully");		
        res.end();
    }else{
        res.status(200).json("not found");		
        res.end();
    }
    
});


});*/
module.exports = router
