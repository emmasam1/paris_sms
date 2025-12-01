import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Input, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";

const ChangePassword = () => {
  const { API_BASE_URL, token, loading, setLoading } = useApp();
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // open modal automatically
  useEffect(() => {
    setOpen(true);
  }, []);

  // validate fields
  const validateFields = () => {
    let newErrors = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // submit new password
  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);

      // send only required fields
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success(res.data.message || "Password changed successfully!");
      setOpen(false);

      // reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log(error);
      messageApi.error(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Modal
        title={<p className="text-xl font-semibold text-center">Change Password</p>}
        open={open}
        footer={null}
        maskClosable={false}
        closable={false}
        width={360}
        className="rounded-xl"
      >
        <div className="flex flex-col gap-4 mt-4">
          
          {/* CURRENT PASSWORD */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Current Password</label>
            <Input.Password
              name="oldPassword"
              placeholder="Enter current password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="!py-2 rounded-lg"
              value={formData.oldPassword}
              onChange={handleChange}
            />
            {errors.oldPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">New Password</label>
            <Input.Password
              name="newPassword"
              placeholder="Enter new password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="!py-2 rounded-lg"
              value={formData.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Confirm Password</label>
            <Input.Password
              name="confirmPassword"
              placeholder="Confirm new password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="!py-2 rounded-lg"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-center items-center">
            <Button
              type="primary"
              loading={loading}
              className="!bg-blue-600 hover:!bg-blue-700 py-1.5 rounded-lg text-white mt-2 !text-base"
              onClick={handleSubmit}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChangePassword;
