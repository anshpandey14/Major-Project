import { ANC } from "../models/anc.models.js";
import { Patient } from "../models/patient.models.js";
import { Vaccination } from "../models/vaccination.models.js";
import { ANC, Visit } from "../models/visit.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { generateAIResponse } from "../utils/ai.js";
import {
  buildRiskPrompt,
  buildSummaryPrompt,
} from "../services/ai/prompt.service.js";
import { UserRolesEnum } from "../utils/constants.js";

const generateSummary = asyncHandler(async (req, res) => {
  const { patientId } = req.body;

  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
  });

  if (
    req.user.role === UserRolesEnum.ASHA &&
    patient.assignedASHA.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  // cache check
  if (
    patient.aiSummary &&
    patient.aiSummaryGeneratedAt &&
    Date.now() - patient.aiSummaryGeneratedAt.getTime() < 24 * 60 * 60 * 1000
  ) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          summary: patient.aiSummary,
          cached: true,
        },
        "Cached AI summary returned",
      ),
    );
  }

  // fetch patient data
  const visits = await Visit.find({
    patient: patient._id,
    isActive: true,
  })
    .sort({ visitDate: -1 })
    .limit(5)
    .lean();

  const vaccinations = await Vaccination.find({
    patient: patient._id,
    isActive: true,
  })
    .sort({ vaccinationDate: -1 })
    .limit(5)
    .lean();

  const ancRecords = await ANC.find({
    patient: patient._id,
  })
    .sort({ visitDate: -1 })
    .limit(3)
    .lean();

  // prompt building

  const prompt = buildSummaryPrompt(
    patient.toObject(),
    visits,
    vaccinations,
    ancRecords,
  );

  // call api

  try {
    const summary = await generateAIResponse(prompt);

    if (!summary || typeof summary !== "string") {
      throw new ApiError(502, "Invalid AI response");
    }

    patient.aiSummary = summary;
    patient.aiSummaryGeneratedAt = new Date();

    await patient.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          summary,
          cached: false,
        },
        "AI summary generated successfully",
      ),
    );
  } catch (error) {
    // return cache if available,call failed

    if (patient.aiSummary) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            summary: patient.aiSummary,
            cached: true,
            stale: true,
          },
          "AI unavailable. Returning cached summary",
        ),
      );
    }

    throw new ApiError(503, "AI service is temporarily unavailable");
  }
});

const generateRiskAssessment = asyncHandler(async (req, res) => {
  const { patientId } = req.body;

  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  if (!patient.isPregnant) {
    throw new ApiError(400, "Risk assessment is only for pregnant patients");
  }

  if (
    req.user.role === UserRolesEnum.ASHA &&
    patient.assignedASHA.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  // cache check
  if (
    patient.aiRiskLevel &&
    patient.aiRiskReason &&
    patient.aiRiskGeneratedAt &&
    Data.now() - patient.aiRiskGeneratedAt.getTime() < 24 * 60 * 60 * 1000
  ) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          riskLevel: patient.aiRiskLevel,
          reason: patient.aiRiskReason,
          cached: true,
        },
        "Cached risk assessment returned",
      ),
    );
  }

  // fetch anc records

  const ancRecords = await ANC.find({
    patient: patient._id,
    isActive: true,
  })
    .sort({ visitDate: 1 })
    .lean();

  const prompt = buildRiskPrompt(patient.toObject(), ancRecords);

  try {
    const response = await generateAIResponse(prompt);

    if (!response || typeof response !== "string") {
      throw new ApiError(502, "Invalid AI response");
    }

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(response);
    } catch {
      throw new ApiError(500, "Claude returned invalid json");
    }

    patient.aiRiskLevel = parsedResponse.riskLevel;
    patient.aiRiskReason = parsedResponse.reason;
    patient.aiRiskGeneratedAt = new Date();

    await patient.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          riskLevel: patient.aiRiskLevel,
          reason: patient.aiRiskReason,
          cached: false,
        },
        "Risk assessment generated successfully",
      ),
    );
  } catch (error) {
    if (patient.aiRiskLevel && patient.aiRiskReason) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            riskLevel: patient.aiRiskLevel,
            reason: patient.aiRiskReason,
            cached: true,
            stale: true,
          },
          "AI unavailable. Returning cached risk assessment",
        ),
      );
    }

    throw new ApiError(503, "AI service is temporarily unavailable");
  }
});

export { generateRiskAssessment, generateSummary };
