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

router.get('/getquestionbyid/:question_id/:language',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var question_id=request.params.question_id;
    var language=request.params.language;
    con.query('SELECT * FROM question WHERE question_id=? and is_active=1',[question_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			con.query('Select * from local where id=? and language=? and( code=? );',[results[0].question_id,language,"question"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
					results[0]['question']=res2[0].description;
					results[0]['language']=res2[0].language;
				con.query('SELECT * FROM choices WHERE question_id=? and is_active=1',[results[0].question_id], function(error, res, fields) {
					
					if (error) throw error;
					if(res.length>0){
					for(let i = 0; i < res.length; i++){
					
					con.query('Select * from local where id=? and language=? and( code=? );',[res[i].choices_id,language,"choices"], function(error, res3, fields) {
						if (error) throw error;
						if(res3.length>0){
							console.log(i,language,res3[0].description)
							
							res[i]['choices']=res3[0].description;
							res[i]['language']=res3[0].language;
							if(i==res.length-1){
								var data={
									status:'ok',
									message:'success',
									questions:results,
									choices:res
								}
								response.status(200).json(data);		
								response.end();
							}
							
							}
							
						});
					}	
							}else{
								var data={
									status:'error',
									message:'no choice',
									questions:results,
									choices:""
								}
								
							response.status(200).json(data);		
							response.end();
							}
						
			
			});
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
router.post('/getqc',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.body.course_id;
    var timefrom=request.body.timefrom;
    var timeto=request.body.timeto;
        var language="Arabic";
    con.query('SELECT * FROM question WHERE course_id=? and is_active=1',[course_id], function(error, results, fields) {
        if (error) throw error;
        question=results;

        if(results.length>0){
			for(let x = 0; x < results.length; x++){
			con.query('Select * from local where id=? and language=? and( code=? );',[results[x].question_id,language,"question"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
					results[x].questionar=res2[0].description;
				con.query('SELECT * FROM choices WHERE question_id=? and is_active=1',[results[x].question_id], function(error, res, fields) {
					
					if (error) throw error;
					if(res.length>0){
					for(let i = 0; i < res.length; i++){
					
					con.query('SELECT question_id,choices_id, COUNT(*) FROM PNU.answer where course_id=? and updated_date between ? and ? GROUP BY question_id, choices_id;',[course_id,timefrom,timeto], function(error, re, fields) {
						if (error) throw error;
						con.query('Select * from local where id=? and language=? and( code=? );',[res[i].choices_id,language,"choices"], function(error, res3, fields) {							
							if (error) throw error;
							if(res3.length>0){
								//console.log(i,language,res3[0].description)
								res[i].choicesar=res3[0].description;
								res[i].count=0
								for(let y = 0; y < re.length; y++){
									if(results[x].question_id==re[y].question_id && res[i].choices_id==re[y].choices_id  ){
										res[i].count=re[y]["COUNT(*)"];
									}
								}
								results[x].choices=res;
								if(x==results.length-1 && i==res.length-1){
									var data={
										status:'ok',
										message:'success',
										questions:results
									}
									response.status(200).json(data);		
									response.end();
								}
								
								}
													
							});
							
						});
					}	
							}else{
								var data={
									status:'error',
									message:'no choice',
									questions:results,
									choices:""
								}
								
							response.status(200).json(data);		
							response.end();
							}
						
			
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
router.delete('/deletequestion/:course_id',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
	var course_id = req.params.course_id;
	//console.log("deleting...");
    con.query('SELECT * FROM question WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
				con.query('update question set is_active=0 where question_id=?',[results[i].question_id], function(error, re, fields) {
					if (error) throw error;
					console.log(re);
				});
			}
			

            var data = {
				status: 'ok',
                message:"deleted successfully"
			};
            res.status(200).json(data);		
            res.end();
		}else{
			

            var data = {
				status: 'error',
                message:"no questions"
			};
            res.status(200).json(data);		
            res.end();
			}
	});
		
    
});
router.post('/modifyquestion',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
	var course_id = req.body.course_id;
    var question = req.body.question;
    var language = "English";
    var created_by = global.logged_user_name;
    var updated_by = global.logged_user_name;
	//console.log("deleting...");
	var array1=new Array();
    con.query('SELECT * FROM question WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			var array2=new Array();
			for(let a = 0; a < question.length; a++){
				array1.push(question[a].question_id);
				if(question[a].question_id=="a"){
					console.log("new")
				}
				
			}
			for(let b = 0; b < results.length; b++){
				/*if(results[i].question_id==question[a].question_id){
					console.log(results[i].question_id)
					}*/
				array2.push(results[b].question_id);
					
			}
			var array4 = array2.filter(function(obj) { return array1.indexOf(obj) == -1; });//delete
			var array3 = array1.filter(function(obj) { return array2.indexOf(obj) != -1; });//modify
			console.log("q",array1)
			console.log("r",array2)
			console.log("rd",array4)
			console.log("d",array3)
			
			for(let i = 0; i < array4.length; i++){
				con.query('update question set is_active=0 where question_id=?',[array4[i]], function(error, re, fields) {
					if (error) throw error;
					//console.log(re);
				});
			}
		
		
		console.log("done deleting")
		for(let y=0; y < question.length; y++){
			for(let i = 0; i < array3.length; i++){
				if(question[y].question_id==array3[i]){					
					con.query('SELECT * FROM choices WHERE question_id=? and is_active=1',[question[y].question_id], function(error, resu, fields) {
						var array5= new Array();
						var array6= new Array();
						for(let a = 0; a < question[y].choices.length; a++){
							array5.push(question[y].choices[a].choices_id);
							
						}
						for(let b = 0; b < resu.length; b++){
							/*if(results[i].question_id==question[a].question_id){
								console.log(results[i].question_id)
								}*/
							array6.push(resu[b].choices_id);
								
						}
						
						var array7 = array6.filter(function(obj) { return array5.indexOf(obj) == -1; });//delete
						var array8 = array6.filter(function(obj) { return array5.indexOf(obj) != -1; });//modify
						console.log("qc",array5)
						console.log("rc",array6)
						console.log("rdc",array7)
						console.log("dc",array8)
						for(let c=0; c < array7.length; c++){
							con.query('UPDATE `choices` SET `is_active`=0 WHERE `choices_id`=?;', [array7[c]], function(err, results, fields) {
									
									if (err) throw err;
								});
							
						}
						
						for(let z=0; z < question[y].choices.length;z++){
							if(question[y].choices[z].choices_id=="new"){
								con.query('INSERT INTO `choices` (`question_id`,`choices`,`score`,`is_correct`,`language`, `is_active`,`created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?,?,?,?);', [question[y].question_id, question[y].choices[z].choices,question[y].choices[z].score,question[y].choices[z].is_correct,"English",true,created_by,created_by], function(err, results, fields) {
									
									if (err) throw err;
								});
								con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
									if (err) throw err;
									var cid=results[0]['LAST_INSERT_ID()'];
									con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[y].choices[z].choices,"English",created_by,created_by], function(err, results, fields) {
										//console.log("post en1");
										if (err) throw err;
									});
									con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[y].choices[z].choicesar,"Arabic",created_by,created_by], function(err, results, fields) {
										//console.log("post ar1");
										if (err) throw err;
									});
									
								});
								
							}
							for(let t=0; t < array8.length;t++){
								if(question[y].choices[z].choices_id==array8[t]){
									con.query('UPDATE `choices` SET `choices`=?,`is_correct`=?, `score`=?,`updated_by`=? WHERE `choices_id`=?', [question[y].choices[z].choices,question[y].choices[z].is_correct,question[y].choices[z].score,created_by,question[y].choices[z].choices_id], function(err, results, fields) {
										console.log("modify c");
										if (err) throw err;
									});
									con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [question[y].choices[z].choices,updated_by,"choices","English",question[y].choices[z].choices_id], function(error, res, fields) {
										if (error) throw error;
										console.log("updated en1")		
											
									});
									con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [question[y].choices[z].choicesar,updated_by,"choices","Arabic",question[y].choices[z].choices_id], function(error, res, fields) {
										if (error) throw error;
										console.log("updated ar1")		
											
									});
								}
							}
					}
				});
					con.query('UPDATE `question` SET `question`=?, `time`=?,`updated_by`=? WHERE `question_id`=?', [question[y].question,question[y].time,created_by,question[y].question_id], function(err, results, fields) {
						console.log("modify q");
						if (err) throw err;
					});
					con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [question[y].question,updated_by,"question","English",question[y].question_id], function(error, res, fields) {
						if (error) throw error;
						console.log("updated en1")		
							
					});
					con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [question[y].questionar,updated_by,"question","Arabic",question[y].question_id], function(error, res, fields) {
						if (error) throw error;
						console.log("updated ar1")		
							
					});
					
					
				}
			}
		}
		
		console.log("done modify")
		
	
		for(let i = 0; i < question.length; i++){
			if(question[i].question_id=="new"){
				con.query('INSERT INTO `question` (`course_id`,`question`, `language`, `time`,`is_active`,`created_by`,`updated_by`) VALUES ( ?,?, ?, ?, ?,?,?);', [course_id,question[i].question,language,question[i].time,"1",created_by,created_by], function(err, results, fields) {
					console.log("post q",i);
					if (err) throw err;
				});
				con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
					if (err) throw err;
					var qid=results[0]['LAST_INSERT_ID()'];
					con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"question",question[i].question,"English",created_by,created_by], function(err, results, fields) {
						//console.log("post en1");
						if (err) throw err;
					});
					con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"question",question[i].questionar,"Arabic",created_by,created_by], function(err, results, fields) {
						//console.log("post ar1");
						if (err) throw err;
					});
					for(let x = 0; x < question[i]["choices"].length; x++){
						con.query('INSERT INTO `choices` (`question_id`,`choices`,`score`,`is_correct`,`language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?,?,?);', [qid, question[i].choices[x].choices,question[i].choices[x].score,question[i].choices[x].is_correct,language,created_by,created_by], function(err, results, fields) {
							console.log("post choice",x);
							if (err) throw err;
						});
						con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
							if (err) throw err;
							var cid=results[0]['LAST_INSERT_ID()'];
							con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[i].choices[x].choices,"English",created_by,created_by], function(err, results, fields) {
								//console.log("post en1");
								if (err) throw err;
							});
							con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[i].choices[x].choicesar,"Arabic",created_by,created_by], function(err, results, fields) {
								//console.log("post ar1");
								if (err) throw err;
							});
							
						});
						
					}
				});
				
			}
		}
		console.log("done inserting")
	
	
    var data = {
        status: 'ok',
        message:'question posted successfully!',
        course_id:course_id
    };

    res.status(200).json(data);		
    res.end();
	}
	});

		
    
});
router.post('/modifyquestion1',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
	var course_id = req.body.course_id;
    var question = req.body.question;
    var language = "English";
    var created_by = global.logged_user_name;
	//console.log("deleting...");
    con.query('SELECT * FROM question WHERE course_id=?',[course_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			for(let i = 0; i < results.length; i++){
				con.query('DELETE FROM local where local_id <> "" AND local_id IN (SELECT * FROM (Select local_id FROM local WHERE id=? AND code ="question") AS temp);',[results[i].question_id], function(error, re, fields) {
					if (error) throw error;
					console.log(re);
				});
			con.query('SELECT * FROM choices WHERE question_id=?',[results[i].question_id], function(error, res, fields) {
				if (error) throw error;
				if(res.length>0){
					for(let x = 0; x < res.length; x++){
						console.log(res[x].choices_id);
						con.query('DELETE FROM local where local_id <> "" AND local_id IN (SELECT * FROM (Select local_id FROM local WHERE id=? AND code ="choices") AS temp)',[res[x].choices_id], function(error, re, fields) {
							if (error) throw error;
						});
									
						con.query('DELETE FROM choices where choices_id=?;',[res[x].choices_id], function(error, re, fields) {
							if (error) throw error;
						});
					}
				}
			});
			}
			con.query('DELETE FROM question WHERE course_id=?',[course_id], function(error, results, fields) {
				if (error) throw error;
			});
		}
		
	console.log("done deleting")
			
		for(let i = 0; i < question.length; i++){
			con.query('INSERT INTO `question` (`course_id`,`question`, `language`, `time`,`is_active`,`created_by`,`updated_by`) VALUES ( ?,?, ?, ?, ?,?,?);', [course_id,question[i].question,language,question[i].time,"1",created_by,created_by], function(err, results, fields) {
				console.log("post q",i);
				if (err) throw err;
			});
			con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
				if (err) throw err;
				var qid=results[0]['LAST_INSERT_ID()'];
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"question",question[i].question,"English",created_by,created_by], function(err, results, fields) {
					//console.log("post en1");
					if (err) throw err;
				});
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"question",question[i].questionar,"Arabic",created_by,created_by], function(err, results, fields) {
					//console.log("post ar1");
					if (err) throw err;
				});
				for(let x = 0; x < question[i]["choices"].length; x++){
					con.query('INSERT INTO `choices` (`question_id`,`choices`,`score`,`is_correct`,`language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?,?,?);', [qid, question[i].choices[x].choices,question[i].choices[x].score,question[i].choices[x].is_correct,language,created_by,created_by], function(err, results, fields) {
						console.log("post choice",x);
						if (err) throw err;
					});
					con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
						if (err) throw err;
						var cid=results[0]['LAST_INSERT_ID()'];
						con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[i].choices[x].choices,"English",created_by,created_by], function(err, results, fields) {
							//console.log("post en1");
							if (err) throw err;
						});
						con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[i].choices[x].choicesar,"Arabic",created_by,created_by], function(err, results, fields) {
							//console.log("post ar1");
							if (err) throw err;
						});
						
					});
					
				}
			});
			
			
		}
	
    var data = {
        status: 'ok',
        message:'question posted successfully!',
        course_id:course_id
    };

    res.status(200).json(data);		
    res.end();
		
	});
	
		
    
});
router.post('/getquestionbycourseid/',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.body.course_id;
    var language="Arabic";
    con.query('SELECT * FROM question WHERE course_id=? and is_active=1',[course_id], function(error, results, fields) {
        if (error) throw error;
        question=results;

        if(results.length>0){
			for(let x = 0; x < results.length; x++){
			con.query('Select * from local where id=? and language=? and( code=? );',[results[x].question_id,language,"question"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
					results[x].questionar=res2[0].description;
				con.query('SELECT * FROM choices WHERE question_id=? and is_active=1',[results[x].question_id], function(error, res, fields) {
					var checkce=0
					if (error) throw error;
					if(res.length==0){
						res=[{
							"choices_id":"0"
							
						}
						]
						checkce=1
					}
					//if(res.length>0){
					for(let i = 0; i < res.length; i++){
					
					con.query('Select * from local where id=? and language=? and( code=? );',[res[i].choices_id,language,"choices"], function(error, res3, fields) {
						if (error) throw error;
						//if(res3.length>0){
						if(checkce==0){
							console.log(i,language,res3[0].description)
							res[i].choicesar=res3[0].description;
							delete res[i].question_id;
							delete res[i].language;
							delete res[i].created_by;
							delete res[i].creation_date;
							delete res[i].updated_by;
							delete res[i].updated_date;	
							
							results[x].choices=res;
						}else{
							
							results[x].choices="";
						}
							if(x==results.length-1 && i==res.length-1){	
					delete results[x].course_id;
					delete results[x].language;	
					delete results[x].created_by;	
					delete results[x].creation_date;	
					delete results[x].updated_by;	
					delete results[x].updated_date;
								var data={
									status:'ok',
									message:'success',
									questions:results
								}
								response.status(200).json(data);		
								response.end();
							}
						
							//}
							
						});
					}
					delete results[x].course_id;
					delete results[x].language;	
					delete results[x].created_by;	
					delete results[x].creation_date;	
					delete results[x].updated_by;	
					delete results[x].updated_date;		
							//}
						
			
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
router.get('/getquestionbycourseid/:course_id/:language',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id=request.params.course_id;
    var language=request.params.language;
    con.query('SELECT * FROM question WHERE course_id=? and is_active=1',[course_id], function(error, results, fields) {
        if (error) throw error;
        question=results;

        if(results.length>0){
			for(let x = 0; x < results.length; x++){
			con.query('Select * from local where id=? and language=? and( code=? );',[results[x].question_id,language,"question"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
					results[x]['question']=res2[0].description;
					results[x]['language']=res2[0].language;
				con.query('SELECT * FROM choices WHERE question_id=? and is_active=1',[results[x].question_id], function(error, res, fields) {
					
					if (error) throw error;
					//if(res.length>0){
					var checkce=0
					if(res.length==0){
						res=[{
							"choices_id":"0"
							
						}
						]
						checkce=1
					}
					for(let i = 0; i < res.length; i++){
					
					con.query('Select * from local where id=? and language=? and( code=? );',[res[i].choices_id,language,"choices"], function(error, res3, fields) {
						if (error) throw error;
						//if(res3.length>0){
							//console.log(i,language,res3[0].description)
							if(checkce==0){
								res[i]['choices']=res3[0].description;
								res[i]['language']=res3[0].language;
								results[x].choices=res;
						}else{
							
								results[x].choices="";
						}
							if(x==results.length-1 && i==res.length-1){
								var data={
									status:'ok',
									message:'success',
									questions:results
								}
								response.status(200).json(data);		
								response.end();
							}
							
							//}
							
						});
					}	
							//}
						
			
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
router.get('/getquestionbylang/:language',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var language=request.params.language;
    con.query('SELECT * FROM question WHERE language=?',[language], function(error, results, fields) {
        if (error) throw error;
        question=results;
        if(results.length>0){
            con.query('SELECT * FROM choices WHERE question_id=?',[results[0].question_id], function(error, results, fields) {
                if (error) throw error;
                if(results.length>0){
                    var data={
                        status:'ok',
                        message:'success',
                        questions:question,
                        choices:results
                    }
                }else{
                    var data={
                        status:'error',
                        message:'no choice',
                        questions:question,
                        choices:""
                    }
                }
                response.status(200).json(data);		
                response.end();
            });
            
        }else{
            var data = {
				status: 'status',
                message:'no such language'
			};
            response.status(200).json(data);	
            response.end();
        }
        
    });
    
});
router.post('/postall',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id = request.body.course_id;
    var question = request.body.question;
    var language = "English";
    var created_by = global.logged_user_name;
			
		for(let i = 0; i < question.length; i++){
			con.query('INSERT INTO `question` (`course_id`,`question`, `language`, `time`,`created_by`,`updated_by`) VALUES ( ?,?, ?, ?, ?,?);', [course_id,question[i].question,language,question[i].time,created_by,created_by], function(err, results, fields) {
				console.log("post q",i);
				if (err) throw err;
			});
			con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
				if (err) throw err;
				var qid=results[0]['LAST_INSERT_ID()'];
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"question",question[i].question,"English",created_by,created_by], function(err, results, fields) {
					//console.log("post en1");
					if (err) throw err;
				});
				con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [qid,"question",question[i].questionar,"Arabic",created_by,created_by], function(err, results, fields) {
					//console.log("post ar1");
					if (err) throw err;
				});
				for(let x = 0; x < question[i]["choices"].length; x++){
					con.query('INSERT INTO `choices` (`question_id`,`choices`,`score`,`is_correct`,`language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?,?,?);', [qid, question[i].choices[x].choices,question[i].choices[x].score,question[i].choices[x].is_correct,language,created_by,created_by], function(err, results, fields) {
						console.log("post choice",x);
						if (err) throw err;
					});
					con.query('SELECT LAST_INSERT_ID();', function(err, results, fields) {
						if (err) throw err;
						var cid=results[0]['LAST_INSERT_ID()'];
						con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[i].choices[x].choices,"English",created_by,created_by], function(err, results, fields) {
							//console.log("post en1");
							if (err) throw err;
						});
						con.query('INSERT INTO `local` (`id`,`code`,`description`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [cid,"choices",question[i].choices[x].choicesar,"Arabic",created_by,created_by], function(err, results, fields) {
							//console.log("post ar1");
							if (err) throw err;
						});
						
					});
					
				}
			});
			
			
		}
	
    var data = {
        status: 'ok',
        message:'question posted successfully!',
        course_id:course_id
    };

    response.status(200).json(data);		
    response.end();
    
    
});
router.get('/getchoicesbyquestionid/:question_id',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var question_id=request.params.question_id;
    con.query('SELECT * FROM choices WHERE question_id=?',[question_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var data ={
                status:'ok',
                message:'success',
                choices:results
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
router.get('/getscorebyuserid/:user_id',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var user_id=request.params.user_id;
    con.query('SELECT * FROM answer WHERE user_id=?',[user_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var data={
                status:'ok',
                message:'success',
                score:results
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
router.post('/postquestion',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var course_id = request.body.course_id;
    var question = request.body.question;
    var language = request.body.language;
    var time = request.body.time;
    var created_by = global.logged_user_name;
    con.query('INSERT INTO `question` (`course_id`,`question`, `language`, `time`,`created_by`,`updated_by`) VALUES ( ?,?, ?, ?, ?,?);', [course_id,question,language,time,created_by,created_by], function(err, results, fields) {
		console.log(results);
		if (err) throw err;
	});
    var data = {
        status: 'ok',
        message:'question posted successfully!',
        course_id:course_id,
        language:language
    };

    response.status(200).json(data);		
    response.end();
    
    
});
router.post('/postchoices',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var question_id = request.body.question_id;
    var choices = request.body.choices;
    var score = request.body.score;
    var is_correct = request.body.is_correct;
    var language = request.body.language;
    var created_by = global.logged_user_name;
    con.query('INSERT INTO `choices` (`question_id`,`choices`,`score`,`is_correct`,`language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?,?,?);', [question_id, choices,score,is_correct,language,created_by,created_by], function(err, results, fields) {
        console.log(results);
        if (err) throw err;
    });

    var data = {
        status: 'ok',
        message:'choices posted successfully!',
        question_id:question_id,
        language:language
    };

    response.status(200).json(data);	
    response.end();
    
    
});
router.post('/postanswer',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var choices=request.body.choices;
    var user_id=request.body.user_id;
    var attendance_id=request.body.attendance_id;
    var course_id=request.body.course_id;
    var created_by = global.logged_user_name;
    var check=0;
    global.error=0;
    var score=0;
    if(!attendance_id){
		
            var data = {
				status: 'error',
                message:'no attendance_id'
			};
            response.status(200).json(data);			
            response.end();
	}else if(!user_id){
		
            var data = {
				status: 'error',
                message:'no user_id'
			};
            response.status(200).json(data);			
            response.end();
	}else if(!choices){
		
            var data = {
				status: 'error',
                message:'no choices'
			};
            response.status(200).json(data);			
            response.end();
	}else{
    
        con.query('SELECT question_id FROM question WHERE course_id=?',[course_id], function(error, results, fields) {
		
        if (error) throw error;
        if(results.length>0){

			
            for (let i = 0; i < choices.length; i++) {
				con.query('SELECT * FROM choices WHERE choices_id=? and question_id=?',[choices[i].answer,choices[i].question_id], function(error, res, fields) {
					if(res.length>0){
						con.query('INSERT INTO `answer` (`user_id`,`question_id`,`choices_id`,`course_id`,`score`, `created_by`,`updated_by`) VALUES (?,?,?,?, ?,?,?);', [user_id,choices[i].question_id,choices[i].answer,course_id,res[0].score,created_by,created_by], function(err, results, fields) {
							console.log(results);
							if (err) throw err;
						});
					
						score+=res[0].score
						console.log(score)
					
					if(i==choices.length-1 ){
						
						con.query('UPDATE attendance SET score=?,updated_by=? WHERE attendance_id=?', [score,created_by,attendance_id], function(err, results, fields) {
							console.log(results);
							if (err) throw err;
						});
						var data = {
							status: 'ok',
							message:'answer posted successfully!',
							total_questions:results.length,
							score:(score*100/(results.length*20))
						};
					
						response.status(200).json(data);			
						response.end();
						
						
					}
				}
					
				});
				
			}
		}else{
            var data = {
				status: 'error',
                message:'no course_id'
			};
            response.status(200).json(data);			
            response.end();
        }
	});
}
        
    
});
/*
router.post('/postanswer',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var choices_id=request.body.choices_id;
    var user_id=request.body.user_id;
    var attendance_id=request.body.attendance_id;
    var course_id=request.body.course_id;
    var created_by = global.logged_user_name;
    var check=0;
    global.error=0;
    var score=0;
    
    con.query('SELECT question_id FROM question WHERE course_id=?',[course_id], function(error, results, fields) {
		
        if (error) throw error;
        if(results.length>0){
			questions=results
			if(choices_id.length!=questions.length){
			
				var data = {
					status: 'error',
					message:'Please enter '+questions.length+' choices'
				};
				response.status(200).json(data);			
				response.end();
			}
            for (let i = 0; i < choices_id.length; i++) {
				
						console.log(error)
				con.query('SELECT * FROM choices WHERE choices_id=?',[choices_id[i]], function(error, res, fields) {
					if(res.length>0){
					choices=res
					//console.log(choices)
					for(let x=0; x<questions.length;x++){
						if(choices[0].question_id==questions[x].question_id){
							check+=1;
							
						}
					}
					if(check<1){
						error=1;
							var data = {
								status: 'error',
								message:'Please enter correct choices'
							};
							response.status(200).json(data);			
							response.end();
						throw error;
					}else{
						check=0;
						score+=choices[0].score
						console.log(score)
					}
					if(i==choices_id.length-1 ){
						con.query('INSERT INTO `answer` (`user_id`,`score`, `created_by`,`updated_by`) VALUES (?, ?,?,?);', [user_id,score,created_by,created_by], function(err, results, fields) {
							console.log(results);
							if (err) throw err;
						});
						con.query('UPDATE attendance SET score=?,updated_by=? WHERE attendance_id=?', [score,created_by,attendance_id], function(err, results, fields) {
							console.log(results);
							if (err) throw err;
						});
						var data = {
							status: 'ok',
							message:'answer posted successfully!',
							total_questions:questions.length,
							score:score
						};
					
						response.status(200).json(data);			
						response.end();
						
						
					}
				}
					
				});
				
			}
			
        }else{
            var data = {
				status: 'error',
                message:'no course question'
			};
            response.status(200).json(data);			
            response.end();
        }
        
    });
    
});
router.post('/postanswer',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var choices_id=request.body.choices_id;
    var user_id=request.body.user_id;
    var created_by = global.logged_user_name;
    con.query('SELECT * FROM choices WHERE choices_id=?',[choices_id], function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
            var question_id=results[0].question_id;
            var score=results[0].score;
            con.query('INSERT INTO `answer` (`question_id`,`choices_id`,`user_id`,`score`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?,?);', [question_id, choices_id,user_id,score,created_by,created_by], function(err, results, fields) {
                console.log(results);
                if (err) throw err;
            });
            var data = {
                status: 'ok',
                message:'answer posted successfully!',
                user_id:user_id,
                choices_id:choices_id
            };
        
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

router.put('/modifyquestion/:question_id', (req, res) => {
    var course_id = req.params.course_id
    var coursename;
    var description;
    var info;
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
            if(req.body.base64String){
                base64String=req.body.base64String;
                var base64Data = base64String.replace(/^data:image\/png;base64,/, "");
                var filename="data/course_pictures/"+course_id+".png";
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
                console.log("updated")		
                    
            });
            res.status(200).json("updated course_id!")
            res.end();
        }else {
            res.status(200).json("incorrect course_id!")
            res.end();
        }
        
    });
    
   
});

router.delete('/deletequestion/:question_id', (req, res) => {
var question_id = req.params.question_id
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
			res.status(200).json("Deleted Successfully");		
			res.end();
		}else{
			res.status(200).json("error");		
			res.end();
		}
		
    
});


});*/
module.exports = router
