import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Program from './pages/Program'
import Calendar from './pages/Calendar'
import SignUps from './pages/SignUps'
import Announcements from './pages/Announcements'
import Volunteer from './pages/Volunteer'
import Missionary from './pages/Missionary'
import Cleaning from './pages/Cleaning'
import Lessons from './pages/Lessons'
import HelpRequest from './pages/HelpRequest'
import ShareGoodNews from './pages/ShareGoodNews'
import NotFound from './pages/NotFound'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminForgotPassword from './pages/admin/AdminForgotPassword'
import AdminResetPassword from './pages/admin/AdminResetPassword'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminEvents from './pages/admin/AdminEvents'
import AdminVolunteer from './pages/admin/AdminVolunteer'
import AdminMeals from './pages/admin/AdminMeals'
import AdminCleaning from './pages/admin/AdminCleaning'
import AdminLessons from './pages/admin/AdminLessons'
import AdminHelpRequests from './pages/admin/AdminHelpRequests'
import AdminGoodNews from './pages/admin/AdminGoodNews'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/program" element={<Program />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/signups" element={<SignUps />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/missionaries" element={<Missionary />} />
      <Route path="/cleaning" element={<Cleaning />} />
      <Route path="/lessons" element={<Lessons />} />
      <Route path="/help" element={<HelpRequest />} />
      <Route path="/good-news" element={<ShareGoodNews />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot" element={<AdminForgotPassword />} />
      <Route path="/admin/reset" element={<AdminResetPassword />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="programs" element={<AdminPrograms />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="volunteer" element={<AdminVolunteer />} />
        <Route path="meals" element={<AdminMeals />} />
        <Route path="cleaning" element={<AdminCleaning />} />
        <Route path="lessons" element={<AdminLessons />} />
        <Route path="help-requests" element={<AdminHelpRequests />} />
        <Route path="good-news" element={<AdminGoodNews />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
