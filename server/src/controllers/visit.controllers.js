import { Patient } from "../models/patient.models.js";
import { Visit } from "../models/visit.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { UserRolesEnum } from "../utils/constants.js";

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
    patient: patientId,
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

const getAllVisits = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  if (
    req.user.role === UserRolesEnum.ASHA &&
    patient.assignedASHA.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to access this patient's visits",
    );
  }

  const [visits, totalVisits] = await Promise.all([
    Visit.find({ patient: patientId, isActive: true })
      .populate("conductedBy", "fullName username")
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),

    Visit.countDocuments({ patient: patientId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        visits,
        pagination: {
          page,
          limit,
          totalVisits,
          totalPages: Math.ceil(totalVisits / limit),
        },
      },
      "Visits fetched Successfully",
    ),
  );
});

export { createVisit, getAllVisits };
