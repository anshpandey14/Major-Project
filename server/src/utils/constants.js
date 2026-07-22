export const UserRolesEnum = {
  ASHA: "asha",
  PHC: "phc",
};

export const PatientGenderEnum = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

export const PatientBloodGroupEnum = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  UNKNOWN: "Unknown",
};

export const VisitSymptomsEnum = {
  FEVER: "fever",
  COUGH: "cough",
  VOMITING: "vomiting",
  HEADACHE: "headache",
  FATIGUE: "fatigue",
  DIZZINESS: "dizziness",
  CHEST_PAIN: "chest pain",
  ABDOMINAL_PAIN: "abdominal pain",
  SWELLING: "swelling",
  BREATHLESSNESS: "breathlessness",
  BLEEDING: "bleeding",
};

export const VaccineEnum = {
  // Child Vaccines
  BCG: "BCG",
  OPV: "OPV",
  HEPATITIS_B: "Hepatitis B",
  DPT: "DPT",
  MEASLES: "Measles",
  VITAMIN_A: "Vitamin A",

  // Maternal Vaccines
  TT: "TT",
};

export const VaccinationStatusEnum = {
  PENDING: "pending",
  COMPLETED: "completed",
  OVERDUE: "overdue",
};

export const AvailableVaccinationStatus = Object.values(VaccinationStatusEnum);

export const AvailableVaccines = Object.values(VaccineEnum);

export const AvailableVisitSymptoms = Object.values(VisitSymptomsEnum);

export const AvailableBloodGroups = Object.values(PatientBloodGroupEnum);

export const AvailablePatientGender = Object.values(PatientGenderEnum);

export const AvailableUserRole = Object.values(UserRolesEnum);
