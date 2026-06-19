export const UserRolesEnum = {
  ASHA: "asha",
  PHC: "phc",
};

export const PatientGenderEnum = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

export const PatientBloodGroupEnum = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

export const AvailableBloodGroups = Object.values(PatientBloodGroupEnum);

export const AvailablePatientGender = Object.values(PatientGenderEnum);

export const AvailableUserRole = Object.values(UserRolesEnum);
