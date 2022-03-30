const express = require("express");
var mysql = require('mysql2');
const fs = require('fs');
const auth = require("./authentication");
const router =express.Router();
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "PNU"
});

router.get('/getinfo',auth.authentication,(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    
    con.query('SELECT * FROM static_content where sc_id=13', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			con.query('Select * from local where id=? and language=? and( code=?  or code=? );',[results[0].sc_id,"arabic","about_pnu","about_program"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
						results[0].about_pnuar=res2[0].description;
						results[0].about_programar=res2[1].description;
						var filename1="/var/www/demo/data/static_pictures/1.png";
						const contents1 = fs.readFileSync(filename1, {encoding: 'base64'});
						//console.log(contents)
						results[0].image1=contents1;
						var filename2="/var/www/demo/data/static_pictures/2.png";
						const contents2 = fs.readFileSync(filename2, {encoding: 'base64'});
						//console.log(contents)
						results[0].image2=contents2;
            var data = {
                status:'ok',
                message:"success",
                data:results
            };
            response.status(200).json(data);		
            response.end();
		}
	});
        }else{
            var data = {
				status: 'error',
                message:'error in processing'
			};
            response.status(200).json(data);	
            response.end();
        }
        
    });
    
});
//router.get('/getinfobyid/:sc_id',(request,response)=>{
    //response.setHeader('Access-Control-Allow-Origin', '*');
    //response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    //response.setHeader('Access-Control-Allow-Credentials', true);
    //var sc_id=request.params.sc_id;
    //con.query('SELECT * FROM static_content WHERE sc_id=?',[sc_id], function(error, results, fields) {
        //if (error) throw error;
        //if(results.length>0){
            //var data = {
                //status:'ok',
                //message:"success",
                //data:results
            //};
            //response.status(200).json(data);	
            //response.end();
        //}else{
            //var data = {
				//status: 'error',
                //message:'no such id'
			//};
            //response.status(200).json(data);		
            //response.end();
        //}
        
    //});
    
//});
router.get('/getinfobylang/:language',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var language=request.params.language;
    con.query('SELECT * FROM static_content', function(error, results, fields) {
        if (error) throw error;
        if(results.length>0){
			con.query('Select * from local where id=? and language=? and( code=?  or code=? );',[results[0].sc_id,language,"about_pnu","about_program"], function(error, res2, fields) {
				if (error) throw error;
				if(res2.length>0){
						results[0]['about_pnu']=res2[0].description;
						results[0]['about_program']=res2[1].description;
						results[0]['language']=res2[0].language;
						var filename1="/var/www/demo/data/static_pictures/1.png";
						const contents1 = fs.readFileSync(filename1, {encoding: 'base64'});
						//console.log(contents)
						results[0].image1=contents1;
						var filename2="/var/www/demo/data/static_pictures/2.png";
						const contents2 = fs.readFileSync(filename2, {encoding: 'base64'});
						//console.log(contents)
						results[0].image2=contents2;
					var data = {
						status:'ok',
						message:"success",
						data:results
					};
					response.status(200).json(data);	
					response.end();
				}
			});
        }else{
            var data = {
				status: 'error',
                message: 'no such language'
			};
            response.status(200).json(data);		
            response.end();
        }
        
    });
    
});
/*
router.post('/postinfo',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    response.setHeader('Access-Control-Allow-Credentials', true);
    var about_pnu=request.body.about_pnu;
    var about_program=request.body.about_program;
    var language=request.body.language;
    var contacts=request.body.contacts;
    var created_by=global.logged_user_name;
    con.query('INSERT INTO `static_content` (`about_pnu`,`about_program`, `contacts`, `language`, `created_by`,`updated_by`) VALUES ( ?,?, ?, ?,?, ?);', [about_pnu,about_program,contacts,language,created_by,created_by], function(err, results, fields) {
		console.log(results);
		if (err) throw err;
        var data = {
            status: 'ok',
            message:'info posted successfully',
            language:language
        };
		response.status(200).json(data);		
		response.end();
	}); 
    
});
 */
router.put('/modifyinfo',auth.authentication, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var sc_id = 13
    var about_pnu;
    var about_program;
    var about_pnuar;
    var about_programar;
    var contacts;
    var language;
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
            if(req.body.about_pnuar){
                about_pnuar=req.body.about_pnuar
            }
            if(req.body.about_programar){
                about_programar=req.body.about_programar
            }
            if(req.body.contacts){
                contacts=req.body.contacts
            }
            if(req.body.language){
                language=req.body.language
            }
            console.log(contacts)

            console.log(contacts)
            con.query('UPDATE static_content SET about_pnu=?,about_program=?,contacts=?,updated_by=?, language=? WHERE sc_id=?', [about_pnu,about_program,contacts,updated_by,"English",sc_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated sc")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [about_pnu,updated_by,"about_pnu","English",sc_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated en1")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [about_program,updated_by,"about_program","English",sc_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated en2")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [about_pnuar,updated_by,"about_pnu","Arabic",sc_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated ar1")		
                    
            });
            con.query('UPDATE local SET description=?,updated_by=? WHERE code=? and language=? and id=?', [about_programar,updated_by,"about_program","Arabic",sc_id], function(error, res, fields) {
				if (error) throw error;
                console.log("updated ar2")		
                    
            });
            var data = {
				status: 'ok',
                message:'updated successfully!',
                sc_id:sc_id
			};
            res.status(200).json(data)
            res.end();
        }else {
            var data = {
				status: 'error',
                message:'no such id'
			};
            res.status(200).json(data);
            res.end();
        }
        
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
            var data = {
				status: 'ok',
                message:'updated successfully!',
                sc_id:sc_id
			};
            res.status(200).json(data)
            res.end();
        }else {
            var data = {
				status: 'error',
                message:'no such id'
			};
            res.status(200).json(data);
            res.end();
        }
        
    });
    
   
});
router.delete('/deleteinfo/:sc_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin,X-Auth-Token');
    res.setHeader('Access-Control-Allow-Credentials', true);
var sc_id = req.params.sc_id
con.query('DELETE FROM static_content WHERE sc_id=?',[sc_id], function(error, results, fields) {
    if (error) throw error;
    console.log(results);
    if(results.affectedRows>0){	
        var data = {
            status: 'ok',
            message:'deleted successfully'
        };
        res.status(200).json(data);	
        res.end();
    }else{
        var data = {
            status: 'error',
            message: 'no such id'
        };
        res.status(200).json(data);		
        res.end();
    }
    
});


});*/
module.exports = router
