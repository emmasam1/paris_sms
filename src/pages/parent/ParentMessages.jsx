import { useState } from "react";
import { Avatar, Badge, Card, Button } from "antd";
import { motion } from "framer-motion";
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";

const ParentMessages = ({ onBack }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = [
    {
      id: 1,
      name: "Mrs. James (Class Teacher)",
      time: "11:32 AM",
      message: "Your child was very attentive today!",
      unread: 2,
    },
    {
      id: 2,
      name: "Mr. Okafor (Head Teacher)",
      time: "10:45 AM",
      message: "PTA meeting scheduled for tomorrow.",
      unread: 0,
    },
    {
      id: 3,
      name: "School Admin",
      time: "9:20 AM",
      message: "Please confirm fee payment receipt.",
      unread: 1,
    },
  ];

  const messages = [
    {
      from: "teacher",
      text: "Good morning! Please confirm homework submission.",
      time: "10:57 AM",
    },
    {
      from: "teacher",
      text: "Also note, there’s a class meeting tomorrow.",
      time: "11:00 AM",
    },
    {
      from: "teacher",
      text: "Attendance this week has been excellent.",
      time: "11:02 AM",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 py-4">
        <Link to="/home">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            type="text"
            className="flex items-center"
          >
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>
      <div className="h-[90vh] bg-gray-50 rounded-lg border border-gray-200 flex overflow-hidden">
        {/* LEFT: Chat list */}
        <div className="w-1/3 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Messages</h2>
          <div className="space-y-3">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                  selectedChat?.id === chat.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="bg-blue-500 text-white">
                    {chat.name[0]}
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-800">{chat.name}</h3>
                    <p className="text-xs text-gray-500 truncate w-[150px]">
                      {chat.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{chat.time}</p>
                  {chat.unread > 0 && (
                    <Badge count={chat.unread} size="small" className="ml-2" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT: Message viewer */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <Avatar className="bg-blue-500 text-white">
                    {selectedChat.name[0]}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedChat.name}
                    </h3>
                    <p className="text-xs text-gray-500">Sent recently</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className="flex justify-start">
                    <Card className="max-w-md p-3 rounded-2xl bg-white shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-700">{msg.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1 text-right">
                        {msg.time}
                      </p>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentMessages;
