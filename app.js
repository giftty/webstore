//This file is the entry point for the appication where the server should poinjt to
const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const UIDGenerator = require('uid-generator');
const fs=require('fs');
var session = require('express-session')
var MemoryStore = require('memorystore')(session)
const uidgen = new UIDGenerator();
var https = require('follow-redirects').https;
var videopl=require('./routes/video.js')
const app=express();
var usersession;
let resp;
let categories;
const bodyParser=require('body-parser')
frontpage= require('./routes/index.js')
// Code to set the templating engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
//app.use(express.static("../webstore/public"))
//app.use('/',frontpage)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
//app.use(cookieParser())
var sess = {
  secret: 'poiuytreewqq',
  saveUninitialized:false, // don't create session until something stored
  resave: true, //don't save session if unmodified
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),   
  
} 

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use('/',express.static(path.join(__dirname,'public')));
app.use('/video',express.static(path.join(__dirname,'public')));
app.use(session(sess))

app.use('/video',videopl) 

app.use('/',async(req,res,next)=>{
  if(req.session.usersess){
  try {
     resp = await fs.readFileSync('public/contents/datacontent.txt', 'utf8')
  } catch (err) {
    console.error(err)
  }
}else{
   
}
next()
})

app.get('/',async(req,res,next)=>{
  //console.log(resp+' the data')

  //let resp
  var chunks = [];
  var options = {
    'method': 'POST',
    'hostname': '3ec4ymoy14.execute-api.us-east-1.amazonaws.com',
    'path': '/Dev/getcategories',
    'headers': {
      'Content-Type': 'text/plain'
    },
    'maxRedirects': 20
  };
  try{

  
  var req2 =await https.request(options, function (resi) {
   
  
    resi.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    resi.on("end", function (chunk) {
      resp = Buffer.concat(chunks);
      resp=resp.toString();
    // console.log(resp)
    categories=JSON.parse(resp)

    if(categories.body.length>0){
      console.log(categories.body)
    cate=categories
    res.render('index',{title:"Pastor Chris Digital Library",usersession:sess.usersess,category:cate})
    }
    
    } );
    
    resi.on("error", function (error) {
      console.error(error);
    });
 
  }
  
  )
} catch(er){
  console.log("an error has occurred")
}
  var postData = '{"group":"all_categories"}';
  
   
  req2.write(postData)
   req2.end();


  console.log(req.session.usersess)
  if(req.session.usersess){
      
    resp= resp.trim()
    resp=JSON.parse(resp)
    var   userlastname,userfirstname;
    if(resp.body.last_name=='null'&&resp.body.first_name=="null"){
      userfirstname=''
      userlastname=''
    }
    else if(resp.body.first_name=='null'){
      userfirstname='' 
      userlastname=resp.body.last_name
    }else if(resp.body.last_name=='null')
    {
      userlastname=''
      userfirstname=resp.body.first_name
  }else{
      userfirstname=resp.body.first_name
      userlastname=resp.body.last_name
    }
    var cate
    if(categories.body.length<0){
     
      res.render('index',{
        title:"Pastor Chris Digital Library",
        userdata:resp.body,
        userfirstname:userfirstname,
        userlastname:userlastname,
        useravatar:resp.body.avatar_url
      })
    }else{
      //categories=JSON.parse(resp)
        console.log(categories.body[3])
      cate=categories.body[2].catName
      res.render('index',{
        title:"Pastor Chris Digital Library",
        userdata:resp.body,
        userfirstname:userfirstname,
        userlastname:userlastname,
        category:cate,
        useravatar:resp.body.avatar_url
       
      })
    }
    
  }else{
    
  }
  
  // res.send('i am working')
})

