import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import ChatIcon from "@mui/icons-material/Chat";
import UploadIcon from "@mui/icons-material/Upload";
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
    title: "Chat",
    href: "/chat",
    icon: <ChatIcon fontSize="small" />,
  },
  {
    title: "Data Upload",
    href: "/upload-files",
    icon: <UploadIcon fontSize="small" />,
  },
  {
    title: "Management Incent",
    href: "/purchase",
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
  // {
  //   title: "Item and inventory",
  //   href: "/itemsandinventory",
  //   icon: <FolderIcon fontSize="small" />,
  //   nestedItems: [
  //     {
  //       title: "Transactions",
  //       href: "/itemsandinventory/transactions",
  //     },
  //     {
  //       title: "Inquiries and Reports",
  //       href: "/itemsandinventory/inquiriesandreports",
  //     },
  //     {
  //       title: "Maintenance",
  //       href: "/itemsandinventory/maintenance",
  //     },
  //     {
  //       title: "Pricing and Costs",
  //       href: "/itemsandinventory/pricingandcosts",
  //     },
  //   ],
  // },
  // {
  //   title: "Manufacturing",
  //   href: "/manufacturing",
  //   icon: <ScienceIcon fontSize="small" />,
  //   nestedItems: [
  //     {
  //       title: "Transactions",
  //       href: "/manufacturing/transactions",
  //     },
  //     {
  //       title: "Inquiries and Reports",
  //       href: "/manufacturing/inquiriesandreports",
  //     },
  //     {
  //       title: "Maintenance",
  //       href: "/manufacturing/maintenance",
  //     },
  //   ],
  // },
  // {
  //   title: "Fixed Assets",
  //   href: "/fixedassets",
  //   icon: <EmergencyIcon fontSize="small" />,
  //   nestedItems: [
  //     {
  //       title: "Transactions",
  //       href: "/fixedassets/transactions",
  //     },
  //     {
  //       title: "Inquiries and Reports",
  //       href: "/fixedassets/inquiriesandreports",
  //     },
  //     {
  //       title: "Maintenance",
  //       href: "/fixedassets/maintenance",
  //     },
  //   ],
  // },
  // {
  //   title: "Dimension",
  //   href: "/dimension",
  //   icon: <ChangeHistoryIcon fontSize="small" />,
  //   nestedItems: [
  //     {
  //       title: "Transactions",
  //       href: "/dimension/transactions",
  //     },
  //     {
  //       title: "Inquiries and Reports",
  //       href: "/dimension/inquiriesandreports",
  //     },
  //     {
  //       title: "Maintenance",
  //       href: "/dimension/maintenance",
  //     },
  //   ],
  // },
  // {
  //   title: "Banking And General ledger",
  //   href: "/bankingandgeneralledger",
  //   icon: <PeopleAltIcon fontSize="small" />,
  //   nestedItems: [
  //     {
  //       title: "Transactions",
  //       href: "/bankingandgeneralledger/transactions",
  //     },
  //     {
  //       title: "Inquiries and Reports",
  //       href: "/bankingandgeneralledger/inquiriesandreports",
  //     },
  //     {
  //       title: "Maintenance",
  //       href: "/bankingandgeneralledger/maintenance",
  //     },
  //   ],
  // },
];

// NEW: Export a function that returns filtered items based on user role
// getSidebarItems now accepts a permission flag indicating whether the
// current user can access the Setup section. This lets the caller (layout)
// decide based on role/permissions instead of hardcoding an Admin check.
export const getSidebarItems = (canAccessSetup = false): Array<SidebarItem> => {
  const items = [...baseSidebarItems];

  if (canAccessSetup) {
    items.push({
      title: "Setup",
      href: "/setup",
      icon: <SettingsOutlinedIcon fontSize="small" />,
      nestedItems: [
        {
          title: "Company Setup",
          href: "/setup/companysetup/company-setup",
        },
        {
          title: "User Management",
          href: "/setup/companysetup/user-account-setup",
        },
        {
          title: "User Roles",
          href: "/setup/companysetup/access-setup",
        },
      ],
    });
  }

  return items;
};