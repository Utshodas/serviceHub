var con  = require("./connection");
var express = require('express');
var app = express();
const port = 7000;
const session = require('express-session');

var bodyParser = require('body-parser');

con.connect(function(error){
    if(error) throw error;
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use(session({
    secret: 'mySecretKey', 
    resave: false,
    saveUninitialized: true
}));

app.set('view engine','ejs')

app.get('/', function(req, res){
    res.sendFile(__dirname+'/login.html');
});

app.post('/', function(req, res){
    var name = req.body.name;
    var password = req.body.password;
    var userType = req.body.userType;
    if(userType=="client") 
        {
            var sql = "SELECT * FROM client WHERE c_name=? and password=?";
            con.query(sql,[name,password],function(error,result){
                if(error) throw error;
                if (result.length > 0) {
                    req.session.userType = userType;
                    req.session.userName = name;
                    res.render(__dirname+"/client-profile",{client:result,});
                }
            });
        }
        else if(userType=="provider") 
        {
            var sql = "SELECT * FROM provider WHERE p_name=? and password=?";
            con.query(sql,[name,password],function(error,result){
                if(error) throw error;
                if (result.length > 0) {
                    req.session.userType = userType;
                    req.session.userName = name;
                    res.redirect('/provider')
                }
            });
        }
        else 
            res.redirect('/error');
});

app.get('/register', function(req, res){
    res.sendFile(__dirname+'/register.html');
});


app.post('/register', function(req, res){
    var name = req.body.name;
    var id = req.body.id;
    var password = req.body.password;
    var house = req.body.house;
    var street = req.body.street;
    var city = req.body.city;
    var country = req.body.country;
    var service = req.body.service;
    var userType = req.body.userType;
    if(userType=="client") 
    {
        var sql = "INSERT INTO client(c_id,c_name,password,house,street,city,country) VALUES (?,?,?,?,?,?,?)";
        con.query(sql,[id,name,password,house,street,city,country],function(error,result){
        if(error) throw error;
        req.session.userType = userType;
        req.session.userName = name;
        res.redirect('/client')
        });
    }
    else if(userType=="provider") 
    {
        var sql = "INSERT INTO provider(p_id,p_name,password,house,street,city,country,service) VALUES (?,?,?,?,?,?,?,?)";
        con.query(sql,[id,name,password,house,street,city,country,service],function(error,result){
            if(error) throw error;
            req.session.userType = userType;
            req.session.userName = name;
            res.redirect('/provider')
        });
    }
    else 
    res.redirect('/error');

});

app.get('/client',function(req, res){
 var sql = "SELECT * FROM client";

        con.query(sql,function(error,result){
            if(error) console.log(error);
            res.render(__dirname+"/client",{client:result, userType: 'client', req: req});
        });

});
app.get('/provider',function(req, res){
    var sql = "SELECT * FROM provider";
   
           con.query(sql,function(error,result){
               if(error) console.log(error);
               res.render(__dirname+"/provider",{provider:result});
           });
   
   });
app.get('/delete-client',function(req, res){
    var sql = "DELETE FROM client WHERE c_id=?";
    var id = req.query.id;
           con.query(sql,[id],function(error,result){
               if(error) console.log(error);
               res.redirect('/client')
           });
   
});
app.get('/delete-provider',function(req, res){
    var sql = "DELETE FROM provider WHERE p_id=?";
    var id = req.query.id;
           con.query(sql,[id],function(error,result){
               if(error) console.log(error);
               res.redirect('/provider')
           });
   
});
app.get('/update-client',function(req, res){
    var sql = "SELECT * FROM client WHERE c_id=?";
    var id = req.query.id;
           con.query(sql,[id],function(error,result){
               if(error) console.log(error);
               res.render(__dirname+"/update-client",{client:result});
           });
   
});

app.post('/update-client', function(req, res){
    var name = req.body.name;
    var id = req.body.id;
    var password = req.body.password;
    var house = req.body.house;
    var street = req.body.street;
    var city = req.body.city;
    var country = req.body.country;
    var sql = "UPDATE client SET c_name=?,house=?,street=?,city=?,country=?,password=? where c_id=?";
    con.query(sql,[name,house,street,city,country,password,id],function(error,result){
    if(error) throw error;
    res.redirect('/client')
    });
});

app.get('/update-provider',function(req, res){
    var sql = "SELECT * FROM provider WHERE p_id=?";
    var id = req.query.id;
           con.query(sql,[id],function(error,result){
               if(error) console.log(error);
               res.render(__dirname+"/update-provider",{provider:result});
           });
   
});


app.get('/search-client',function(req, res){
    var sql = "SELECT * FROM client";
   
           con.query(sql,function(error,result){
               if(error) console.log(error);
               res.render(__dirname+"/search-client",{client:result});
           });
   
   });
app.get('/search', function(req,res){
    var name = req.query.name;
    var id = req.query.id;
    var sql = "SELECT * FROM client WHERE c_name LIKE '%"+name+"%' AND c_id LIKE '%"+id+"%' ";
    con.query(sql,function(error,result){
        if(error) console.log(error);
        res.render(__dirname+"/search-client",{client:result});
    });
});
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            res.redirect('/');
        }
    });
});
app.get('/client-profile', function(req, res){
    res.sendFile(__dirname+'/client-profile.html');
});



app.listen(port, function() {
    console.log(`Server is listening on port ${port}`);
  });
