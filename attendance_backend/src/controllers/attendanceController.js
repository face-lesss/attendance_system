import expressAsyncHandler from "express-async-handler";
import { Attendance, Student } from "../schema/model.js";
import { successResponse } from "../helper/successResponse.js";
import { HttpStatus } from "../config/constant.js";

export let getAllAttendance = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let result = await Attendance.find({ batchId: _batchId })
    .populate({
      path: "studentId",
    })
    .populate({
      path: "batchId",
    });
  console.log(result);
  let response = {
    res,
    message: "Attendance Report",
    result,
    statusCode: HttpStatus.OK,
  };

  successResponse(response);
});

export let studentList = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let studentList = await Student.find({ batchId: _batchId });
  let response = {
    res,
    result: studentList,
    message: "All students of this Batch",
    statusCode: HttpStatus.OK,
  };
  successResponse(response);
});

export let submitAttendance = expressAsyncHandler(async (req, res, next) => {
  let _batchId = req.params.batchId;
  let _data = req.body.data;

  let check = await Attendance.find({ batchId: _batchId, Date: new Date() });
  console.log(check, "checking ......");
  if (check[0] === undefined) {
    let error = new Error("Attendance for today is already submitted");
    error.statusCode = 409;
    throw error;
  }

  // console.log(_data, "data .............");
  console.log(_data);
  for (let i = 0; i < _data.length; i++) {
    let status = _data[i].status === "P" ? 0 : _data[i].status === "A" ? 1 : 3;
    await Attendance.create({
      status: status,
      studentId: _data[i].studentId,
      batchId: _batchId,
    });
  }
  let response = {
    res,
    message: "Attendance Successfully submitted",
    statusCode: HttpStatus.OK,
  };
  successResponse(response);
});
