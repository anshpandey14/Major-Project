import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";

const PlaceHolder = ({ title }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}

        <Route path="/login" element={<PlaceHolder title="Login" />} />

        <Route
          path="/unauthorized"
          element={<PlaceHolder title="Unauthorized" />}
        />

        {/* AUTHENTICATED */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/change-password"
            element={<PlaceHolder title="Change Password" />}
          />

          <Route
            path="/complete-profile"
            element={<PlaceHolder title="Complete Profile" />}
          />

          {/* ASHA */}

          <Route element={<ProtectedRoute allowedRoles={["asha"]} />}>
            <Route
              path="/asha/dashboard"
              element={<PlaceHolder title="ASHA Dashboard" />}
            />

            <Route
              path="/asha/patients"
              element={<PlaceHolder title="ASHA Patients" />}
            />

            <Route
              path="/asha/patients/:patientId"
              element={<PlaceHolder title="Patient Profile" />}
            />
          </Route>

          {/* PHC */}

          <Route element={<ProtectedRoute allowedRoles={["phc"]} />}>
            <Route
              path="/phc/dashboard"
              element={<PlaceHolder title="PHC Dashboard" />}
            />

            <Route
              path="/phc/patients"
              element={<PlaceHolder title="PHC Patients" />}
            />

            <Route
              path="/phc/patients/:patientId"
              element={<PlaceHolder title="Patient Profile" />}
            />
          </Route>

          {/* IT ADMIN */}

          <Route element={<ProtectedRoute allowedRoles={["it admin"]} />}>
            <Route
              path="/admin/dashboard"
              element={<PlaceHolder title="Admin Dashboard" />}
            />

            <Route
              path="/admin/register-phc"
              element={<PlaceHolder title="Register PHC" />}
            />
          </Route>
        </Route>

        {/* FALLBACK */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
