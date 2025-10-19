import React from "react";
import { Card, Avatar, Divider, Tag } from "antd";
import { UserOutlined, MailOutlined, BookOutlined, PhoneOutlined, TeamOutlined } from "@ant-design/icons";

const TeacherProfile = () => {
  // Dummy data (replace with API later)
  const teacher = {
    name: "Mr. John Doe",
    email: "john.doe@school.edu",
    subject: ["Mathematics", "Physics"],
    classes: ["JSS 2", "SS 1"],
    phone: "+234 812 345 6789",
    image: "",
    joined: "September 2021",
    role: "Senior Science Teacher",
  };

  return (
    <div className="">
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            size={120}
            src={teacher.image || null}
            icon={<UserOutlined />}
            className="border-2 border-blue-400 shadow-sm"
          />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-semibold">{teacher.name}</h2>
            <p className="text-gray-500">{teacher.role}</p>
            <div className="mt-2">
              <MailOutlined className="text-gray-500 mr-2" />
              <span>{teacher.email}</span>
            </div>
            <div>
              <PhoneOutlined className="text-gray-500 mr-2" />
              <span>{teacher.phone}</span>
            </div>
          </div>
        </div>

        <Divider className="my-5" />

        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOutlined className="text-blue-500" /> Subjects
            </h3>
            {teacher.subject.map((subj, idx) => (
              <Tag key={idx} color="blue" className="mb-1">
                {subj}
              </Tag>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TeamOutlined className="text-green-500" /> Classes Assigned
            </h3>
            {teacher.classes.map((cls, idx) => (
              <Tag key={idx} color="green" className="mb-1">
                {cls}
              </Tag>
            ))}
          </div>
        </div>

        <Divider />

        <div className="text-gray-500 text-sm mt-3 text-center sm:text-right">
          Joined: <span className="font-medium text-gray-700">{teacher.joined}</span>
        </div>
      </Card>
    </div>
  );
};

export default TeacherProfile;
