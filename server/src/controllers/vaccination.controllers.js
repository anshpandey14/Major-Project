import { Patient } from "../models/patient.models.js";
import { Vaccination } from "../models/vaccination.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum, VaccinationStatusEnum } from "../utils/constants.js";

const createVaccination = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const {
    vaccine,
    customVaccine,
    doseNumber,
    vaccinationDate,
    nextDueDate,
    notes,
  } = req.body;

  const patient = await Patient.findOne({
    _id: patientId,
    assignedASHA: req.user._id,
    isActive: true,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found or not assigned to you");
  }

  if (!vaccie && !customVaccine?.trim()) {
    throw new ApiError(400, "Either vaccine or customVaccine is required");
  }

  const vaccination = await Vaccination.create({
    patient: patientId,
    administeredBy: req.user._id,
    vaccine,
    customVaccine,
    doseNumber,
    nextDueDate,
    notes,
    status: VaccinationStatusEnum.COMPLETED,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, vaccination, "vaccination recorded successfully"),
    );
});

const getAllVaccinations = asuncHandler(async (req, res) => {
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
      "you are not authorized to accedd this patient's vaccinations",
    );
  }

  const filter = {
    patient: patientId,
    isActive: true,
  };

  const [vaccinations, totalVaccinations] = await Promise.all([
    Vaccination.find(filter)
      .populate("administeredBy", "fullName username")
      .sort({ vaccinationDate: -1 })
      .skip(skip)
      .limit(limit),
    Vaccination.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vaccinations,
        pagination: {
          page,
          limit,
          totalVaccinations,
          totalPage: Math.ceil(totalVaccinations / limit),
        },
      },
      "Vaccinations fetched successfully",
    ),
  );
});

const getVaccinationById = asyncHandler(async (req, res) => {
  const { patientId, vaccinationId } = req.params;

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
      "You are not allowed to access this patient's vaccinations",
    );
  }

  const vaccination = await Vaccination.findOne({
    _id: vaccinationId,
    patient: patientId,
    isActive: true,
  })
    .populate("patient", "fullName phone village gender")
    .populate("administeredBy", "fullName username");

  if (!vaccination) {
    throw new ApiError(404, "vaccination record not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, vaccination, "Vaccination fetched successfully"),
    );
});

const updateVaccination = asyncHandler(async (req, res) => {
  const { patientId, vaccinationId } = req.params;

  const vaccination = await Vaccination.findOne({
    _id: vaccinationId,
    patient: patientId,
    isActive: true,
  });

  if (!vaccination) {
    throw new ApiError(404, "Vaccination record not found");
  }

  if (vaccination.administeredBy.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this vaccination",
    );
  }

  const allowedFields = [
    "vaccine",
    "customVaccine",
    "doseNumber",
    "vaccinationDate",
    "nextDueDate",
    "status",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      vaccination[field] = req.body[field];
    }
  });

  if (!vaccination.vaccine && !vaccination.customVaccine?.trim()) {
    throw new ApiError(400, "Either vaccine or customVaccine is required");
  }

  if (
    vaccination.status === VaccinationStatusEnum.PENDING &&
    vaccination.nextDueDate &&
    vacciantion.nextDueDate < new Date()
  ) {
    vaccination.status = VaccinationStatusEnum.OVERDUE;
  }

  await vaccination.save();

  return Response.status(200).json(
    new ApiResponse(200, vaccination, "vaccination updated successfully"),
  );
});

const deleteVaccination = asyncHandler(async (req, res) => {
  const { patientId, vaccinationId } = req.params;

  const vaccination = await vacciantion.findOne({
    _id: vaccinationId,
    patient: patientId,
    isActive: true,
  });

  if (!vaccination) {
    throw new ApiError(404, "vacciantion record not found");
  }

  vaccination.isActive = false;
  await vaccination.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Vaccination record deleted successfully"),
    );
});

const getVaccinationStats = asyncHandler(async (req, res) => {
  const today = new Date();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const match = { isActive: true };

  if (req.user.role === UserRolesEnum.ASHA) {
    match.administeredBy = req.user._id;
  }

  const [totalVaccinationsThisMonth, vaccineCounts, statusCount] =
    await Promise.all([
      Vaccination.countDocuments({
        ...match,
        vaccinationDate: { $gte: startOfMonth, $lt: endOfMonth },
      }),

      Vaccination.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: {
              $ifNull: ["$vaccine", "$customVaccine"],
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Vaccination.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVaccinationsThisMonth,
        vaccineCounts,
        statusCounts,
      },
      "Vaccination statistics fetched successfully",
    ),
  );
});

const getOverdueVaccinations = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    isActive: true,
    nextDueDate: {
      $lt: new Date(),
    },
    status: {
      $ne: VaccinationStatusEnum.COMPLETED,
    },
  };

  if ((req.user, role === UserRolesEnum.ASHA)) {
    filter.administeredBy = req.user._id;
  }

  const [vaccinations, totalVaccinations] = await Promise.all([
    Vaccination.find(filter)
      .populate("patient", "fullName phone village")
      .populate("administeredBy", "fullName username")
      .skip(skip)
      .limit(limit),

    Vaccination.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vaccinations,
        pagination: {
          page,
          limit,
          totalVaccinations,
          totalPages: Math.ceil(totalVaccinations / limit),
        },
      },
      "Overdue vaccinations fetched successfully",
    ),
  );
});

export {
  createVaccination,
  getAllVaccinations,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
  getVaccinationStats,
  getOverdueVaccinations,
};
