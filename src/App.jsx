import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import RequireAuth from "./components/RequireAuth";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Vehicles from "./pages/Vehicles";
import Tasks from "./pages/Tasks";
import Inspection from "./pages/Inspection";
import SupportStaff from "./pages/SupportStaff";
import LiveTracking from "./pages/LiveTracking";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="inspection" element={<Inspection />} />
          <Route path="support" element={<SupportStaff />} />
          <Route path="live" element={<LiveTracking />} />
        </Route>

        {/* OPTIONAL: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
