import { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Divider,
  Tag,
  Skeleton,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
} from "antd";
import { MailOutlined, BookOutlined, TeamOutlined, BankOutlined, UploadOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import axios from "axios";

const { Option } = Select;

const Profile = () => {
  const { API_BASE_URL, token } = useApp();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit modal & form states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const getUserProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data.data);
      // console.log(res)
    } catch (error) {
      console.log("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getUserProfile();
  }, [token]);

  const handleAvatarChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const openEditModal = () => {
    form.setFieldsValue({
      address: userData.address || "",
      phone: userData.phone || "",
      gender: userData.gender || "",
    });

    if (userData.avatar) {
      setFileList([
        { uid: "-1", name: "avatar.png", status: "done", url: userData.avatar },
      ]);
    }

    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values) => {
    const formData = new FormData();
    formData.append("address", values.address);
    formData.append("phone", values.phone);
    formData.append("gender", values.gender);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("avatar", fileList[0].originFileObj);
    }

    setUploading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/management/update-profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      message.success(res.data.message || "Profile updated successfully");
      setIsEditModalOpen(false);
      await getUserProfile();
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  const renderAvatar = () => {
    if (userData?.avatar) return <Avatar size={120} src={userData.avatar} />;
    const initials = userData?.firstName && userData?.lastName
      ? `${userData.firstName[0]}${userData.lastName[0]}`
      : "U";
    return <Avatar size={120}>{initials.toUpperCase()}</Avatar>;
  };

  return (
    <div>
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        ) : (
          <>
            {/* User Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {renderAvatar()}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-semibold">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-500 capitalize">{userData.role}</p>
                <div className="mt-2">
                  <MailOutlined className="text-gray-500 mr-2" />
                  <span>{userData.email}</span>
                </div>
                <Button className="mt-3" onClick={openEditModal}>
                  Edit Profile
                </Button>
              </div>
            </div>

            <Divider />

            {/* Address, Phone, Gender */}
            <div className="grid sm:grid-cols-3 gap-6 mt-4 text-gray-600">
              <p><strong>Address:</strong> {userData.address || "—"}</p>
              <p><strong>Phone:</strong> {userData.phone || "—"}</p>
              <p><strong>Gender:</strong> {userData.gender || "—"}</p>
            </div>

            <Divider />

            {/* Academic Info */}
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

            {/* School Info */}
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

      {/* Edit Modal */}
      <Modal
        title="Edit Profile"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleEditSubmit}>
          <Form.Item label="Avatar" name="avatar">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleAvatarChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={uploading}>
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
