

const express = require('express')
const fs = require('fs')
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();
const path = require('path');
//const app = require('../app');
var router = express.Router();
var https = require('follow-redirects').https;
let routresp
router.use(express.static(path.join(__dirname,'public')));

router.use('/',async(req,res,next)=>{
  
  try {
     routresp = await fs.readFileSync('public/contents/datacontent.txt', 'utf8')
  } catch (err) {
    console.error(err)
  }

next()
})
  router.get('/:dd',function(req,res){
  
    let repp
  var chunks = [];
  albcover=' '
  var options = {
    'method': 'POST',
    'hostname': '3ec4ymoy14.execute-api.us-east-1.amazonaws.com',
    'path': '/Dev/getalbumlinks',
    'headers': {
      'Content-Type': 'text/plain'
    },
    'maxRedirects': 20
  };
  

  
  var req2 = https.request(options, function (resi) {
   
  
    resi.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    resi.on("end", function (chunk) {
      repp = Buffer.concat(chunks);
      repp=repp.toString(); 
    // console.log(repp)
     repp=JSON.parse(repp)
     //res.send(repp)
     routresp=JSON.parse(routresp)
      console.log(routresp.body.library.length)
      
      for(i=0;i<=routresp.body.library.length;i++){
        if(routresp.body.library[i].id===req.params.dd)
        {
            albcover= routresp.body.library[i].cover_url
            mediatype=routresp.body.library[i].m_type
            break
           }
           //console.log(albcover)
     } 
        
     //console.log(albcover+'this is album cover')
     if(mediatype.indexOf('video')!=-1){
      res.render('videoplayer'  ,{layout:false, videosrcx:repp.albumlinks[0],coversrx:albcover})
     }else if(mediatype.indexOf('audio')!=-1){
       res.render('audioplay',{layout:false,audiosrx:repp.albumlinks[0],coversrx:albcover})
     }
     
    }); 
  
    resi.on("error", function (error) {
      console.error(error);
      res.render('mylibrary',{message:'Your network is not connect or very slow'})
     
    });
 
  }
  
  )
      var postData = JSON.stringify({
        albumid:req.params.dd
      })
      ;
     try{
      req2.write(postData)
      req2.end(); 
     }
     catch(er){
       console.log(er)
       res.send('Your network is not connect or very slow')
     }
  
  
  
  })
 module.exports=router
