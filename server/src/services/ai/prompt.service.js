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


