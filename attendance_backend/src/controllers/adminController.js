import { HttpStatus, secretKey } from "../config/constant.js";
import { successResponse } from "../helper/successResponse.js";
import expressAsyncHandler from "express-async-handler";
import { Admin, Attendance, Batch, Student, Teacher, Token } from "../schema/model.js";
import { Types } from "mongoose";
import { generateToken, verifyToken } from "../utils/token.js";
import { comparePassword, hashPassword } from "../utils/Hashing.js";

export let addAdmin = expressAsyncHandler(async (req, res, next) => {
  
  let email = req.body.email
  let password=req.body.password
  let adminData = await Admin.findOne({ email }); 
  
  if (adminData) {
    let error = new Error("Duplicate email.");
    error.statusCode = 409;
    throw error;
  }else{
    let _hashPassword = await hashPassword(password);
  req.body.password = _hashPassword;
  let result = await Admin.create(req.body);
  delete result._doc.password;
  let infoObj = {
    id: result._id,
    role: "admin",
  };
  let expireInfo = {
    expiresIn: "1d",
  };
  let token = await generateToken(infoObj, expireInfo);
  await Token.create({ token });


  let response = {
    res,
    message: "Success",
    result,
    statusCode: HttpStatus.CREATED,
  }
  successResponse(response)
}}
)

export let addBatch = expressAsyncHandler(async (req, res, next) => {
  let name=req.body.name
  let course=req.body.course
  let result = await Batch.create({name,course});

  let response = {
    res,
    message: "success",
    result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});

export let loginAdmin = expressAsyncHandler(async (req, res, next) => {
  let email=req.body.email
  let password=req.body.password
  let result = await Admin.findOne({email});
  let jwt_token;
  if (await comparePassword(password,result.password)){
    let infoObj={
      id:result._id,
      role:"admin"
    }
    let expireInfo={
      expiresIn:"365d"
    }
    jwt_token = await generateToken(infoObj, expireInfo);
    await Token.create({token:jwt_token})
  }
    else{
    let error= new Error("Credential didn't match")
    error.statusCode=401
    throw error
    }

  let response = {
    res: res,
    message: "success",
    result: 
      {
        token:jwt_token,
      },
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
})

// export let updateUser = expressAsyncHandler(async (req, res, next) => {
  
//   let result = await User.findByIdAndUpdate(req.params.id, req.body);

//   let response = {
//     res: res,
//     message: "updated",
//     result: "updated",
//     statusCode: HttpStatus.CREATED,
//   };

//   successResponse(response);

// });

// export let deleteUser = expressAsyncHandler(async(req,res,next)=>{

//   // try{

//      let result = await User.findByIdAndDelete(req.params.id)

// let response = {"res":res,"message":"deleted","result":"deleted","statusCode":HttpStatus.CREATED}

//   successResponse(response)

// // }catch(error){

//   //   let response = {
//   //    "res":res,
//   //    "message":error.message,
//   //    "statusCode":HttpStatus.BAD_REQUEST
//   //   }

//   //  errorResponse(response)

// //   error.statusCode = HttpStatus.BAD_REQUEST
// //   next(error)

// // }

// })

// export let getTeacher = expressAsyncHandler(async (req, res, next) => {
//   // try{

//   //  let result = await User.find({name:"nitan"}) // this is exact searching
//   //  let result = await User.find({name:"nitan",age:29}) /// this is exact searching
//   //  let result = await User.find({age:{$gt:33}}) /// this is exact searching
//   //  let result = await User.find({age:{$gte:33}}) /// this is exact searching
//   //  let result = await User.find({age:{$lt:33}}) /// this is exact searching
//   //  let result = await User.find({age:{$lte:33}}) /// this is exact searching
//   //  let result = await User.find({age:{$ne:33}}) /// this is exact searching
//   //  let result = await User.find({name:{$in:["nitan"]}}) /// this is exact searching

//   //  let result = await User.find({$or:[{name:"a"},{name:"nitan"}]}) /// this is exact searching
//   //  let result = await User.find({$and:[{age:33},{name:"nitan"}]}) /// this is exact searching
//   // let result = await Teacher.find().populate({
//   // path: "batchId",
//   // match: {
//   //   course: "dot net",
//   // },
//   // }); /// this is exact searching

//   // let result = await Teacher.find({_id: 'a'}).populate({
//   //   path:"batchId",
//   //   match:{
//   //     _id:req.params
//   //   },
//   //   populate:{
//   //     path:"studentId",
//   //     match

//   //   }
//   // })

//   let result = await Teacher.find({
//     _id: "64818d8b43933fbec54ae4b0",
//   });

//   let response = {
//     res: res,
//     message: "hello",
//     result: result,
//     statusCode: HttpStatus.CREATED,
//   };

//   successResponse(response);

//   // }catch(error){

//   //   let response = {
//   //    "res":res,
//   //    "message":error.message,
//   //    "statusCode":HttpStatus.BAD_REQUEST
//   //   }

//   //  errorResponse(response)
//   //   error.statusCode = HttpStatus.BAD_REQUEST
//   //   next(error)

//   // }
// });
export let getBatch = expressAsyncHandler(async (req, res, next) => {
  let result = await Batch.find({});

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});

export let getTeacher = expressAsyncHandler(async (req, res, next) => {
  let result = await Teacher.find({});

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});

export let addTeacher = expressAsyncHandler(async (req, res, next) => {
   let name=req.body.name
   let email=req.body.email
   let password=req.body.password
   let batchId=req.params.batchId
    if(!await Batch.findOne({_id:batchId}))
    {
      let error=new Error("Invalid batch id")
      error.statusCode=404
      throw error
    }
    password=await hashPassword(password)
  let result = await Teacher.create({name,email,password,batchId});

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});
export let assignBatchToTeacher =expressAsyncHandler(async(req,res,next)=>{
  let
})
export let getStudent = expressAsyncHandler(async (req, res, next) => {
  let result = await Student.find({});

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});

export let addStudent = expressAsyncHandler(async (req, res, next) => {

  let name=req.body.name
   let email=req.body.email
   let password=req.body.password
   let batchId=req.params.batchId
    if(!await Batch.findOne({_id:batchId}))
    {
      let error=new Error("Invalid batch id")
      error.statusCode=404
      throw error
    }
    password=await hashPassword(password)
  let result = await Student.create({name,email,password,batchId});

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});

export let logout = expressAsyncHandler(async(req,res,next)=>{
  let id=req.body.token.tokenId
  await Token.findByIdAndDelete({_id:id})
  let response = {
    res: res,
    message: "successfully logged out",
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);

})

export let getStudentDetail=expressAsyncHandler(async(req,res,next)=>{
  let id=req.params.studentId
  let result=await Student.findOne({_id:id})

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
})

export let getTeacherDetail=expressAsyncHandler(async(req,res,next)=>{
  let id=req.params.teacherId
  let result=await Teacher.findOne({_id:id})

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
})