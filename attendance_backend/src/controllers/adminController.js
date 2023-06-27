import { HttpStatus, secretKey } from "../config/constant.js";
import { successResponse } from "../helper/successResponse.js";
import expressAsyncHandler from "express-async-handler";
import {
  Admin,
  Attendance,
  Batch,
  Student,
  Teacher,
  Token,
} from "../schema/model.js";
import { generateToken, verifyToken } from "../utils/token.js";
import { comparePassword, hashPassword } from "../utils/Hashing.js";
import { Types } from "mongoose";
import { dateNow } from "../utils/Date.js";
import { batchSchema } from "../schema/batchSchema.js";
import { deleteElementByIndex, findIndex } from "../utils/arrayMethods.js";

export let loginAdmin = expressAsyncHandler(async (req, res, next) => {
  let display= dateNow()

  let email = req.body.email;
  let password = req.body.password;
  let result = await Admin.findOne({ email });
  
  let jwt_token;
  if (await comparePassword(password, result.password)) {
    let infoObj = {
      id: result._id,
      role: "admin",
    };
    let expireInfo = {
      expiresIn: "365d",
    };
    jwt_token = await generateToken(infoObj, expireInfo);
    await Token.create({ token: jwt_token });
  } else {
    let error = new Error("Credential didn't match");
    error.statusCode = 401;
    throw error;
  }

  let response = {
    res: res,
    message: "success",
    result: {
      token: jwt_token,
    },
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});
export let logout = expressAsyncHandler(async (req, res, next) => {
  let id = req.body.token.tokenId;
  await Token.findByIdAndDelete({ _id: id });
  let response = {
    res: res,
    message: "successfully logged out",
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});

export let addAdmin = expressAsyncHandler(async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let adminData = await Admin.findOne({ email });

  if (adminData) {
    let error = new Error("Duplicate email.");
    error.statusCode = 409;
    throw error;
  } else {
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
    };
    successResponse(response);
  }
});

export let addBatch = expressAsyncHandler(async (req, res, next) => {
  let name = req.body.name;
  let course = req.body.course;
  let result = await Batch.create({ name, course });

  let response = {
    res,
    message: "success",
    result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
});

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
  let result = await Batch.find({})

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});

export let getBatchDetails = expressAsyncHandler(async (req, res, next) => {
  let id = req.params.batchId;
  let result = await Batch.findOne({ _id: id });
  let response = {
    res,
    message: "Batch Detail",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});
export let getTeacher = expressAsyncHandler(async (req, res, next) => {
  let result = await Teacher.find({});

  let response = {
    res: res,
    message: "Teacher Detail",
    result: result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});

export let addTeacher = expressAsyncHandler(async (req, res, next) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  // if(await Batch.findOne({email}))
  // {
  //   let error=new Error("Invalid batch id")
  //   error.statusCode=404
  //   throw error
  // }
  password = await hashPassword(password);
  let result = await Teacher.create({ name, email, password });

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});


export let getBatchTeacher = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;

  let query = {
    batchId: { $in: [new Types.ObjectId(_batchId)] },
  };

  let result = await Teacher.find(query);

  let response = {
    res,
    message: "successfully assigned",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});
export let getBatchStudent = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;

  let query = {
    batchId: { $in: [new Types.ObjectId(_batchId)] },
  };

  let result = await Student.find(query);

  let response = {
    res,
    message: "successfully assigned",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});
// export let assignBatchToTeacher =expressAsyncHandler(async(req,res,next)=>{
//   let
// })
export let getStudent = expressAsyncHandler(async (req, res, next) => {
  let result = await Student.find({});

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let addStudent = expressAsyncHandler(async (req, res, next) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  password = await hashPassword(password);
  let result = await Student.create({ name, email, password });

  let response = {
    res,
    message: "student added successfully",
    result,
    statusCode: HttpStatus.CREATED,
  };

  successResponse(response);
})

export let getStudentDetail = expressAsyncHandler(async (req, res, next) => {
  let id = req.params.studentId;
  let result = await Student.findOne({ _id: id });

  let response = {
    res: res,
    message: "success",
    result: result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let getTeacherDetail = expressAsyncHandler(async (req, res, next) => {
  let id = req.params.teacherId;
  let result = await Teacher.findOne({ _id: id });

  let response = {
    res,
    message: "success",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let insertStudent = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let studentId = req.params.studentId;
  let theStudent = await Student.findById(studentId);
  theStudent.batchId.push(_batchId);
  let result = await Student.findByIdAndUpdate(studentId, theStudent, {
    new: true,
  });
  let response = {
    res,
    message: "Student enrolled in class successfully",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let updateStudent = expressAsyncHandler(async (req, res, next) => {
  let studentId = req.params.studentId
  let _data=req.body.data
  delete _data.password
  let result = await Student.findByIdAndUpdate(studentId,_data, {
    new: true,
  });
  let response = {
    res,
    message: "Student Updated successfully",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})
export let updateTeacher = expressAsyncHandler(async (req, res, next) => {
  let teacherId = req.params.teacherId
  let _data=req.body.data
  delete _data.password
  let result = await Teacher.findByIdAndUpdate(teacherId,_data, {
    new: true,
  });
  let response = {
    res,
    message: "Teacher Updated successfully",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let deleteTeacher = expressAsyncHandler(async (req, res, next) => {
  let teacherId = req.params.teacherId
  
  let result = await Teacher.findByIdAndDelete(teacherId,{new:true})
  let response = {
    res,
    message: "Teacher Account Deleted successfully",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let deleteStudent = expressAsyncHandler(async (req, res, next) => {
  let studentId = req.params.studentId
  let result = await Student.findByIdAndDelete(studentId);
  let response = {
    res,
    message: "Student Account Deleted successfully",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})

export let unAssignTeacher=expressAsyncHandler(async (req, res, next) => {
  let _batchId=req.params.batchId
  let _teacherId = req.params.teacherId
  let theTeacher = await Teacher.findById(_teacherId)

  let indexToDelete=findIndex(_batchId,theTeacher.batchId)
  deleteElementByIndex(theTeacher.batchId,indexToDelete)

  let result = await Teacher.findByIdAndUpdate(_teacherId, theTeacher, {
    new: true,
  });
  let response = {
    res,
    message: "Unassigned Success",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
})


export let assignTeacher = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let teacherId = req.params.teacherId;
  let theTeacher = await Teacher.findById(teacherId);
  theTeacher.batchId.push(_batchId);
  let result = await Teacher.findByIdAndUpdate(teacherId, theTeacher, {
    new: true,
  });
  let response = {
    res,
    message: "successfully assigned",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});

export let updateCourse=expressAsyncHandler(async (req, res, next) => {
let name=req.body.name
let course=req.body.course
let _batchId=req.params.batchId
let result=await Batch.findByIdAndUpdate(_batchId,{name,course},{new:true})
let response = {
  res,
  message:"success",
  result,
  statusCode:HttpStatus.OK
}
successResponse(response)
})