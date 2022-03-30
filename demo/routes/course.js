const express = require("express");
var mysql = require('mysql2');
const auth = require("./authentication");
const fs = require('fs');
const router =express.Router();
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});
/*
router.get('/getcourseimage/:course_id',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
	var course_id=request.params.course_id;
    con.query('SELECT * FROM attachment WHERE id=?',[course_id], function(error, results, fields) {
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
            response.status(200).json(data);		
            response.end();
        }
        
    });
    
});*/
router.get('/getcourse',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    
    con.query('SELECT * FROM course', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			
			for(let i = 0; i < results.length; i++){
			con.query('Select * from local where id=? and language=? and( code=?  or code=? or code=?);',[results[i].course_id,"arabic","coursename","description","info"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
				//console.log(results[i].course_id);
				con.query('SELECT * FROM attachment WHERE id=?',[results[i].course_id], function(error, res, fields) {
					if (error) throw error;
					if(res.length>0){
			
						const contents = fs.readFileSync(res[0].photo, {encoding: 'base64'});
						//console.log(contents)
						results[i].image=contents;
					}
					con.query('SELECT * FROM attendance WHERE course_id=?',[results[i].course_id], function(error, res1, fields) {
						results[i].coursenamear=res2[0].description;
						results[i].descriptionar=res2[1].description;
						results[i].infoar=res2[2].description;
						results[i].count=res1.length;
						//console.log(res1);
						var score=0;
						var y=0;
						for(let x = 0; x < res1.length; x++){
							if(res1[x].score!=null){
							score+=parseInt(res1[x].score);
							y+=1;
							}
						}
						//console.log(score);
						score = score/y;
						score=score || 0;
						console.log(score);
						results[i].score=Math.round(score);
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
					
			});
		
	}
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
router.get('/getcoursebyid/:course_id/:language',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.params.course_id;
    var language=request.params.language;
    con.query('SELECT * FROM course WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			
			for(let i = 0; i < results.length; i++){
			con.query('Select * from local where id=? and language=? and( code=?  or code=? or code=?);',[results[i].course_id,language,"coursename","description","info"], function(error, res2, fields) {
				  if (error) throw error;
				console.log(results[i].course_id,language)
				console.log(res2)
				if(res2.length>0){
			console.log(results.length,i,results[i].course_id);
				con.query('SELECT * FROM attachment WHERE id=?',[results[i].course_id], function(error, res, fields) {
					if (error) throw error;
					if(res.length>0){
			
						const contents = fs.readFileSync(res[0].photo, {encoding: 'base64'});
						//console.log(contents)
						results[i].image=contents;
					}
					con.query('SELECT * FROM attendance WHERE course_id=?',[results[i].course_id], function(error, res1, fields) {
						results[i].count=res1.length;
						results[i]['coursename']=res2[0].description;
						results[i]['description']=res2[1].description;
						results[i]['info']=res2[2].description;
						results[i]['language']=res2[0].language;
						//console.log(results[i]['coursename'],results[i].description);
						//console.log(res1);
						var score=0;
						var y=0;
						for(let x = 0; x < res1.length; x++){
							if(res1[x].score!=null){
							score+=parseInt(res1[x].score);
							y+=1;
							}
						}
						//console.log(score);
						score = score/y;
						score=score || 0;
						console.log(score);
						results[i].score=Math.round(score);
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
					
			});	
	    }
		});	
		}
        }else{
			var data = {
				status: 'error',
				message:'no courses'
			};
            response.status(200).json(data);		
            response.end();
        }
        
    });
    
});
router.get('/getcoursebylang/:language',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var language=request.params.language;
    con.query('SELECT * FROM course', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			
			for(let i = 0; i < results.length; i++){
			con.query('Select * from local where id=? and language=? and( code=?  or code=? or code=?);',[results[i].course_id,language,"coursename","description","info"], function(error, res2, fields) {
				 if (error) throw error;
				console.log(results[i].course_id,language)
				console.log(res2)
				if(res2.length>0){
			console.log(results.length,i,results[i].course_id);
				con.query('SELECT * FROM attachment WHERE id=?',[results[i].course_id], function(error, res, fields) {
					if (error) throw error;
					if(res.length>0){
			
						const contents = fs.readFileSync(res[0].photo, {encoding: 'base64'});
						//console.log(contents)
						results[i].image=contents;
					}
					con.query('SELECT * FROM attendance WHERE course_id=?',[results[i].course_id], function(error, res1, fields) {
						results[i].count=res1.length;
						results[i]['coursename']=res2[0].description;
						results[i]['description']=res2[1].description;
						results[i]['info']=res2[2].description;
						results[i]['language']=res2[0].language;
						//console.log(results[i]['coursename'],results[i].description);
						//console.log(res1);
						var score=0;
						var y=0;
						for(let x = 0; x < res1.length; x++){
							if(res1[x].score!=null){
							score+=parseInt(res1[x].score);
							y+=1;
							}
						}
						//console.log(score);
						score = score/y;
						score=score || 0;
						console.log(score);
						results[i].score=Math.round(score);
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
					
			});	
	    }
		});	
		}
        }else{
			var data = {
				status: 'error',
				message:'no courses'
			};
            response.status(200).json(data);		
            response.end();
        }
        
    });
    
});
router.get('/getattr',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    
    con.query('SELECT attr1,attr2,attr3 FROM course', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
				if(i==results.length-1){
					var data ={
						status:'ok',
						message:'success',
						data:results
					}
					response.status(200).json(data);		
					response.end();
				}
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
router.put('/modifyattr/:course_id',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var course_id = req.params.course_id
    var attr1 = req.body.attr1;
    var attr2 = req.body.attr2;
    var attr3 = req.body.attr3;
    var updated_by = global.logged_user_name;
        
	con.query('UPDATE course SET attr1=?,attr2=?,attr3=?,updated_by=? WHERE course_id=?', [attr1,attr2,attr3,updated_by,course_id], function(error, res, fields) {
		console.log("updated",attr1,attr2,attr3,course_id,error)		
			
	});
	var data = {
		status: 'ok',
		message:'updated course_id!'
	};
	res.status(200).json(data)
	res.end();
    
    
   
});
router.post('/postcourse',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var coursename = request.body.coursename;
    var description = request.body.description;
    var info = request.body.info;
    var coursenamear = request.body.coursenamear;
    var descriptionar = request.body.descriptionar;
    var infoar = request.body.infoar;
    var language = request.body.language;
    var created_by = global.logged_user_name;
	var base64String = request.body.base64String;
    con.query('INSERT INTO `course` (`coursename`,`description`, `info`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [coursename,description,info,"English",created_by,created_by], function(err, results, fields) {
		console.log("post course");
		if (err) throw err;
	}); 
    con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
        var id=results[0]['LAST_INSERT_ID()'];
		if (err) throw err;
        var base64Data = base64String.replace(/^data:image\/png;base64,/, "");
        var filename="/var/www/demo/data/course_pictures/"+id+".png";
        require("fs").writeFile(filename, base64Data, 'base64', function(err) {
        console.log(err);
        });

        con.query('INSERT INTO `attachment` (`id`,`photo`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?);', [id, filename,created_by,created_by], function(err, results, fields) {
            
            //console.log(results);
            if (err) throw err;
        }); 
		con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [id,"coursename",coursename,"English",created_by,created_by], function(err, results, fields) {
			console.log("post en1");
			if (err) throw err;
		}); 
		con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [id,"description",description,"English",created_by,created_by], function(err, results, fields) {
			console.log("post en2");
			if (err) throw err;
		}); 
		con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [id,"info",info,"English",created_by,created_by], function(err, results, fields) {
			console.log("post en3");
			if (err) throw err;
		}); 
		con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [id,"coursename",coursenamear,"Arabic",created_by,created_by], function(err, results, fields) {
			console.log("post ar1");
			if (err) throw err;
		}); 
		con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [id,"description",descriptionar,"Arabic",created_by,created_by], function(err, results, fields) {
			console.log("post ar2");
			if (err) throw err;
		}); 
		con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [id,"info",infoar,"Arabic",created_by,created_by], function(err, results, fields) {
			console.log("post ar3");
			if (err) throw err;
		}); 
	});
    var data = {
        status: 'ok',
        message:'course created',
        coursename:coursename,
        language:language
    };
    response.status(200).json(data);		
    response.end();
    
    
});

