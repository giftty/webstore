express=require('express');
route=express.Router()

route.get('/',(req,res,next)=>{
    res.render('index',{title:"Pastor Chris Digital Library"})
})

route.get('/login',(req,res,next)=>{
 res.render('login')
})

module.exports=route;