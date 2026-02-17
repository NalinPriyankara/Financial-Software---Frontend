import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import ChatIcon from "@mui/icons-material/Chat";
import UploadIcon from "@mui/icons-material/Upload";
import SalesIcon from "@mui/icons-material/PointOfSale";
import ExpensesIcon from "@mui/icons-material/ReceiptLong";
import ProductionIcon from "@mui/icons-material/Factory";
import InventoryIcon from "@mui/icons-material/Inventory";
import BankIcon from "@mui/icons-material/AccountBalance";
import LoanIcon from "@mui/icons-material/MonetizationOn";
import CreditorsIcon from "@mui/icons-material/Group";
import DebtorsIcon from "@mui/icons-material/People";
import ReportsIcon from "@mui/icons-material/BarChart";
import UserIcon from "@mui/icons-material/Person";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import SpaIcon from "@mui/icons-material/Spa";
import ForestIcon from "@mui/icons-material/Forest";
import ScienceIcon from "@mui/icons-material/Science";
import EmergencyIcon from "@mui/icons-material/Emergency";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import FolderIcon from "@mui/icons-material/Folder";
import ConstructionIcon from "@mui/icons-material/Construction";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import DatasetLinkedOutlinedIcon from "@mui/icons-material/DatasetLinkedOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyIcon from "@mui/icons-material/Key";

export interface SidebarItem {
  title?: string;
  headline?: string;
  icon?: JSX.Element;
  open?: boolean;
  href?: string;
  disabled?: boolean;
  accessKey?: string;
  nestedItems?: {
    title: string;
    href: string;
    icon?: JSX.Element;
    accessKey?: string;
    open?: boolean;
    disabled?: boolean;
    nestedItems?: {
      accessKey?: string;
      title: string;
      href: string;
      icon?: JSX.Element;
      disabled?: boolean;
    }[];
  }[];
}

const baseSidebarItems: Array<SidebarItem> = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    title: "Sales Management",
    href: "/sales",
    icon: <SalesIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Add Sale",
        href: "/sales/add-sale",
      },
      {
        title: "View Sales",
        href: "/sales/view-sales",
      },
      {
        title: "Sales Reports",
        href: "/sales/sales-reports",
      },
    ],
  },
  {
    title: "Expense Management",
    href: "/expenses",
    icon: <ExpensesIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Add Expense",
        href: "/expenses/add-expense",
      },
      {
        title: "View Expenses",
        href: "/expenses/view-expenses",
      },
      {
        title: "Expense Reports",
        href: "/expenses/expense-reports",
      },
    ],
  },
  {
    title: "Production Management",
    href: "/production",
    icon: <ProductionIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Add Production",
        href: "/production/add-production",
      },
      {
        title: "View Production",
        href: "/production/view-production",
      },
      {
        title: "Production Reports",
        href: "/production/production-reports",
      },
    ],
  },
  {
    title: "Inventory Management",
    href: "/inventory",
    icon: <InventoryIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Items",
        href: "/inventory/items",
      },
      {
        title: "Stock List",
        href: "/inventory/stock-list",
      },
      {
        title: "Stock Reports",
        href: "/inventory/stock-reports",
      },
    ],
  },
  {
    title: "Bank Management",
    href: "/bank",
    icon: <BankIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Bank Accounts",
        href: "/bank/bank-accounts",
      },
      {
        title: "Bank Transactions",
        href: "/bank/bank-transactions",
      },
      {
        title: "Bank Reports",
        href: "/bank/bank-reports",
      },
    ],
  },
  {
    title: "Loan Management",
    href: "/loan",
    icon: <LoanIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Add Loan",
        href: "/loan/add-loan",
      },
      {
        title: "Loan Installments",
        href: "/loan/loan-installments",
      },
      {
        title: "Loan Reports",
        href: "/loan/loan-reports",
      },
    ],
  },
  {
    title: "Creditors Management",
    href: "/creditors",
    icon: <CreditorsIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Suppliers",
        href: "/creditors/suppliers",
      },
      {
        title: "Creditors List",
        href: "/creditors/creditors-list",
      },
    ],
  },
  {
    title: "Debtors Management",
    href: "/debtors",
    icon: <DebtorsIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Customers",
        href: "/debtors/customers",
      },
      {
        title: "Debtors List",
        href: "/debtors/debtors-list",
      },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <ReportsIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Sales Reports",
        href: "/reports/sales-reports",
      },
      {
        title: "Expense Reports",
        href: "/reports/expense-reports",
      },
      {
        title: "Production Reports",
        href: "/reports/production-reports",
      },
      {
        title: "Profit Reports",
        href: "/reports/profit-reports",
      },
      {
        title: "Stock Reports",
        href: "/reports/stock-reports",
      },
    ],
  },
  {
    title: "Data Upload",
    href: "/upload-files",
    icon: <UploadIcon fontSize="small" />,
  },
  {
    title: "Management Incent",
    href: "/management",
    icon: <ForestIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Past Year Analysis",
        href: "/management/past-year-analysis",
      },
      {
        title: "Next Year Forecast ",
        href: "/management/next-year-forecast",
      },
      {
        title: "Achievement targets",
        href: "/management/achievement-target",
      },
    ],
  },
  {
    title: "User Management",
    href: "/setup",
    icon: <UserIcon fontSize="small" />,
    nestedItems: [
      {
        title: "User Management",
        href: "/setup/companysetup/user-account-setup",
      },
      {
        title: "User Roles",
        href: "/setup/companysetup/access-setup",
      },
    ],
  },

];

// NEW: Export a function that returns filtered items based on user role
// getSidebarItems now accepts a permission flag indicating whether the
// current user can access the Setup section. This lets the caller (layout)
// decide based on role/permissions instead of hardcoding an Admin check.
export const getSidebarItems = (canAccessSetup = false): Array<SidebarItem> => {
  const items = [...baseSidebarItems];

  if (canAccessSetup) {
    items.push({
      title: "Settings",
      href: "/settings",
      icon: <SettingsOutlinedIcon fontSize="small" />,
      nestedItems: [
        {
          title: "Company Setup",
          href: "/settings/companysetup/company-setup",
        },
        {
          title: "Profile Settings",
          href: "/settings/profile",
        },
      ],
    });
  }

  return items;
};