router.put('/modifycourse/:course_id',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var course_id = req.params.course_id
    var coursename;
    var description;
    var info;
    var coursenamear;
    var descriptionar;
    var infoar;
    var updated_by=global.logged_user_name;
	var base64String;
    con.query('SELECT * FROM course WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            console.log(results);	
            coursename=results[0].coursename;
            description=results[0].description;
            info=results[0].info;
            if(req.body.coursename){
                coursename=req.body.coursename
            }
            if(req.body.description){
                description=req.body.description
            }
            if(req.body.info){
                info=req.body.info
            }
            if(req.body.coursenamear){
                coursenamear=req.body.coursenamear
            }
            if(req.body.descriptionar){
                descriptionar=req.body.descriptionar
            }
            if(req.body.infoar){
                infoar=req.body.infoar
            }
            if(req.body.base64String){
                base64String=req.body.base64String;
                var base64Data = base64String.replace(/^data:image\/png;base64,/, "");
                var filename="/var/www/demo/data/course_pictures/"+course_id+".png";
                require("fs").writeFile(filename, base64Data, 'base64', function(err) {
                console.log(err);
                con.query('UPDATE attachment SET photo=?, updated_by=? WHERE id=?', [filename,updated_by,course_id], function(err, results, fields) {
					console.log(results);
					if (err) throw err;
					console.log("signup successful!");
				});
        });

            }
            con.query('UPDATE course SET coursename=?,description=?,info=?,updated_by=? WHERE course_id=?', [coursename,description,info,updated_by,course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated course")			
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [coursename,updated_by,"coursename","English",course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated en1")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [description,updated_by,"description","English",course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated en2")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [info,updated_by,"info","English",course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated en3")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [coursenamear,updated_by,"coursename","Arabic",course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated ar1")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [descriptionar,updated_by,"description","Arabic",course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated ar2")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [infoar,updated_by,"info","Arabic",course_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated ar3")		
                    
            });
            var data = {
				status: 'ok',
                message:'updated course_id!',
                course_id:course_id
			};
            res.status(200).json(data)
            res.end();
        }else {
            var data = {
				status: 'error',
                message:'incorrect course_id!'
			};
            res.status(200).json(data)
            res.end();
        }
        
    });
    
   
});

router.delete('/deletecourse/:course_id',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
var course_id = req.params.course_id
con.query('DELETE FROM course WHERE course_id=?',[course_id], function(error, results, fields) {
    if (error) throw error;
        var status=0;
        if (error) throw error;
        if(results.affectedRows<1){
            status++;
        }
		con.query('SELECT * FROM attachment WHERE id=?',[course_id], function(error, results, fields) {
			//console.log(results);
			if (error) throw error;
			if(results.length>0)
			{
				fs.unlink(results[0].photo, function (err) {
				if (err) throw err;
				// if no error, file has been deleted successfully
				console.log('File deleted!');
				});
			}else{
				status++;
			}
		});
		con.query('DELETE FROM attachment WHERE id=?',[course_id], function(error, results, fields) {
			if (error) throw error;
			//console.log(results);
			if(results.affectedRows<1){
				status++;
			}
			
		});
		if(	status==0){
            var data = {
				status: 'ok',
                message:'Deleted Successfully!'
			};
            res.status(200).json(data)	
			res.end();
		}else{
            var data = {
				status: 'error',
                message:'error'
			};
            res.status(200).json(data);	
			res.end();
		}
		
    
});


});
module.exports = router
