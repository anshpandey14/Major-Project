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
    hemoglobin,
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

  const isHighRisk = systolic > 140 || diastolic > 90 || hemoglobin < 8;

  const ancRecord = await ANC.create({
    patient: patientId,
    conductedBy: req.user._id,
    visitDate,
    gestationalWeek,
    weight,
    bloodPressure: {
      systolic,
      diastolic,
    },
    hemoglobin,
    fetalHeartRate,
    nextVisitDate,
    isHighRisk,
    notes,
  });

  await Patient.findByIdAndUpdate(patientId, {
    $unset: {
      aiSummary: "",
      aiSummaryGeneratedAt: "",
      aiRiskLevel: "",
      aiRiskReason: "",
      aiRiskGeneratedAt: "",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, ancRecord, "ANC record created successfully"));
});

const getAllANC = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
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

const getANCById = asyncHandler(async (req, res) => {
  const { patientId, ancId } = req.params;

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
      "You are not authorized to access this patient's ANC record",
    );
  }

  const ancRecord = await ANC.findOne({
    _id: ancId,
    patient: patientId,
    isActive: true,
  })
    .populate("patient", "fullName phone village gender")
    .populate("conductedBy", "fullName username");

  if (!ancRecord) {
    throw new ApiError(404, "ANC record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ancRecord, "ANC record fetched successfully"));
});

const updateANC = asyncHandler(async (req, res) => {
  const { patientId, ancId } = req.params;

  const ancRecord = await ANC.findOne({
    _id: ancId,
    patient: patientId,
    isActive: true,
  });

  if (!ancRecord) {
    throw new ApiError(404, "ANC record not found");
  }

  if (ancRecord.conductedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not authorized to update this ANC record");
  }

  const allowedFields = [
    "visitDate",
    "gestationalWeek",
    "weight",
    "hemoglobin",
    "fetalHeartRate",
    "nextVisitDate",
    "notes",
  ];

  const hasUpdates = allowedFields.some(
    (field) => req.body[field] !== undefined,
  );

  if (!hasUpdates) {
    throw new ApiError(400, "No fields provided for update");
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      ancRecord[field] = req.body[field];
    }
  });

  if (req.body.bloodPressure) {
    ancRecord.bloodPressure.systolic =
      req.body.bloodPressure.systolic ?? ancRecord.bloodPressure.systolic;

    ancRecord.bloodPressure.diastolic =
      req.body.bloodPressure.diastolic ?? ancRecord.bloodPressure.diastolic;
  }

  const systolic = ancRecord.bloodPressure.systolic;
  const diastolic = ancRecord.bloodPressure.diastolic;
  const hemoglobin = ancRecord.hemoglobin;

  ancRecord.isHighRisk = systolic > 140 || diastolic > 90 || hemoglobin < 8;

  await ancRecord.save();

  await Patient.findByIdAndUpdate(patientId, {
    $unset: {
      aiSummary: "",
      aiSummaryGeneratedAt: "",
      aiRiskLevel: "",
      aiRiskReason: "",
      aiRiskGeneratedAt: "",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, ancRecord, "ANC record updated successfully"));
});

const deleteANC = asyncHandler(async (req, res) => {
  const { patientId, ancId } = req.params;

  const ancRecord = await ANC.findOne({
    _id: ancId,
    patient: patientId,
    isActive: true,
  });

  if (!ancRecord) {
    throw new ApiError(404, "ANC record not found");
  }

  ancRecord.isActive = false;
  await ancRecord.save();

  await Patient.findByIdAndUpdate(patientId, {
    $unset: {
      aiSummary: "",
      aiSummaryGeneratedAt: "",
      aiRiskLevel: "",
      aiRiskReason: "",
      aiRiskGeneratedAt: "",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "ANC record deleted successfully"));
});

const getANCStats = asyncHandler(async (req, res) => {
  const today = new Date();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const match = {
    isActive: true,
  };

  if (req.user.role === UserRolesEnum.ASHA) {
    match.conductedBy = req.user._id;
  }

  const [
    totalANCVisitsThisMonth,
    highRiskPatients,
    averageHemoglobin,
    trimesterCounts,
  ] = await Promise.all([
    ANC.countDocuments({
      ...match,
      visitDate: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    }),

    ANC.countDocuments({ ...match, isHighRisk: true }),

    ANC.aggregate([
      {
        $match: {
          ...match,
          hemoglobin: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageHemoglobin: {
            $avg: "$hemoglobin",
          },
        },
      },
    ]),

    ANC.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          trimester: {
            $switch: {
              branches: [
                {
                  case: { $lte: ["$gestationalWeek", 12] },
                  then: "First Trimester",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$gestationalWeek", 13] },
                      { $lte: ["$gestationalWeek", 27] },
                    ],
                  },
                  then: "Second Trimester",
                },
                {
                  case: { $gte: ["$gestationalWeek", 28] },
                  then: "Third Trimester",
                },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $group: {
          _id: "$trimester",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalANCVisitsThisMonth,
        highRiskPatients,
        averageHemoglobin:
          averageHemoglobin.length > 0
            ? Number(averageHemoglobin[0].averageHemoglobin.toFixed(2))
            : 0,
        trimesterCounts,
      },
      "ANC statistics fetched successfully",
    ),
  );
});

const getHighRiskANC = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    isActive: true,
    isHighRisk: true,
  };

  if (req.user.role === UserRolesEnum.ASHA) {
    filter.conductedBy = req.user._id;
  }

  const [ancRecords, totalRecords] = await Promise.all([
    ANC.find(filter)
      .populate("patient", "fullName phone village")
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
      "High-risk ANC records fetched successfully",
    ),
  );
});

export {
  createAnc,
  getAllANC,
  getANCById,
  updateANC,
  deleteANC,
  getANCStats,
  getHighRiskANC,
};
