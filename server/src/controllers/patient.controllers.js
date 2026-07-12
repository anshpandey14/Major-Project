import { Patient } from "../models/patient.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createPatient = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    village,
    gender,
    dob,
    weight,
    height,
    bloodGroup,
    isPregnant,
    lmpDate,
  } = req.body;

  const existingPatient = await Patient.findOne({
    phone,
    assignedASHA: req.user._id,
  });

  if (existingPatient) {
    throw new ApiError(409, "Patient already exists");
  }

  const patient = await Patient.create({
    fullName,
    phone,
    village,
    gender,
    dob,
    weight,
    height,
    bloodGroup,
    isPregnant,
    lmpDate,
    assignedASHA: req.user._id,
  });

  const createdPatient = await Patient.findById(patient._id);

  return res
    .status(201)
    .json(new ApiResponse(201, createdPatient, "Patient created Successfully"));
});

const getAllPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = { isActive: true };

  if (req.user.role === "phc") {
  } else if (req.user.role === "asha") {
    query.assignedASHA = req.user._id;
  } else {
    throw new ApiError(403, "Access Denied");
  }

  if (search.trim()) {
    query.$or = [
      {
        fullName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
      {
        village: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const patients = await Patient.find(query)
    .populate("assignedASHA", "fullName username")
    .skip(skip)
    .limit(Number(limit))
    .sort({
      createdAt: -1,
    });

  const totalPatients = await Patient.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patients,
        pagination: {
          totalPatients,
          currentPage: Number(page),
          totalPages: Math.ceil(totalPatients / limit),
          limit: Number(limit),
        },
      },
      "Patients fetched Successfully",
    ),
  );
});

const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
  }).populate("assignedASHA", "fullName username");

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  if (req.user.role === "asha" && !patient.assignedASHA.equals(req.user._id)) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient fetched successfully"));
});

export { createPatient, getAllPatients, getPatientById };
