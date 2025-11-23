import { Routes, Route } from "react-router";
import Login from "./pages/auth/Login";
import DashboardLayout from "./layout/admin/DashboardLayout";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import Student from "./pages/admin/student/Student";
import ClassManagement from "./pages/admin/class/ClassManagement";
import Teacher from "./pages/admin/teacher/Teacher";
import PinManagement from "./pages/admin/pin/PinManagement";
import Settings from "./pages/admin/setting/Settings";
import TeacherDashboardLayout from "./layout/teacher/TeacherDashboardLayout";
import TeacherDashboard from "./pages/teacher/dashboard/TeacherDashboard";
import MyClasses from "./pages/teacher/class/MyClasses";
import Setting from "./pages/teacher/settings/Setting";
import AdminMessage from "./pages/admin/message/AdminMessage";
import ParentHome from "./pages/parent/ParentHome";
import Result from "./pages/parent/Result";
import ViewAttendance from "./pages/parent/ViewAttendance";
import ParentMessages from "./pages/parent/ParentMessages";
import SubjectManagement from "./pages/admin/subject/SubjectManagement";
import SubAdminLayout from "./layout/sub_admin/SubAdminLayout";
import SubAdminHome from "./pages/sub_admin/dashboard/SubAdminHome";
import SubAdminResults from "./pages/sub_admin/results/SubAdminResults";
import MyClass_subAdmin from "./pages/sub_admin/class/MyClasses";
import SubAdminAttendance from "./pages/sub_admin/attendance/SubAdminAttendance";
import Profile from "./components/profile/Profile";
import PrivateRoute from "./privateRoute/PrivateRoute";
import NotFound from "./components/notfound/NotFound";
import Attendance from "./pages/teacher/attendance/Attendance";

const App = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />} />

      <Route
        element={
          <PrivateRoute
            allowedRoles={[
              "super_admin",
              "school_admin",
              "principal",
              "class_admin",
              "teacher",
              "parent",
            ]}
          />
        }
      >
        {/* 🔹 Global Profile Page (shared by everyone) */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ===== Admin Routes ===== */}
      <Route
        element={
          <PrivateRoute
            allowedRoles={["class_admin", "school_admin", "principal"]}
          />
        }
      >
        <Route path="/admin/dashboard" element={<DashboardLayout />}>
          <Route path="" element={<Dashboard />} />
          <Route path="students" element={<Student />} />
          <Route path="teachers" element={<Teacher />} />
          <Route path="class-management" element={<ClassManagement />} />
          <Route path="pin-management" element={<PinManagement />} />
          <Route path="settings" element={<Settings />} />
          {/* <Route path="profile" element={<Profile />} /> */}
          <Route path="message" element={<AdminMessage />} />
          <Route path="subject-management" element={<SubjectManagement />} />
        </Route>
      </Route>

      {/* ===== Teacher Routes ===== */}
      <Route element={<PrivateRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboardLayout />}>
          <Route path="" element={<TeacherDashboard />} />
          <Route path="classes" element={<MyClasses />} />
          <Route path="settings" element={<Setting />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
      </Route>

      {/* ===== Sub-Admin Routes ===== */}
      <Route element={<PrivateRoute allowedRoles={["class_admin"]} />}>
        <Route path="/class_admin/dashboard" element={<SubAdminLayout />}>
          <Route path="" element={<SubAdminHome />} />
          <Route path="results" element={<SubAdminResults />} />
          <Route path="attendance" element={<SubAdminAttendance />} />
          <Route path="classes" element={<MyClass_subAdmin />} />
          {/* <Route path="profile" element={<Profile />} /> */}
        </Route>
      </Route>

      {/* ===== Parent Routes ===== */}
      <Route element={<PrivateRoute allowedRoles={["parent"]} />}>
        <Route path="/home" element={<ParentHome />} />
        <Route path="/parent/result" element={<Result />} />
        <Route path="/parent/attendance" element={<ViewAttendance />} />
        <Route path="/parent/messages" element={<ParentMessages />} />
      </Route>

      {/* ===== Catch-All (404) ===== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
