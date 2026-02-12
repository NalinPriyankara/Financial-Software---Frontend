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

          <Route path="/management/achievement-target" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Achievement Targets']}>{withSuspense(AchievementTargetForm)}</ProtectedRoute>
          } />
          <Route path="/management/next-year-forecast" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Next Year Analysis']}>{withSuspense(NextYearForecast)}</ProtectedRoute>
          } />
          <Route path="/management/past-year-analysis" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Past Year Analysis']}>{withSuspense(PastYearAnalysis)}</ProtectedRoute>
          } />

          <Route path="/setup/companysetup/company-setup" element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Company Setup']}>{withSuspense(CompanySetupForm)}</ProtectedRoute>
          } />

          <Route path="/setup/companysetup/update-company-setup/:id" element={withSuspense(UpdateCompanySetupForm)} />

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
