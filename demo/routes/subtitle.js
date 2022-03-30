const express = require("express");
var mysql = require('mysql2');
const fs = require('fs');
const router =express.Router();
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});

router.get('/getsubtitlebyid/:sub_id/:language',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var sub_id=request.params.sub_id;
    var language=request.params.language;
    con.query('SELECT * FROM subtitle WHERE sub_id=?',[sub_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			con.query('Select * from local where id=? and language=? and( code=? );',[results[0].sub_id,language,"subtitle"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
					results[0]['subtitle']=res2[0].description;
					results[0]['language']=res2[0].language;
			
					
					var data={
							status:'ok',
							message:'success',
							subtitle:results
							}
					response.status(200).json(data);		
					response.end();
			}
		});
            
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
router.get('/getsubtitlebycourseid/:course_id/:language',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.params.course_id;
    var language=request.params.language;
    con.query('SELECT * FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
			con.query('Select * from local where id=? and language=? and( code=? );',[results[i].sub_id,language,"subtitle"], function(error, res2, fields) {
				  if (error) throw error;
				if(res2.length>0){
					results[i]['subtitle']=res2[0].description;
					results[i]['language']=res2[0].language;
								
					
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
router.post('/getsubtitlebycourseid',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.body.course_id;
    con.query('SELECT * FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
			con.query('Select * from local where id=? and( code=? );',[results[i].sub_id,"subtitle"], function(error, res2, fields) {
				  if (error) throw error;
				if(res2.length>0){
					for(let x = 0; x < res2.length; x++){
						if(res2[x].language=="English"){
							results[i].subtitle=res2[x].description;
						}
						if(res2[x].language=="Arabic"){
							results[i].subtitlear=res2[x].description;
						}
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
			}
		});
					delete results[i].sub_id;	
					delete results[i].course_id;
					delete results[i].language;	
					delete results[i].created_by;	
					delete results[i].creation_date;	
					delete results[i].updated_by;	
					delete results[i].updated_date;
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
router.post('/postsubtitle',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id = request.body.course_id;
    var subtitle = request.body.subtitle;
    var created_by = global.logged_user_name;
			
		for(let i = 0; i < subtitle.length; i++){
			con.query('INSERT INTO `subtitle` ( `course_id`, `subtitle`, `language`, `start_time`, `end_time`, `created_by`, `updated_by`) VALUES ( ?,?,?,?,?, ?, ?);', [course_id,subtitle[i].subtitle,"English",subtitle[i].start_time,subtitle[i].end_time,created_by,created_by], function(err, results, fields) {
				console.log("post q",i);
				if (err) throw err;
			});
			con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
				if (err) throw err;
				var qid=results[0]['LAST_INSERT_ID()'];
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"subtitle",subtitle[i].subtitle,"English",created_by,created_by], function(err, results, fields) {
					//console.log("post en1");
					if (err) throw err;
				});
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"subtitle",subtitle[i].subtitlear,"Arabic",created_by,created_by], function(err, results, fields) {
					//console.log("post ar1");
					if (err) throw err;
				});
			});
			
			
		}
	
    var data = {
        status: 'ok',
        message:'subtitle posted successfully!',
        course_id:course_id
    };

    response.status(200).json(data);		
    response.end();
    
    
    
    
});
router.post('/modifysubtitle', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var subtitle = req.body.subtitle;
    var created_by = global.logged_user_name;
	var course_id = req.body.course_id;
	//console.log("deleting...");
    con.query('SELECT * FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
				con.query('DELETE FROM local where local_id <> "" AND local_id IN (SELECT * FROM (Select local_id FROM local WHERE id=? AND code ="subtitle") AS temp);',[results[i].sub_id], function(error, re, fields) {
					if (error) throw error;
					console.log(re);
				});
			}
			con.query('DELETE FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
				if (error) throw error;
			});
			for(let i = 0; i < subtitle.length; i++){
			con.query('INSERT INTO `subtitle` ( `course_id`, `subtitle`, `language`, `start_time`, `end_time`, `created_by`, `updated_by`) VALUES ( ?,?,?,?,?, ?, ?);', [course_id,subtitle[i].subtitle,"English",subtitle[i].start_time,subtitle[i].end_time,created_by,created_by], function(err, results, fields) {
				console.log("post q",i);
				if (err) throw err;
			});
			con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
				if (err) throw err;
				var qid=results[0]['LAST_INSERT_ID()'];
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"subtitle",subtitle[i].subtitle,"English",created_by,created_by], function(err, results, fields) {
					//console.log("post en1");
					if (err) throw err;
				});
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"subtitle",subtitle[i].subtitlear,"Arabic",created_by,created_by], function(err, results, fields) {
					//console.log("post ar1");
					if (err) throw err;
				});
			});
			
		}
			
		}
	
    var data = {
        status: 'ok',
        message:'subtitle posted successfully!',
        course_id:course_id
    };

    res.status(200).json(data);		
    res.end();
	});
	
});
/*
router.put('/modifysubtitle', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var course_id = req.body.course_id;
    var subtitle = req.body.subtitle;
    var created_by = global.logged_user_name;
    var updated_by = global.logged_user_name;
    con.query('SELECT * FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
			console.log(results.length,subtitle.length)
        if (results.length ==subtitle.length) {
            for(let i = 0; i < subtitle.length; i++){
				con.query('UPDATE `subtitle` SET `subtitle`=?, `start_time`=?, `end_time`=? WHERE `sub_id`=?;',[subtitle[i].subtitle,subtitle[i].start_time,subtitle[i].end_time,results[i].sub_id], function(error, re, fields) {
					if (error) throw error;
				});
				con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [subtitle[i].subtitle,updated_by,"subtitle","English",results[i].sub_id], function(error, res, fields) {
							if (error) throw error;
							console.log("updated en1")		
				});
				con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [subtitle[i].subtitlear,updated_by,"subtitle","Arabic",results[i].sub_id], function(error, res, fields) {
							if (error) throw error;
							console.log("updated ar1")		
				});
				
				//con.query('SELECT * FROM local WHERE id=? and code="subtitle"',[results[i].sub_id], function(error, res, fields) {
					//var eid;
					//var aid;
					//if (error) throw error;
					//if (res.length > 0) {
						//for(let x = 0; x < res.length; x++){
							//if(res[x].language=="Arabic"){
								//aid=res[x].local_id;
							//}
							
							//if(res[x].language=="English"){
								//eid=res[x].local_id;
							//}
						//}
						
						
					//}
				//});
				

			}
            var data = {
				status: 'ok',
                message:"Updated successfully"
			};
            res.status(200).json(data);		
            res.end();
        }else {
            var data = {
				status: 'error',
                message:"error in subtitle"
			};
            res.status(200).json(data);		
            res.end();
        }
        
    });
    
   
});*/
router.delete('/deletesubtitle/:course_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
	var course_id = req.params.course_id;
	//console.log("deleting...");
    con.query('SELECT * FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
				con.query('DELETE FROM local where local_id <> "" AND local_id IN (SELECT * FROM (Select local_id FROM local WHERE id=? AND code ="subtitle") AS temp);',[results[i].sub_id], function(error, re, fields) {
					if (error) throw error;
					console.log(re);
				});
			}
			con.query('DELETE FROM subtitle WHERE course_id=?',[course_id], function(error, results, fields) {
				if (error) throw error;
			});
			

            var data = {
				status: 'ok',
                message:"deleted successfully"
			};
            res.status(200).json(data);		
            res.end();
		}else{
			

            var data = {
				status: 'error',
                message:"no subs"
			};
            res.status(200).json(data);		
            res.end();
			}
	});


});

module.exports = router
