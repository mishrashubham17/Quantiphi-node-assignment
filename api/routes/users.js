const express=require('express');
const router=express.Router();
const bcrypt =require("bcrypt");
const { JsonWebTokenError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const checkAuth=require('../middleware/check-auth');
const fs=require('fs');
const uuid = require("uuid");
const { fileURLToPath } = require('url');
const multer=require("multer");
const upload=multer({dest:'uploads/'});
let users = require("./UserData.js");

let token;
router.post('/signup',upload.single('productImage') , async (req,res,next)=>{
    newUser={
        "id":uuid.v4(),
        "name":req.body.name,
        "email":req.body.email,
        "phone":req.body.phone,
        "password":req.body.password
    }
    req.body.password=await bcrypt.hash(req.body.password,8)
    if (!newUser.name || !newUser.email || !newUser.password) {
        return res.sendStatus(400);
      }
    else{
        users.push(newUser);
        res.json(users);
    }
    
});

router.get('/me',checkAuth,(req,res,next)=>{
    let uid=req.udata.userId;
    const found = users.some(user => user.id === uid);
    if (found) {
        res.json(users.filter(user => user.id === uid));
    }else{
    res.sendStatus(400);
  }
}); 


router.get("/:id", (req, res) => {
  const found = users.some(user => user.id === parseInt(req.params.id));
  if (found) {
    res.json(users.filter(user => user.id === parseInt(req.params.id)));
  } else {
    res.sendStatus(400);
  }

});
router.post('/login',  async (req,res,next)=>{
    const found = users.some(user => user.password === req.body.password);
    let userData;
    if (found) {
         userData=users.filter(user => user.password === req.body.password);
            }
     else {
        res.sendStatus(400);
    }
    console.log(userData);
    let hashpassword=await bcrypt.hash(userData[0].password,8)
    bcrypt.compare(req.body.password,hashpassword,(err,result)=>{
        if(err){
            return res.status(401).json({
                message:"Auth Failed"
            });
        }

        if(result){
            token=jwt.sign({
                email:userData[0].email,
                userId:userData[0].id
            },process.env.JWT_KEY,
            {
                expiresIn:"1h",
            })
            return res.status(200).json({
                message:"Auth Successful",
                "token":token
            });
        }
    }) 
    })

router.put("/:id",checkAuth, (req, res) => {
    const found = users.some(user => user.id === parseInt(req.params.id));
        if (found) {
          const updateUser = req.body;
          users.forEach(user => {
            if (user.id === parseInt(req.params.id)) {
              user.name = updateUser.name ? updateUser.name : user.name;
              user.email = updateUser.email ? updateUser.email : user.email;
              res.json({ msg: "User updated", user });
            }
          });
        } else {
          res.sendStatus(400);
        } 
      });
router.post('/reset-password', checkAuth, (req,res,next)=>{
    let found;
    for(let i=0;i<users.length;i++)
    {
        if(users[i].email==req.body.email)
            found=users[i];
    }
    if (found) {
        const updateUser = req.body;
        users.forEach(async (user)  => {
          if (user.email === req.body.email) {
            user.password = updateUser.password ? updateUser.password : user.password;
            user.password= await bcrypt.hash(user.password,8)
            res.json({ msg: "User Password Updated", user });
          }
        });
      } else {
        res.sendStatus(400);
      } 
})
module.exports=router;