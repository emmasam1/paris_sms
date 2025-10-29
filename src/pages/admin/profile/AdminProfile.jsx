import { useEffect, useState } from "react";
import { Card, Avatar, Divider, Tag, Skeleton } from "antd";
import {
  MailOutlined,
  BookOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const AdminProfile = () => {
  const { API_BASE_URL, token } = useApp();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(res.data.data);
    } catch (error) {
      console.log("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getUserProfile();
  }, [token]);

  // Avatar display
  const renderAvatar = () => {
    if (userData?.avatar) {
      return (
        <Avatar
          size={120}
          src={userData.avatar}
          className="border-2 border-blue-400 shadow-sm"
        />
      );
    }

    const initials =
      userData?.firstName && userData?.lastName
        ? `${userData.firstName[0]}${userData.lastName[0]}`
        : "U";
    return (
      <Avatar
        size={120}
        className="border-2 border-blue-400 shadow-sm !bg-blue-500 !text-white text-2xl flex items-center justify-center"
      >
        {initials.toUpperCase()}
      </Avatar>
    );
  };

  return (
    <div>
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        {loading ? (
          <>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Skeleton.Avatar active size={120} shape="circle" />
              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <Skeleton.Input active size="large" style={{ width: 200 }} />
                <Skeleton.Input active size="small" style={{ width: 150 }} />
                <Skeleton.Input active size="small" style={{ width: 180 }} />
                <Skeleton.Input active size="small" style={{ width: 150 }} />
              </div>
            </div>
            <Divider />
            <Skeleton active paragraph={{ rows: 8 }} />
          </>
        ) : (
          <>
            {/* ===== User Info ===== */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {renderAvatar()}

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-semibold">
                  {userData?.title ? `${userData.title} ` : ""}
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-gray-500 capitalize">{userData?.role}</p>

                <div className="mt-2">
                  <MailOutlined className="text-gray-500 mr-2" />
                  <span>{userData?.email}</span>
                </div>
              </div>
            </div>

            <Divider className="my-5" />

            {/* ===== Academic Info ===== */}
            <div className="grid sm:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOutlined className="text-blue-500" /> Subjects
                </h3>
                {userData?.subjects?.length > 0 ? (
                  userData.subjects.map((subj, idx) => (
                    <Tag key={idx} color="blue" className="mb-1">
                      {subj}
                    </Tag>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No subjects assigned</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TeamOutlined className="text-green-500" /> Form Class
                </h3>
                {userData?.formClass ? (
                  <Tag color="green">{userData.formClass}</Tag>
                ) : (
                  <p className="text-gray-500 text-sm">No class assigned</p>
                )}
              </div>
            </div>

            <Divider />

            {/* ===== School Info ===== */}
            {userData?.school && (
              <div className="mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <BankOutlined className="text-indigo-500" /> School Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-gray-600 text-sm">
                  <p>
                    <span className="font-medium text-gray-700">Name:</span>{" "}
                    {userData.school.name}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {userData.school.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Phone:</span>{" "}
                    {userData.school.phone}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Address:</span>{" "}
                    {userData.school.address}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Current Session:</span>{" "}
                    {userData.school.currentSession}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Current Term:</span>{" "}
                    {userData.school.currentTerm}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminProfile;
