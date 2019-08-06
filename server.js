'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var validUrl = require('valid-url');

var cors = require('cors');

var app = express();

//const baseUrl = 'http://DG.com'

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI,{ useNewUrlParser: true });

var Schema = mongoose.Schema;

var UrlSchema = new Schema({
  fullUrl: {type: String, required: true},
  shortUrl: {type: String, required: true}
});

var Url = mongoose.model('Url',UrlSchema);



//FIND ONE BY SHORT URL
var findOneByShortUrl = function(shortUrl,done){
  var short = Url.findOne({shortUrl:shortUrl},function(err,data){
      if(err){
            console.log('Error: ',err);
      }
      else{
        done(data);
      }
    });
  return short;
}

//CREATE SHORT URL
var createAndSaveShortUrl = function(fullUrl,done) {
  
      var short = Url.findOne({fullUrl:fullUrl},function(err,data){        
        var short;
        if(err){
            console.log('Error: ',err);
            
        }
        else{ console.log(data);
          if(!data){
            var shortIdUrl = shortid.generate();
           // short = new Url({fullUrl:fullUrl,shortUrl:`${baseUrl}/${shortIdUrl}`});
            short = new Url({fullUrl:fullUrl,shortUrl:shortIdUrl});
            console.log("epa");
            short.save(function(err,data){
              if(err){
                console.log('Error: ',err);
              }
              else{
                done(data);
              }
            });
          }
          else{
            done(data);
          }
          
        }
      });

};

//DELETE ALL URLs
var deleteAll= function(done){
  Url.deleteMany({},function(err,data){        
        var short;
        if(err){
            console.log('Error: ',err);
            
        }
        else{ 
          done(data);
        }
      });
}


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.post("/api/shorturl/new", function (req, res, next) {
  
 
  if(validUrl.isUri(req.body.url)){
     createAndSaveShortUrl(req.body.url,function(data){
        console.log('data en done',data);
        if (!data) {
          console.log('Missing `done()` argument');
          return next({message: 'Missing callback argument'});
        }
        res.json({"original_url":data.fullUrl,"short_url":data.shortUrl});
    
      });
  }
  else{
     res.json({"error":"invalid URL"});
  }
 
  
  
});

app.get("/api/shorturl/remove", function (req, res,next) {
  
  var Url = deleteAll(function(data){
    
    if (data) {
      res.send("Deleted");
    }
    else{
      res.send("There was a problem");
    }
    
  });
});

app.get("/api/shorturl/:url", function (req, res,next) {
  
  var Url = findOneByShortUrl(req.params.url,function(data){
    
    if (data) {
      res.redirect(data.fullUrl);
    }
    else{
      res.json({"error":"invalid URL"});
    }
    
  });
  
  
  
});

  
  


app.listen(port, function () {
  console.log('Node.js listening ...');
});