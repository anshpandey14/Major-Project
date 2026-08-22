export const buildSummaryPrompt = (
  patient,
  visits,
  vaccinations,
  ancRecords,
) => {
  return `You are an experienced healthcare assistant helping ASHA workers and PHC doctors in rural India.
  
  Your task is to summarize the patient's health information.

  Instructions:
  - Return ONLY 3 to 5 bullet Points.
  - Use simple English.
  - Avoid medical jargon.
  - Mention anything urgent in the final bullet.
  - Do not invent information.
  - If information is unavailable, ignore it.

  Patient Information: ${JSON.stringify(patient, null, 2)}

  Recent Visits: ${JSON.stringify(visits, null, 2)}

  vaccinations: ${JSON.stringify(vaccinations, null, 2)}

  ANC Records: ${JSON.stringify(ancRecords, null, 2)}

  Generate the summary now.
  `;
};

export const buildRiskPrompt = (patient, ancRecords) => {
  return `You are an experienced obstetric healthcare assistant.
  
  Assess pregnancy risk using the ANC recors below.

  Clinical Guidelines:

  - Blood Pressure > 140/90 = High risk

  - Haemoglobin < 8 g/dL = High risk

  - Missed ANC follow-ups increase risk.

  - Rapid weight changes should be considered.

  Return ONLY valid JSON in exact this format:

  {
  "riskLevel":"low | medium | high",
  "reason":"Explain your reasoning in less than 100 words."
  }

  Patient Information: ${JSON.stringify(patient, null, 2)}

  ANC Records: ${JSON.stringify(ancRecords, null, 2)}

  Do not return Markdown.

  Do not return code blocks.

  Return JSON only.
  `;
};
