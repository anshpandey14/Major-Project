import { Patient } from "../models/patient.models.js";
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

export { createPatient };
