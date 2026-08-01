import { Patient } from "../models/patient.models.js";
import { ANC } from "../models/anc.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

const createAnc = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const {
    visitDate,
    gestationalWeek,
    weight,
    bloodPressure,
    heamoglobin,
    fetalHeartRate,
    nextVisitDate,
    notes,
  } = req.body;

  const patient = await Patient.findOne({
    _id: patientId,
    assignedASHA: req.user._id,
    isActive: true,
  });

  if (!patient) {
    throw new ApiError(404, "Patient notfound or not assigned to you");
  }

  if (!patient.isPregnant) {
    throw new ApiError(
      400,
      "ANC records can only be created for pregnant patient",
    );
  }

  const { systolic, diastolic } = bloodPressure;

  const isHighRisk = systolic > 140 || diastolic < 90 || heamoglobin < 8;

  const ancRecord = await ANC.create({
    patient: patientId,
    conductedBy: req.user._id,
    visitDate,
    gestationalWeek,
    weight,
    bloodPressure: {
      systoloc,
      diastolic,
    },
    heamoglobin,
    fetalHeartRate,
    nextVisitDate,
    isHighRisk,
    notes,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, ancRecord, "ANC record created successfully"));
});

const getAllANC = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const limit = Number(req.query.limit) || 10;
  const page = NUmber(req.query.page) || 1;
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
      "You are not authorized to access this patient's anc records",
    );
  }

  const filter = {
    patient: patientId,
    isActive: true,
  };

  const [ancRecords, totalRecords] = await Promise.all([
    ANC.find(filter)
      .populate("conductedBy", "fullName username")
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),

    ANC.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ancRecords,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        },
      },
      "ANC records fetched successfully",
    ),
  );
});

export { createAnc, getAllANC };
