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
  "Settings": 1200,
  "Company Setup": 1201,
  "Profile Settings": 1202,

  // Sales Management
  "Sales Management": 1300,
  "Sale": 1301,
  "Sale Items": 1302,
  "Sales Reports": 1303,

  // Expense Management
  "Expense Management": 1400,
  "Add Expense": 1401,
  "View Expenses": 1402,
  "Expense Reports": 1403,

  // Production Management
  "Production Management": 1500,
  "Production": 1501,
  "Production Items": 1502,
  "Production Reports": 1503,

  // Inventory Management
  "Inventory Management": 1600,
  "Items": 1601,
  "Stock List": 1602,
  "Stock Reports": 1603,

  // Bank Management
  "Bank Management": 1700,
  "Bank Accounts": 1701,
  "Bank Transactions": 1702,
  "Bank Reports": 1703,

  // Loan Management
  "Loan Management": 1800,
  "Add Loan": 1801,
  "Loan Installments": 1802,
  "Loan Reports": 1803,

  // Creditors Management
  "Creditors Management": 1900,
  "Suppliers": 1901,
  "Creditors List": 1902,

  // Debtors Management
  "Debtors Management": 2000,
  "Customers": 2001,
  "Debtors List": 2002,

  // Reports (top-level aggregated)
  "Reports": 2100,
  "Profit Reports": 2101,

  // User / Access
  "User Management": 2200,
  "User Account Setup": 2201,
  "User Roles Management": 2202,
};

export const PERMISSION_NAME_BY_ID: Record<number, string> = Object.fromEntries(
  Object.entries(PERMISSION_ID_MAP).map(([k, v]) => [v as any, k])
);

export default PERMISSION_ID_MAP;
