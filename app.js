const express=require('express');
const app=express();
const userRoutes=require('./api/routes/users');
const bodyParser= require('body-parser')
const path=require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users',userRoutes);
app.use(express.static(__dirname + '/uploads'));
module.exports=app;