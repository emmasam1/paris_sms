import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Avatar,
  Button,
  Divider,
  Space,
  Modal,
  Tabs,
  Select,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  TrophyOutlined,
  StarOutlined,
  LogoutOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { logout, user, token, API_BASE_URL, initialized } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [result, setResult] = useState(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  console.log(user);

  const child = {
    term: "1st Term, 2025",
    avatar: null,
    // performance: 82,
    attendance: 90,
    conduct: "Excellent",
    unreadMessages: 3,
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewResult = () => {
    if (!selectedTerm) return;
    setIsModalOpen(false);
    navigate("/parent/result", { state: { term: selectedTerm } }); // Pass term via state
  };

  const getStudentsResult = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/parent/results?term=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("RESULT:", res.data.data);

      // Store result in state
      setResult(res.data.data);
    } catch (error) {
      console.log("Error get result", error);
      messageApi.error(error?.response?.data?.message || "No result yet");
    }
  };

  useEffect(() => {
    if (!initialized || !token) return;

    getStudentsResult();
    // getClass();
  }, [initialized, token]);

  useEffect(() => {
    setIsAssignmentModalOpen(true);
  }, []);

  const handleAssignmentOk = () => {
    setIsAssignmentModalOpen(false);
  };
  const handleAssignmentCancel = () => {
    setIsAssignmentModalOpen(false);
  };

  const homeWork = [
    {
      id: 1,
      class_name: "JSS1",
      subject: "English",
      content: `1. Carefully read the passage titled "1. The Dog" found on page 59-60 of your NOSEC textbook and do the exercise on it.
2. Review the informal letter sample found on pages 115-117 of your NOSEC textbook. Now write a letter to your friend in another state telling them how you intend to spend your holiday. Your letter should NOT be less than 250 words.`,
    },
    {
      id: 2,
      class_name: "JSS2",
      subject: "Mathematics",
      content: `1. (a) Write 0.00045606 in standard form
    (b) convert 5.402x10^6 to ordinary form
2. Solve the following (i) 2e^4 × 5e^10     (ii) r^9÷r^3
3. Simplify the following;
a) 3ab × 4ab
b) (-11ab) ÷ (11a)
c) (3a/8b) × (18b²/9a²)
4. Find the HCF of 24, 32 and 60
5. Find the LCM of 36, 42 and 64
6. Find the smallest number by which 320 must be multiplied so that the product is a perfect Square.
7. Approximate 0.0025349 to 
i) 2 significant figures
ii) 3 decimal places
8. The monthly income of a family is #150 000. They plan to spend the income as follows: #10 000 for house rent, #55 000 for food, # 20 000 for transport, #5000 for electricity bill, #2 500 for water bill, #7 000 for DSTV subscription, #15 000 for dependent relatives and #5000 for housekeeper. Find the total expenditure of the family and determine whether they will have some money for other emergencies or expenses.
9. .Find the LCM of 9xyz and 27xz
10. Expand  (w–3v)(w+3v)
`,
    },
    {
      id: 3,
      class_name: "SS1",
      subject: "Mathematics",
      content: `	1. Of the 35 students in a class, 20 play basketball, 18 play keyboard and 9 play both. How many play neither?
	2. X = πab where, π= 22/7, a= 14 b=1 find x.       
	3. r= √(x^2 )+y2, where x = 5, y= 3. Find the value of r.
	4. t= 3p/r, + s   P=5, r=10 s=20. Find the value of t.
	5. Multiplication of modulo 5.
	6. Use the table to solve        (1x2) +(2x2)
	7. Convert 111101111two to base 10. 
	8. Convert 123ten to base 5.
	9. Explain the following with examples:
	i. Intersection
	ii. Union of sets
	iii. Disjoint
	iv. Null set
	v. Universal set   
	10. Draw addition table of modulo 6.
`,
    },
    {
      id: 4,
      class_name: "SS2",
      subject: "English",
      content: `1. Comprehension Page 38-39. 
   The Origin of Examinations (Answer all questions)
2. Write a formal letter to the Principal of your school, requesting permission to organize a debate competition for the students of your school indicating the potential benefits to the students and school. Your answer should not be less than 450 words. 
`,
    },
    {
      id: 5,
      class_name: "SS3",
      subject: "ENGLISH",
      content: `
Section A – Composition (Choose ONE)
Write NOT LESS than 450 words on any one of the following:
1. A Memorable Day I Will Never Forget
2. The Effects of Social Media on Teenagers Today
3. A Speech to Your School Prefects on How to Improve Discipline
4. “Examination Malpractice Is the Bane of Our Educational System.” – Write an article.
5. Write a story that ends with: “…and that was when I realised the importance of telling the truth.”


Section B – Summary
Read the passage below and answer the questions.
PASSAGE
Many students perform poorly in examinations not because they are unintelligent, but because they lack proper study habits. Effective study requires planning, discipline, and consistency. Some students wait until the examination period before they begin to prepare, and this often leads to tension, confusion, and poor performance. Others rely on copying in the examination hall, but this habit only weakens their confidence and prevents real learning.

Good study habits involve setting aside regular time for reading, taking notes, asking questions in class, and revising lessons weekly. Students who practise these habits often understand their subjects better and feel more confident during examinations. Teachers, on their part, should guide students on how to study properly. Parents should also create a quiet environment at home and encourage their children by showing interest in their academic progress.

      `,
    },
    {
      id: 6,
      class_name: "SS1",
      subject: "ENGLISH LANGUAGE",
      content: `1.	Write a story ending with the words: "Indeed, it was an awesome experience." (395 words)
2.	Write a letter to your uncle who lives and works abroad, informing him of at least (any)  three important and unforgettable experiences you have had during President Bola Ahmed Timubu's regime from the day he took over from his predecessor, Let. Gen. Muhammadu Buhari till date. (390 words) 
3.	Read the passage below and answer the questions on it.
THE LOST PRINCESS
In April 2004, Sarah Culberson got a call she’d spent nearly 30 years waiting for. “‘This is your father, Joseph Konia Kposowa. Please forgive me,” begged the caller. “I didn’t know how to find you,” Sarah then 28, had had no previous contact with her birth parents. Her adoptive parents Jim and Judy Culberson, had told her what little they knew. Her biological father had been an exchange student from Sierra Leone, attending Salem College in West Virginia. He dated a young white woman who worked at West Virginia University. When she became pregnant, they decided to give the baby up. The couple separated, and Sarah’s father returned to his homeland. Now he was urging his daughter to come visit. “As a member of the royal family,” he told her, “you could be chief here some day.” At that moment, Sarah knew her life had changed forever. From now on, she would be inextricably connected to a small, war-ravaged village halfway across the globe.
Sarah took a leadership training course and during one session the instructor asked, “Where are you holding back in your life? Tell the person sitting next to you.” Sarah turned at an old friend named Art. “I’m terrified of finding my biological father,” she confessed. Art assured her that the search could bring her peace and said he knew a private investigator who could locate her father for less than a hundred dollars.
The detective after just three hours of sleuthing, turned up a Joseph Kposowa in Maryland. Sarah laboured over an introductory note and nervously sent it off. Soon afterward, she got a phone call from a woman with a lilting accent. “Sarah? This is Evelyn, your auntie. I was there when you were born.” Sarah broke down in sobs. Once she’d composed herself, she learned that this Joseph was actually her uncle. He then got on the phone and asked, “Do you know you are a princess?”
Sarah, he explained, belonged to a ruling family of the Mende tribe in Southern Sierra Leone, a nation of six million on Africa’s Atlantic coast. Her grandfather had ruled a chiefdom with 36,000 subjects based in the village of Bumpe. When the old man died, Sarah’s father could have nominated himself for the office, but he opted to keep his job as headmaster of the local high school. Another uncle was now chief.
The information made Sarah’s head spin. But it wasn’t until her father called, two weeks later, that she began to comprehend its full significance.
Questions
(a) How did Sarah’s biological parents meet? 
(b) Why did Sarah believe that her life had changed after talking to Joseph Konia? 
(c) What was Sarah terrified of? 
(d) How did Sarah locate her biological father? 
(e) “You could be a chief here some day”  How is this possible? 
(f) “…a call she’d spent nearly 30 years waiting for” 
What figure of speech is used in this expression? 
(g) At that moment.  
(i) What grammatical name is given to this expression as it is used in the passage?  
(ii) What is its function? 
(h) For each of the following words, find another word or phrase which means the same and which can replace it as it is used in the passage:  (i) birth  (ii) homeland

(Have a pleasant moment of resting and rejuvenation or revitalisation)
Best wishes from Mobasa.
`,
    },
    {
      id: 7,
      class_name: "JSS3",
      subject: "English",
      content: `Answer both questions in this section.
1. Read  passage 75  ' It's so unfair' critically and write out one fact and two opinions.
2. The Mararaba junction Abacha road, leading to Nyanya is always filled with gridlock. Write a letter of complaints to the Nasarawa State Commissioner of works stating the people's experiences on the road everyday. Plead with the commissioner to build flyover in that distance to avoid urgly experiences of people on the road. In not less than 250 words.

`,
    },
  ];

  const filteredAssignment = homeWork.filter(
    (hw) => hw.class_name === user.class
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Welcome / Hero Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center mb-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <Avatar
            size={72}
            icon={<UserOutlined />}
            src={child.avatar}
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <Title level={4} className="!mb-1">
              Welcome, Parent👋
            </Title>
            <Text type="secondary">
              Here’s a quick overview of your child’s progress this term.
            </Text>
          </div>
        </div>
        <div className="flex gap-2 justify-between items-center">
          <Tag
            color="blue"
            className="mt-4 md:mt-0 text-sm py-1 px-3 rounded-full"
          >
            {child.term}
          </Tag>
          <Button
            size="small"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Child Summary Info */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <Text type="secondary">Student Name</Text>
            <Title level={5}>
              {user?.fullName === "ODEH EFFIONG ISABELLA DANIEL OKENENI"
                ? "ODEH DANIEL OKENENI"
                : user?.fullName || "--"}
            </Title>

            <Divider className="" />
            <Space direction="vertical" size={0}>
              <Text>
                <strong>Class:</strong> {user?.class} {user?.arm}
              </Text>
              <Text>
                <strong>Conduct:</strong>{" "}
                <Tag color="green">{child.conduct}</Tag>
              </Text>
              <Text>
                <strong>Overall Average:</strong> {child.performance}%
              </Text>
            </Space>
            <div>
              <Button
                icon={<FileSearchOutlined />}
                type="primary"
                className="bg-blue-600 mt-2"
                onClick={() => {
                  setSelectedTerm(null); // reset term selection
                  setIsModalOpen(true);
                }}
              >
                View Result
              </Button>
            </div>
          </Card>
        </Col>

        {/* Modal for term selection */}
        <Modal
          title="Select Term"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={400}
        >
          <div className="flex flex-col gap-4">
            <Select
              placeholder="Select Term"
              onChange={(value) => setSelectedTerm(value)}
            >
              <Option value="1">1st Term</Option>
              <Option value="2">2nd Term</Option>
              <Option value="3">3rd Term</Option>
            </Select>
            <Button
              type="primary"
              disabled={!selectedTerm}
              onClick={handleViewResult}
            >
              Continue
            </Button>
          </div>
        </Modal>

        {/* Academic Performance */}
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <TrophyOutlined className="text-3xl text-yellow-500 mb-2" />
            <Title level={5}>Academic Performance</Title>
            <Progress
              type="circle"
              percent={child.performance}
              size={80}
              strokeColor="#52c41a"
            />
            <Text className="block mt-2">Overall Average</Text>
            <Button
              type="link"
              className="mt-2 text-blue-500"
              onClick={() => {
                setSelectedTerm(null);
                setIsModalOpen(true);
              }}
            >
              View Full Report →
            </Button>
          </Card>
        </Col>

        {/* Attendance */}
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <CalendarOutlined className="text-3xl text-green-500 mb-2" />
            <Title level={5}>Attendance Record</Title>
            <Progress
              type="circle"
              percent={child.attendance}
              size={80}
              strokeColor="#1890ff"
            />
            <Text className="block mt-2">Present Days</Text>
            <Button
              type="link"
              className="mt-2 text-blue-500"
              onClick={() => navigate("/parent/attendance")}
            >
              View Attendance →
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Messages + Achievements */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card
            className="rounded-2xl shadow-sm h-full"
            title={
              <span className="flex items-center gap-2">
                <MessageOutlined className="text-purple-500" /> Recent Messages
              </span>
            }
          >
            <div className="mt-4 space-y-2">
              <Text>
                <strong>School Admin:</strong>
              </Text>
              <p>"Next term's resumption date is 12th January, 2026."</p>
            </div>
            <Button
              type="link"
              className="mt-3 text-blue-500"
              onClick={() => navigate("/parent/messages")}
            >
              View Inbox →
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="rounded-2xl shadow-sm h-full"
            title={
              <span className="flex items-center gap-2">
                <StarOutlined className="text-amber-500" /> Recent Achievements
              </span>
            }
          >
            {/* <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>🏆 Best in Mathematics - February 2025</li>
              <li>⭐ Excellent Conduct Award - March 2025</li>
              <li>🎨 Art Competition Winner - April 2025</li>
            </ul> */}
          </Card>
        </Col>
      </Row>

      {/* Announcements */}
      <Card
        className="rounded-2xl shadow-sm"
        title={
          <span className="flex items-center gap-2">
            <CalendarOutlined className="text-orange-500" /> School
            Announcements
          </span>
        }
      >
        {/* <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>
            <strong>PTA Meeting:</strong> November 3rd, 2025 at 10:00 AM
          </li>
          <li>
            <strong>Midterm Break:</strong> October 25th – October 30th
          </li>
          <li>
            <strong>End-of-Term Exams:</strong> December 1st to 10th
          </li>
        </ul> */}
      </Card>

      {/* Assignment Modal */}
      <Modal
        title="Holiday Assignment"
        open={isAssignmentModalOpen}
        onOk={handleAssignmentOk}
        onCancel={handleAssignmentCancel}
        width={800}
      >
        {filteredAssignment.length > 0 ? (
          <Tabs
            defaultActiveKey="0"
            items={filteredAssignment.map((item, index) => ({
              key: index.toString(),
              label: item.subject,
              children: (
                <div
                  style={{
                    maxHeight: "65vh",
                    overflowY: "auto",
                    paddingRight: "10px",
                  }}
                >
                  <h3 style={{ fontWeight: 600, marginBottom: 10 }}>
                    {item.subject}
                  </h3>

                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "14px",
                      lineHeight: "1.7",
                    }}
                  >
                    {item.content}
                  </pre>
                </div>
              ),
            }))}
          />
        ) : (
          <p>No assignment available for this class.</p>
        )}
      </Modal>
    </div>
  );
};

export default ParentDashboard;

// Jss1 Eng, Jss2 Math, Ss1 Math, Ss2 Eng and SS3 Eng
