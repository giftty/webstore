const express=  require("express");
const app= express();
app.get('/',(req,res)=>{
    res.send('Testing New PCDL')
})
const port= process.env.port||3000;
app.listen(port,()=>console.log('Server started'))

