import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";


import Dashboard from "./views/Dashboard/Dashboard";
import CompanySetup from "./views/Setup/CompanySetup";
import AddUserForm from "./views/Setup/User/AddUserForm";
import UserManagementTable from "./views/Setup/User/UserManagementTable";
import UserAccessForm from "./views/Setup/UserAccess/AddUserAccessForm";
import AddUserAccessForm from "./views/Setup/UserAccess/AddUserAccessForm";
import UpdateUserAccessForm from "./views/Setup/UserAccess/UpdateUserAccessForm";
import UpdateUserForm from "./views/Setup/User/UpdateUserForm";

import ProtectedRoute from "./components/ProtectedRoute";
import { PERMISSION_ID_MAP } from "./permissions/map";

const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));

const UnderDevelopment = React.lazy(
  () => import("./components/UnderDevelopment")
);

function withLayout(Layout: any, Component: any, restrictAccess = false) {
  return (
    <Layout>
      <Suspense
        fallback={
          <>
            <PageLoader />
          </>
        }
      >
        {restrictAccess ? <PermissionDenied /> : <Component />}
      </Suspense>
    </Layout>
  );
}

function withoutLayout(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense
      fallback={
        <>
          <PageLoader />
        </>
      }
    >
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
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/not-authorized" element={withLayout(MainLayout, PermissionDenied)} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={withLayout(MainLayout, Dashboard)}
        />
      </Route>

      <Route path="/setup" element={<ProtectedRoute required={PERMISSION_ID_MAP['Company Setup']} />}>
        <Route
          path="companysetup"
          element={withLayout(MainLayout, CompanySetup)}
        />
        {/* users setup page - require Users setup permission */}
        <Route
          path="companysetup/user-account-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Users setup']}>
              {withLayout(MainLayout, UserManagementTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/add-user"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Users setup']}>
              {withLayout(MainLayout, AddUserForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/update-user/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Users setup']}>
              {withLayout(MainLayout, UpdateUserForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/access-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Access levels edition']}>
              {withLayout(MainLayout, AddUserAccessForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/edit-access-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Access levels edition']}>
              {withLayout(MainLayout, UpdateUserAccessForm)}
            </ProtectedRoute>
          }
        />
        </Route>
      
        <Route
          path="/dashboard"
          element={withLayout(MainLayout, Dashboard)}
        />
    </Routes>
  );
};

export default AppRoutes;
