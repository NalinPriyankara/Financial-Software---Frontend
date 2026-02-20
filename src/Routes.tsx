import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";


import Dashboard from "./views/Dashboard/Dashboard";
import AIChat from "./views/Chat/AIChat";
import UploadFilesPage from "./views/UploadFiles/UploadFilesPage";
import AddUserForm from "./views/UserManagement/User/AddUserForm";
import UserManagementTable from "./views/UserManagement/User/UserManagementTable";
import UserAccessForm from "./views/UserManagement/UserAccess/AddUserAccessForm";
import AddUserAccessForm from "./views/UserManagement/UserAccess/AddUserAccessForm";
import UpdateUserAccessForm from "./views/UserManagement/UserAccess/UpdateUserAccessForm";
import UpdateUserForm from "./views/UserManagement/User/UpdateUserForm";

import ProtectedRoute from "./components/ProtectedRoute";
import { PERMISSION_ID_MAP } from "./permissions/map";
import CompanySetupForm from "./views/Settings/CompanySetup/CompanySetupForm";
import UpdateCompanySetupForm from "./views/Settings/CompanySetup/UpdateCompanySetupForm";
import ViewUserProfileContent from "./views/Administration/ViewUserProfileContent";
import AchievementTargetForm from "./views/Management/AchievementTarget/AchievementTargetForm";
import NextYearForecast from "./views/Management/NextYearForecast/NextYearForecast";
import PastYearAnalysis from "./views/Management/PastYearAnalysis/PastYearAnalysis";
import SalesTable from "./views/SalesManagement/Sales/SalesTable";
import AddSalesForm from "./views/SalesManagement/Sales/AddSalesForm";
import UpdateSalesForm from "./views/SalesManagement/Sales/UpdateSalesForm";
import CustomersTable from "./views/DebtorManagement/Customer/CustomersTable";
import AddCustomerForm from "./views/DebtorManagement/Customer/AddCustomerForm";
import UpdateCustomerForm from "./views/DebtorManagement/Customer/UpdateCustomerForm";
import UpdateDebtorForm from "./views/DebtorManagement/Debtor/UpdateDebtorForm";
import AddDebtorForm from "./views/DebtorManagement/Debtor/AddDebtorForm";
import DebtorsTable from "./views/DebtorManagement/Debtor/DebtorsTable";
import SuppliersTable from "./views/CreditorManagement/Suppliers/SuppliersTable";
import AddSupplierForm from "./views/CreditorManagement/Suppliers/AddSupplierForm";
import UpdateSupplierForm from "./views/CreditorManagement/Suppliers/UpdateSupplierForm";
import CreditorsTable from "./views/CreditorManagement/Creditors/CreditorsTable";
import AddCreditorForm from "./views/CreditorManagement/Creditors/AddCreditorForm";
import UpdateCreditorForm from "./views/CreditorManagement/Creditors/UpdateCreditorForm";
import ExpensesTable from "./views/Expenses/ExpensesTable";
import AddExpenseForm from "./views/Expenses/AddExpenseForm";
import UpdateExpenseForm from "./views/Expenses/UpdateExpenseForm";
import ItemsTable from "./views/InventoryManagement/Items/ItemsTable";
import AddItemForm from "./views/InventoryManagement/Items/AddItemForm";
import UpdateItemForm from "./views/InventoryManagement/Items/UpdateItemForm";
import StocksTable from "./views/InventoryManagement/Stocks/StocksTable";
import AddStockForm from "./views/InventoryManagement/Stocks/AddStockForm";
import UpdateStockForm from "./views/InventoryManagement/Stocks/UpdateStockForm";
import ProductionsTable from "./views/ProductionManagement/Production/ProductionsTable";
import AddProductionForm from "./views/ProductionManagement/Production/AddProductionForm";
import UpdateProductionForm from "./views/ProductionManagement/Production/UpdateProductionForm";
import BankAccountsTable from "./views/BankManagement/BankAccounts/BankAccountsTable";
import AddBankAccountForm from "./views/BankManagement/BankAccounts/AddBankAccountForm";
import UpdateBankAccountForm from "./views/BankManagement/BankAccounts/UpdateBankAccountForm";
import BankTransactionsTable from "./views/BankManagement/BankTransactions/BankTransactionsTable";
import AddBankTransactionForm from "./views/BankManagement/BankTransactions/AddBankTransactionForm";
import LoansTable from "./views/LoanManagement/Loans/LoansTable";
import AddLoanForm from "./views/LoanManagement/Loans/AddLoanForm";
import UpdateLoanForm from "./views/LoanManagement/Loans/UpdateLoanForm";
import AddLoanInstallmentForm from "./views/LoanManagement/LoanInstallments/AddLoanInstallmentForm";
import LoanInstallmentsTable from "./views/LoanManagement/LoanInstallments/LoanInstallmentsTable";
import SaleItemsTable from "./views/SalesManagement/SaleItems/SaleItemsTable";
import AddSaleItemForm from "./views/SalesManagement/SaleItems/AddSaleItemForm";
import UpdateSaleItemForm from "./views/SalesManagement/SaleItems/UpdateSaleItemForm";
import ProductionItemsTable from "./views/ProductionManagement/ProductionItems/ProductionItemsTable";
import AddProductionItemForm from "./views/ProductionManagement/ProductionItems/AddProductionItemForm";
import UpdateProductionItemForm from "./views/ProductionManagement/ProductionItems/UpdateProductionItemForm";
import SalesReport from "./views/SalesManagement/Reports/SalesReport";

