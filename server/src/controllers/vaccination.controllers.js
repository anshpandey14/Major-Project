import { Patient } from "../models/patient.models.js";
import { Vaccination } from "../models/vaccination.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { VaccinationStatusEnum } from "../utils/constants.js";

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

export { createVaccination };
