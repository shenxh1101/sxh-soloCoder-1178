## 1. 架构设计

```mermaid
graph TD
    A["用户浏览器"] --> B["React 前端应用"]
    B --> C["状态管理层 (React Context + useReducer)"]
    B --> D["路由层 (React Router)"]
    C --> E["数据持久层 (localStorage)"]
    C --> F["预设数据中心 (Mock Data)"]
    D --> G["课程页"]
    D --> H["题库页"]
    D --> I["错题页"]
    D --> J["计划页"]
    D --> K["成绩页"]
```

本项目采用纯前端架构，无后端服务。所有数据通过 React Context 进行状态管理，利用 localStorage 实现数据持久化。预设的模拟数据（课程内容、题库、学员信息等）在首次加载时写入 localStorage。

## 2. 技术描述

- **前端框架**：React 18 + TypeScript
- **样式方案**：Tailwind CSS 3 + CSS 变量（自定义主题）
- **构建工具**：Vite 5
- **路由管理**：React Router v6
- **状态管理**：React Context + useReducer
- **图表可视化**：Recharts
- **图标库**：Lucide React
- **数据存储**：localStorage（模拟数据库）
- **包管理器**：npm

## 3. 路由定义

| 路由 | 页面名称 | 说明 |
|------|----------|------|
| `/` | 登录/注册页 | 用户认证入口，角色选择 |
| `/courses` | 课程页 | 章节学习与进度追踪 |
| `/courses/:chapterId` | 课程详情 | 具体章节资料播放 |
| `/exercises` | 题库页 | 章节练习、随机组卷、限时模拟 |
| `/exercises/:mode` | 练习模式 | mode: chapter/random/timed |
| `/wrong-questions` | 错题页 | 错题归类、重做、笔记 |
| `/study-plan` | 计划页 | 学习计划与打卡 |
| `/scores` | 成绩页 | 成绩分析与排名 |
| `/scores/announcements` | 公告管理 | 老师发布公告 |

## 4. 数据模型

### 4.1 实体关系图

```mermaid
erDiagram
    User ||--o{ StudyProgress : has
    User ||--o{ WrongQuestion : has
    User ||--o{ ExerciseRecord : has
    User ||--o{ StudyPlan : has
    User ||--o{ CheckIn : has
    User ||--o{ FavoriteQuestion : has
    Course ||--o{ Chapter : contains
    Chapter ||--o{ ChapterMaterial : contains
    Chapter ||--o{ Question : contains
    Question ||--o{ WrongQuestion : related
    Question ||--o{ FavoriteQuestion : related
    Question ||--o{ ExerciseRecord : related
    Teacher ||--o{ Announcement : publishes

    User {
        string id PK
        string name
        string email
        string role
        string avatar
        datetime createdAt
    }
    Course {
        string id PK
        string title
        string subject
        string description
        int totalChapters
    }
    Chapter {
        string id PK
        string courseId FK
        string title
        int order
        string materials
    }
    Question {
        string id PK
        string chapterId FK
        string knowledgePoint
        string type
        string content
        string options
        string answer
        string explanation
        string difficulty
    }
    WrongQuestion {
        string id PK
        string userId FK
        string questionId FK
        int wrongCount
        string note
        bool mastered
        datetime lastWrongAt
    }
    StudyProgress {
        string id PK
        string userId FK
        string chapterId FK
        bool completed
        datetime completedAt
    }
    ExerciseRecord {
        string id PK
        string userId FK
        string questionId FK
        bool isCorrect
        string mode
        datetime createdAt
    }
    StudyPlan {
        string id PK
        string userId FK
        date targetDate
        int targetScore
        int dailyTaskCount
    }
    CheckIn {
        string id PK
        string userId FK
        date checkDate
        int completedTasks
        int totalTasks
    }
    FavoriteQuestion {
        string id PK
        string userId FK
        string questionId FK
        datetime createdAt
    }
    Announcement {
        string id PK
        string teacherId FK
        string title
        string content
        datetime createdAt
    }
```

### 4.2 数据定义

所有数据以 JSON 格式存储在 localStorage 中，键名规范如下：

| localStorage Key | 对应实体 | 说明 |
|------------------|----------|------|
| `exam_app_users` | User[] | 用户列表 |
| `exam_app_courses` | Course[] | 课程列表 |
| `exam_app_chapters` | Chapter[] | 章节列表 |
| `exam_app_questions` | Question[] | 题库 |
| `exam_app_wrong_questions` | WrongQuestion[] | 错题记录 |
| `exam_app_study_progress` | StudyProgress[] | 学习进度 |
| `exam_app_exercise_records` | ExerciseRecord[] | 练习记录 |
| `exam_app_study_plans` | StudyPlan[] | 学习计划 |
| `exam_app_checkins` | CheckIn[] | 打卡记录 |
| `exam_app_favorites` | FavoriteQuestion[] | 收藏题目 |
| `exam_app_announcements` | Announcement[] | 公告 |
| `exam_app_current_user` | User | 当前登录用户 |

### 4.3 预设数据策略

- 首次加载时检测 localStorage 是否为空，若为空则自动写入预设模拟数据
- 预设数据包含：3 门课程（每门 6-8 章）、每章 10-20 道题目、3 条示例公告
- 预设用户：1 名学员 + 1 名老师，方便演示角色切换