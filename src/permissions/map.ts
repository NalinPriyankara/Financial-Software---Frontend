// Central permission id map used across the app
// Simplified to three top-level sections with a few nested permissions
export const PERMISSION_ID_MAP: Record<string, number> = {
  // Section 1: Data Upload
  "Data Upload": 1000,

  // Section 2: Management Incent
  "Management Incent": 1100,
  "Past Year Analysis": 1101,
  "Next Year Analysis": 1102,
  "Achievement Targets": 1103,

  // Section 3: Setup
  "Setup": 1200,
  "Company Setup": 1201,
  "User Management": 1202,
  "User Roles": 1203,
};

export const PERMISSION_NAME_BY_ID: Record<number, string> = Object.fromEntries(
  Object.entries(PERMISSION_ID_MAP).map(([k, v]) => [v as any, k])
);

export default PERMISSION_ID_MAP;
