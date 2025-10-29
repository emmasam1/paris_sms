import { Routes, Route } from "react-router";
import Login from "./pages/auth/Login";
import DashboardLayout from "./layout/admin/DashboardLayout";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import Student from "./pages/admin/student/Student";
import Teacher from "./pages/admin/teacher/Teacher";
import ClassManagement from "./pages/admin/class/ClassManagement ";
import PinManagement from "./pages/admin/pin/PinManagement";
import Settings from "./pages/admin/setting/Settings";
import TeacherDashboardLayout from "./layout/teacher/TeacherDashboardLayout";
import TeacherDashboard from "./pages/teacher/dashboard/TeacherDashboard";
import MyClasses from "./pages/teacher/class/MyClasses";
import Setting from "./pages/teacher/settings/Setting";
import TeacherProfile from "./pages/teacher/profile/TeacherProfile";
import AdminMessage from "./pages/admin/message/AdminMessage ";
import ParentHome from "./pages/parent/ParentHome";
import Result from "./pages/parent/Result";
import ViewAttendance from "./pages/parent/ViewAttendance";
import ParentMessages from "./pages/parent/ParentMessages";
import SubjectManagement from "./pages/admin/subject/SubjectManagement";
import SubAdminLayout from "./layout/sub_admin/SubAdminLayout";
import SubAdminHome from "./pages/sub_admin/dashboard/SubAdminHome";
import SubAdminResults from "./pages/sub_admin/results/SubAdminResults";
import SubAdminAttendance from "./pages/sub_admin/attendance/SubAdminAttendance";
import AdminProfile from "./pages/admin/profile/AdminProfile";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/dashboard" element={<DashboardLayout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="students" element={<Student />} />
        <Route path="teachers" element={<Teacher />} />
        <Route path="class-management" element={<ClassManagement />} />
        <Route path="pin-management" element={<PinManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="message" element={<AdminMessage />} />
        <Route path="subject-management" element={<SubjectManagement />} />
      </Route>

      <Route path="/teacher/dashboard" element={<TeacherDashboardLayout />}>
        <Route path="" element={<TeacherDashboard />} />
        <Route path="classes" element={<MyClasses />} />
        <Route path="settings" element={<Setting />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

       <Route path="/sub-admin/dashboard" element={<SubAdminLayout />}>
        <Route path="" element={<SubAdminHome />} />
        <Route path="results" element={<SubAdminResults />} />
        <Route path="attendance" element={<SubAdminAttendance />} />
       </Route>

      <Route path="/home" element={<ParentHome />} />
      <Route path="/parent/result" element={<Result />} />
      <Route path="/parent/attendance" element={<ViewAttendance />} />
      <Route path="/parent/messages" element={<ParentMessages />} />
    </Routes>
  );
};

export default App;