//****LOGIN PAGE ROUET***** */
app.get('/login',(req,res,next)=>{
   if(req.session.usersess){
    res.redirect('/')
   }else{
    res.render('login',{title:'Login Page'})
   }
    
 })

 //*****SIGN UP PAGE ROUTE******* */
 app.get('/sign_up',(req,res,next)=>{
  res.render('sign_up',{title:'Register Page'})
 })
 
 //****LOGIN ROUTE***** */
 app.post('/login',(req,res,next)=>{
  console.log(req.body.email)
   let usanam=req.body.email;
   let  passw=req.body.password;
    //res.send(usanam )
  let resp
  var chunks = [];
  var esp=10;
  var options = {
    'method': 'POST',
    'hostname': '3ec4ymoy14.execute-api.us-east-1.amazonaws.com',
    'path': '/Dev/signin',
    'headers': {
      'Content-Type': 'text/plain'
    },
    'maxRedirects': 20
  };
  try{

  
  var req2 = https.request(options, function (resi) {
   
  
    resi.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    resi.on("end", function (chunk) {
      resp = Buffer.concat(chunks);
      resp=resp.toString();
      //console.log(resp)
     if(resp.indexOf('Login Successfully')!=-1){
      
       usersession=uidgen.generateSync()
       req.session.usersess=usersession
       fs.writeFile('public/contents/datacontent.txt',resp , function (err) {
        if (err) throw err;
        console.log('Saved to datacontent.txt==================================================== ');
      });
     resp=JSON.parse(resp)
     // console.log(resp.body);
       res.redirect('/mylibrary')
     }else{
       res.render('login',{message:"Password or Username not correct"})
     }
    
    
    } );
  
    resi.on("error", function (error) {
      console.error(error);
      res.render('login',{message:'Your network is not connect or very slow'})
     
    });
 
  }
  
  )
} catch(er){
  console.log("an error has occurred")
}
  
  if(usanam.length>=3 && passw.length>=3){
      var postData = '{"user":{"email":"'+usanam+'","password":"'+passw+'"}}' //"{\r\n\"user\":\r\n{\r\n\"email\": \""+ usanam +"\",\r\n\"password\": \""+ passw+"\"\r\n}\r\n}";
     try{
      req2.write(postData)
      req2.end();
     }
     catch(er){
       console.log(er)
       res.render('login',{message:'Your network is not connect or very slow'})
     }
      //res.send(esp.toString())
  }else{
      res.send("Fill boxes properly");
  }
 })
app.get('/mylibrary',(req,res,next)=>{
  console.log(req.session.usersess)
  if(req.session.usersess){
    resp= resp.trim()
    resp=JSON.parse(resp)
    var   userlastname,userfirstname;
    if(resp.body.last_name ==null&&resp.body.first_name==null){
      userfirstname=null
      userlastname=null
    }
    else if(resp.body.first_name==null&& resp.body.last_name!=null){
      userfirstname=null 
      userlastname=resp.body.last_name
    }else if(resp.body.last_name==null&& resp.body.first_name!=null)
    {
      userlastname=null
      userfirstname=resp.body.first_name
  }else{
    userfirstname=resp.body.first_name
    userlastname=resp.body.last_name
  }
    res.render('mylibrary',{
      title:"Pastor Chris Digital Library",
      userdata:resp.body,
      userfullname:userfirstname+' '+userlastname,
      useravatar:resp.body.avatar_url,userwalletbalance:resp.body.wallet_balance
    })
  }else{
    res.redirect('/')
  }
})

app.get('/playerpage',(req,res,next)=>{
  res.render('player_page')
})

app.post('/album/:id',(req,res,next)=>{
     //res.send(resp)
     subchk=Date.now()
      resp=JSON.parse(resp)
       console.log(resp.body.library[0].id)
      album =resp.body.library.filter(li=>{
        if(li.id===req.params.id){  
          return li.id
        } 
         
       })
       console.log(album)
      if(album.length<=0 &&resp.body.subscription_expiration<subchk){
        console.log('subcripton expired')
        res.send('subcripton expired')
      }else{
      //console.log(album)
      res.send(album)
  
      } 

})
app.get('/logout',(req,res,next)=>{
  req.session.destroy()
  fs.writeFile('public/contents/datacontent.txt',' ', function (err) {
    if (err) throw err;
    console.log('Updated datacontent.txt==================================================== ');
  });
  res.redirect('/')
})

app.get('/wallet',(req,res,next)=>{
  res.render('walletpage')
})




module.exports=route;
const port= process.env.port||3000;
app.listen(port,()=>console.log('Server started'))

