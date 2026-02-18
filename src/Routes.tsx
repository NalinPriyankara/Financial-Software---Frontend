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
import AddUserForm from "./views/Setup/User/AddUserForm";
import UserManagementTable from "./views/Setup/User/UserManagementTable";
import UserAccessForm from "./views/Setup/UserAccess/AddUserAccessForm";
import AddUserAccessForm from "./views/Setup/UserAccess/AddUserAccessForm";
import UpdateUserAccessForm from "./views/Setup/UserAccess/UpdateUserAccessForm";
import UpdateUserForm from "./views/Setup/User/UpdateUserForm";

import ProtectedRoute from "./components/ProtectedRoute";
import { PERMISSION_ID_MAP } from "./permissions/map";
import CompanySetupForm from "./views/Setup/CompanySetup/CompanySetupForm";
import UpdateCompanySetupForm from "./views/Setup/CompanySetup/UpdateCompanySetupForm";
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
            <ProtectedRoute>{withSuspense(SalesTable)}</ProtectedRoute>
          } />
          <Route path="/sales/add-sale" element={
            <ProtectedRoute>{withSuspense(AddSalesForm)}</ProtectedRoute>
          } />
          <Route path="/sales/update-sale/:id" element={
            <ProtectedRoute>{withSuspense(UpdateSalesForm)}</ProtectedRoute>
          } />
          <Route path="/sales/view-sale-items" element={
            <ProtectedRoute>{withSuspense(SaleItemsTable)}</ProtectedRoute>
          } />
          <Route path="/sales/add-sale-item" element={
            <ProtectedRoute>{withSuspense(AddSaleItemForm)}</ProtectedRoute>
          } />
          <Route path="/sales/update-sale-item/:id" element={
            <ProtectedRoute>{withSuspense(UpdateSaleItemForm)}</ProtectedRoute>
          } />

          
          <Route path="/expenses/view-expenses" element={
            <ProtectedRoute>{withSuspense(ExpensesTable)}</ProtectedRoute>
          } />
          <Route path="/expenses/add-expense" element={
            <ProtectedRoute>{withSuspense(AddExpenseForm)}</ProtectedRoute>
          } />
          <Route path="/expenses/update-expense/:id" element={
            <ProtectedRoute>{withSuspense(UpdateExpenseForm)}</ProtectedRoute>
          } />


          <Route path="/inventory/view-items" element={
            <ProtectedRoute>{withSuspense(ItemsTable)}</ProtectedRoute>
          } />
          <Route path="/inventory/add-item" element={
            <ProtectedRoute>{withSuspense(AddItemForm)}</ProtectedRoute>
          } />
          <Route path="/inventory/update-item/:id" element={
            <ProtectedRoute>{withSuspense(UpdateItemForm)}</ProtectedRoute>
          } />
          <Route path="/inventory/stock-list" element={
            <ProtectedRoute>{withSuspense(StocksTable)}</ProtectedRoute>
          } />
          <Route path="/inventory/add-stock" element={
            <ProtectedRoute>{withSuspense(AddStockForm)}</ProtectedRoute>
          } />
          <Route path="/inventory/update-stock/:id" element={
            <ProtectedRoute>{withSuspense(UpdateStockForm)}</ProtectedRoute>
          } />


          <Route path="/production/view-productions" element={
            <ProtectedRoute>{withSuspense(ProductionsTable)}</ProtectedRoute>
          } />
          <Route path="/production/add-production" element={
            <ProtectedRoute>{withSuspense(AddProductionForm)}</ProtectedRoute>
          } />
          <Route path="/production/update-production/:id" element={
            <ProtectedRoute>{withSuspense(UpdateProductionForm)}</ProtectedRoute>
          } />
          <Route path="/production/view-production-items" element={
            <ProtectedRoute>{withSuspense(ProductionItemsTable)}</ProtectedRoute>
          } />
          <Route path="/production/add-production-item" element={
            <ProtectedRoute>{withSuspense(AddProductionItemForm)}</ProtectedRoute>
          } />
          <Route path="/production/update-production-item/:id" element={
            <ProtectedRoute>{withSuspense(UpdateProductionItemForm)}</ProtectedRoute>
          } />


          <Route path="/bank/view-bank-accounts" element={
            <ProtectedRoute>{withSuspense(BankAccountsTable)}</ProtectedRoute>
          } />
          <Route path="/bank/add-bank-account" element={
            <ProtectedRoute>{withSuspense(AddBankAccountForm)}</ProtectedRoute>
          } />
          <Route path="/bank/update-bank-account/:id" element={
            <ProtectedRoute>{withSuspense(UpdateBankAccountForm)}</ProtectedRoute>
          } />
          <Route path="/bank/view-bank-transactions" element={
            <ProtectedRoute>{withSuspense(BankTransactionsTable)}</ProtectedRoute>
          } />
          <Route path="/bank/add-bank-transaction" element={
            <ProtectedRoute>{withSuspense(AddBankTransactionForm)}</ProtectedRoute>
          } />


          <Route path="/loan/view-loans" element={
            <ProtectedRoute>{withSuspense(LoansTable)}</ProtectedRoute>
          } />
          <Route path="/loan/add-loan" element={
            <ProtectedRoute>{withSuspense(AddLoanForm)}</ProtectedRoute>
          } />
          <Route path="/loan/update-loan/:id" element={
            <ProtectedRoute>{withSuspense(UpdateLoanForm)}</ProtectedRoute>
          } />
          <Route path="/loan/view-loan-installments" element={
            <ProtectedRoute>{withSuspense(LoanInstallmentsTable)}</ProtectedRoute>
          } />
          <Route path="/loan/add-loan-installment" element={
            <ProtectedRoute>{withSuspense(AddLoanInstallmentForm)}</ProtectedRoute>
          } />


          <Route path="/debtors/customers" element={
            <ProtectedRoute>{withSuspense(CustomersTable)}</ProtectedRoute>
          } />
          <Route path="/debtors/customers/add-customer" element={
            <ProtectedRoute>{withSuspense(AddCustomerForm)}</ProtectedRoute>
          } />
          <Route path="/debtors/customers/update-customer/:id" element={
            <ProtectedRoute>{withSuspense(UpdateCustomerForm)}</ProtectedRoute>
          } />
          <Route path="/debtors/debtors-list" element={
            <ProtectedRoute>{withSuspense(DebtorsTable)}</ProtectedRoute>
          } />
          <Route path="/debtors/add-debtor" element={
            <ProtectedRoute>{withSuspense(AddDebtorForm)}</ProtectedRoute>
          } />
          <Route path="/debtors/update-debtor/:id" element={
            <ProtectedRoute>{withSuspense(UpdateDebtorForm)}</ProtectedRoute>
          } />


          <Route path="/creditors/suppliers" element={
            <ProtectedRoute>{withSuspense(SuppliersTable)}</ProtectedRoute>
          } />
          <Route path="/creditors/suppliers/add-supplier" element={
            <ProtectedRoute>{withSuspense(AddSupplierForm)}</ProtectedRoute>
          } />
          <Route path="/creditors/suppliers/update-supplier/:id" element={
            <ProtectedRoute>{withSuspense(UpdateSupplierForm)}</ProtectedRoute>
          } />
          <Route path="/creditors/creditors-list" element={
            <ProtectedRoute>{withSuspense(CreditorsTable)}</ProtectedRoute>
          } />
          <Route path="/creditors/add-creditor" element={
            <ProtectedRoute>{withSuspense(AddCreditorForm)}</ProtectedRoute>
          } />
          <Route path="/creditors/update-creditor/:id" element={
            <ProtectedRoute>{withSuspense(UpdateCreditorForm)}</ProtectedRoute>
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

          <Route path="/setup/companysetup/user-account-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Management']}>{withSuspense(UserManagementTable)}</ProtectedRoute>
          } />

          <Route path="/setup/companysetup/add-user" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Management']}>{withSuspense(AddUserForm)}</ProtectedRoute>
          } />

          <Route path="/setup/companysetup/update-user/:id" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Management']}>{withSuspense(UpdateUserForm)}</ProtectedRoute>
          } />

          <Route path="/setup/companysetup/access-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Roles']}>{withSuspense(AddUserAccessForm)}</ProtectedRoute>
          } />

          <Route path="/setup/companysetup/edit-access-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['User Roles']}>{withSuspense(UpdateUserAccessForm)}</ProtectedRoute>
          } />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