const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));

const UnderDevelopment = React.lazy(
  () => import("./components/UnderDevelopment")
);

function withSuspense(Component: any) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Note: auth and permission checks are handled by `src/context/AuthContext` and
// `src/components/ProtectedRoute`. Use the component below to guard routes.

const AppRoutes = () => {
  const token = localStorage.getItem("token");
  const { data: user, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
    enabled: !!token, // Only run query if token exists
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);
  // Wrapper component that passes the currently-logged-in user to the profile view
  const CurrentUserProfile = () => {
    if (!user) return <PageLoader />;
    return <ViewUserProfileContent selectedUser={user} />;
  };
  return (
    <Routes>
      <Route path="/" element={withSuspense(LoginPage)} />
      <Route path="/not-authorized" element={<MainLayout>{withSuspense(PermissionDenied)}</MainLayout>} />

      {/* Protected area: MainLayout mounts once here and children render inside it */}
      <Route element={<ProtectedRoute />}> 
        <Route element={<MainLayout />}> 
          <Route path="/dashboard" element={withSuspense(Dashboard)} />
          {/* <Route path="/chat" element={withSuspense(AIChat)} /> */}
          <Route path="/upload-files" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Data Upload']}>{withSuspense(UploadFilesPage)}</ProtectedRoute>
          } />


          <Route path="/sales/view-sales" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sale']}>{withSuspense(SalesTable)}</ProtectedRoute>
          } />
          <Route path="/sales/add-sale" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sale']}>{withSuspense(AddSalesForm)}</ProtectedRoute>
          } />
          <Route path="/sales/update-sale/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sale']}>{withSuspense(UpdateSalesForm)}</ProtectedRoute>
          } />
          <Route path="/sales/view-sale-items" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sale Items']}>{withSuspense(SaleItemsTable)}</ProtectedRoute>
          } />
          <Route path="/sales/add-sale-item" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sale Items']}>{withSuspense(AddSaleItemForm)}</ProtectedRoute>
          } />
          <Route path="/sales/update-sale-item/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sale Items']}>{withSuspense(UpdateSaleItemForm)}</ProtectedRoute>
          } />
          <Route path="/sales/report" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales Reports']}>{withSuspense(SalesReport)}</ProtectedRoute>
          } />

          
          <Route path="/expenses/view-expenses" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Add Expense']}>{withSuspense(ExpensesTable)}</ProtectedRoute>
          } />
          <Route path="/expenses/add-expense" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['View Expense']}>{withSuspense(AddExpenseForm)}</ProtectedRoute>
          } />
          <Route path="/expenses/update-expense/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['View Expense']}>{withSuspense(UpdateExpenseForm)}</ProtectedRoute>
          } />


          <Route path="/inventory/view-items" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Items']}>{withSuspense(ItemsTable)}</ProtectedRoute>
          } />
          <Route path="/inventory/add-item" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Items']}>{withSuspense(AddItemForm)}</ProtectedRoute>
          } />
          <Route path="/inventory/update-item/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Items']}>{withSuspense(UpdateItemForm)}</ProtectedRoute>
          } />
          <Route path="/inventory/stock-list" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock List']}>{withSuspense(StocksTable)}</ProtectedRoute>
          } />
          <Route path="/inventory/add-stock" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock List']}>{withSuspense(AddStockForm)}</ProtectedRoute>
          } />
          <Route path="/inventory/update-stock/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock List']}>{withSuspense(UpdateStockForm)}</ProtectedRoute>
          } />


          <Route path="/production/view-productions" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Production']}>{withSuspense(ProductionsTable)}</ProtectedRoute>
          } />
          <Route path="/production/add-production" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Production']}>{withSuspense(AddProductionForm)}</ProtectedRoute>
          } />
          <Route path="/production/update-production/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Production']}>{withSuspense(UpdateProductionForm)}</ProtectedRoute>
          } />
          <Route path="/production/view-production-items" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Production Items']}>{withSuspense(ProductionItemsTable)}</ProtectedRoute>
          } />
          <Route path="/production/add-production-item" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Production Items']}>{withSuspense(AddProductionItemForm)}</ProtectedRoute>
          } />
          <Route path="/production/update-production-item/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Production Items']}>{withSuspense(UpdateProductionItemForm)}</ProtectedRoute>
          } />


          <Route path="/bank/view-bank-accounts" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank Accounts']}>{withSuspense(BankAccountsTable)}</ProtectedRoute>
          } />
          <Route path="/bank/add-bank-account" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank Accounts']}>{withSuspense(AddBankAccountForm)}</ProtectedRoute>
          } />
          <Route path="/bank/update-bank-account/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank Accounts']}>{withSuspense(UpdateBankAccountForm)}</ProtectedRoute>
          } />
          <Route path="/bank/view-bank-transactions" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank Transactions']}>{withSuspense(BankTransactionsTable)}</ProtectedRoute>
          } />
          <Route path="/bank/add-bank-transaction" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank Transactions']}>{withSuspense(AddBankTransactionForm)}</ProtectedRoute>
          } />


          <Route path="/loan/view-loans" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Add Loan']}>{withSuspense(LoansTable)}</ProtectedRoute>
          } />
          <Route path="/loan/add-loan" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Add Loan']}>{withSuspense(AddLoanForm)}</ProtectedRoute>
          } />
          <Route path="/loan/update-loan/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Add Loan']}>{withSuspense(UpdateLoanForm)}</ProtectedRoute>
          } />
          <Route path="/loan/view-loan-installments" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Loan Installments']}>{withSuspense(LoanInstallmentsTable)}</ProtectedRoute>
          } />
          <Route path="/loan/add-loan-installment" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Loan Installments']}>{withSuspense(AddLoanInstallmentForm)}</ProtectedRoute>
          } />


          <Route path="/debtors/customers" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Customers']}>{withSuspense(CustomersTable)}</ProtectedRoute>
          } />
          <Route path="/debtors/customers/add-customer" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Customers']}>{withSuspense(AddCustomerForm)}</ProtectedRoute>
          } />
          <Route path="/debtors/customers/update-customer/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Customers']}>{withSuspense(UpdateCustomerForm)}</ProtectedRoute>
          } />
          <Route path="/debtors/debtors-list" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Debtors List']}>{withSuspense(DebtorsTable)}</ProtectedRoute>
          } />
          <Route path="/debtors/add-debtor" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Debtors List']}>{withSuspense(AddDebtorForm)}</ProtectedRoute>
          } />
          <Route path="/debtors/update-debtor/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Debtors List']}>{withSuspense(UpdateDebtorForm)}</ProtectedRoute>
          } />


          <Route path="/creditors/suppliers" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers']}>{withSuspense(SuppliersTable)}</ProtectedRoute>
          } />
          <Route path="/creditors/suppliers/add-supplier" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers']}>{withSuspense(AddSupplierForm)}</ProtectedRoute>
          } />
          <Route path="/creditors/suppliers/update-supplier/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers']}>{withSuspense(UpdateSupplierForm)}</ProtectedRoute>
          } />
          <Route path="/creditors/creditors-list" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Creditors List']}>{withSuspense(CreditorsTable)}</ProtectedRoute>
          } />
          <Route path="/creditors/add-creditor" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Creditors List']}>{withSuspense(AddCreditorForm)}</ProtectedRoute>
          } />
          <Route path="/creditors/update-creditor/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Creditors List']}>{withSuspense(UpdateCreditorForm)}</ProtectedRoute>
          } />
          

          <Route path="/management/achievement-target" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Achievement Targets']}>{withSuspense(AchievementTargetForm)}</ProtectedRoute>
          } />
          <Route path="/management/next-year-forecast" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Next Year Analysis']}>{withSuspense(NextYearForecast)}</ProtectedRoute>
          } />
          <Route path="/management/past-year-analysis" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Past Year Analysis']}>{withSuspense(PastYearAnalysis)}</ProtectedRoute>
          } />


          <Route path="/settings/companysetup/company-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Company Setup']}>{withSuspense(CompanySetupForm)}</ProtectedRoute>
          } />
          <Route path="/settings/companysetup/update-company-setup/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Company Setup']}>{withSuspense(UpdateCompanySetupForm)}</ProtectedRoute>
          } />

          <Route path="/settings/profile" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Profile Settings']}>{withSuspense(CurrentUserProfile)}</ProtectedRoute>
          } />



          <Route path="/user-management/user-account-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Management']}>{withSuspense(UserManagementTable)}</ProtectedRoute>
          } />
          <Route path="/user-management/add-user" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Account Setup']}>{withSuspense(AddUserForm)}</ProtectedRoute>
          } />
          <Route path="/user-management/update-user/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Account Setup']}>{withSuspense(UpdateUserForm)}</ProtectedRoute>
          } />
          <Route path="/user-management/access-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Roles Management']}>{withSuspense(AddUserAccessForm)}</ProtectedRoute>
          } />
          <Route path="/user-management/edit-access-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Roles Management']}>{withSuspense(UpdateUserAccessForm)}</ProtectedRoute>
          } />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
