import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './auth/LoginPage.tsx'
import RequireAuth from './auth/RequireAuth.tsx'
import AppLayout from './components/AppLayout.tsx'
import CalendarPage from './pages/calendar/CalendarPage.tsx'
import PatientProfile from './pages/patient/PatientProfile.tsx'
import PatientsPage from './pages/patients/PatientsPage.tsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/pacientes/:id" element={<PatientProfile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/pacientes" replace />} />
    </Routes>
  )
}
