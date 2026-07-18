import { Patient } from "../models/patient.models.js";
import { Visit } from "../models/visit.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const createVisit = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const {
    visitDate,
    weight,
    symptoms,
    additionalSymptoms,
    notes,
    followUpDate,
  } = req.body;

  const existingPatient = await Patient.fondOne({
    _id: patientId,
    assignedASHA: req.user._id,
    isActive: true,
  });

  if (!existingPatient) {
    throw new ApiError(404, "Patient not found or not assigned to you");
  }

  const visit = await Visit.create({
    patient : patientId,
    conductedBy: req.user._id,
    visitDate,
    weight,
    symptoms,
    additionalSymptoms,
    notes,
    followUpDate,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, visit, "Visit created Successfully"));
});

export { createVisit };
