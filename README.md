# SmartSpeakAI - AI-Powered Interview Question Generator

SmartSpeakAI is an intelligent interview preparation platform that generates customized interview questions using AI. Upload your resume and job details, and get AI-generated interview questions tailored to your specific role.

## 🚀 Features

### ✅ Implemented Features

- **User Authentication** - Secure authentication system using Clerk
- **Resume Upload** - Upload resumes in PDF format with drag-and-drop functionality
- **Resume Storage** - Store resumes securely on ImageKit CDN
- **Job Details Input** - Add job position, description, required skills, and experience
- **AI-Powered Question Generation** - Generate interview questions using n8n workflows integrated with AI
- **Dashboard Interface** - Clean and intuitive dashboard to manage mock interviews
- **Responsive Design** - Mobile-friendly UI built with TailwindCSS
- **Database Integration** - PostgreSQL database with Neon and Drizzle ORM

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TailwindCSS 4** - Utility-first CSS framework
- **ShadcN UI** - Component library for modern UI
- **Lucide React** - Icon library
- **React Dropzone** - File upload component

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **n8n** - Workflow automation for AI question generation
- **Google Gemini AI** - AI model for generating interview questions
- **ImageKit** - CDN for resume storage
- **Clerk** - Authentication and user management

### Database
- **PostgreSQL** - Relational database (Neon)
- **Drizzle ORM** - TypeScript ORM for database operations

## 📁 Project Structure

```
smartspeekai/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/         # Sign-in page
│   │   └── sign-up/         # Sign-up page
│   ├── api/
│   │   └── generate-interview-questions/
│   │       └── route.jsx    # API endpoint for question generation
│   ├── dashboard/
│   │   ├── _components/
│   │   │   ├── AddNewInterview.jsx   # Main interview creation form
│   │   │   ├── Header.jsx            # Dashboard header
│   │   │   └── ResumeUpload.jsx      # Resume upload component
│   │   ├── layout.jsx       # Dashboard layout
│   │   └── page.jsx         # Dashboard page
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── ui/                  # ShadcN UI components
│       ├── button.jsx
│       ├── dialog.jsx
│       ├── file-upload.jsx
│       ├── input.jsx
│       ├── tabs.jsx
│       └── textarea.jsx
├── utils/
│   ├── db.js               # Database connection
│   ├── GeminiAIModel.js    # Google Gemini AI configuration
│   └── schema.js           # Database schema
└── .env.local              # Environment variables
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (Neon account)
- Clerk account for authentication
- ImageKit account for file storage
- Google Gemini API key
- n8n instance (local or production)

### Step 1: Clone the Repository
```bash
git clone https://github.com/RakshitBhardwaj1/smartspeekai.git
cd smartspeekai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/

# Database (Neon PostgreSQL)
NEXT_PUBLIC_DRIZZLE_URL=postgresql://user:password@host/database?sslmode=require

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Interview Configuration
NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT=10

# ImageKit CDN
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

# N8N Webhook
N8N_WEBHOOK_URL=https://your-n8n-url.com/webhook/generate-interview-questions
```

### Step 4: Setup Database
```bash
npm run db:push
```

### Step 5: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 How It Works

### Interview Question Generation Flow

1. **User Authentication**
   - Users sign up or log in using Clerk authentication
   - Access protected dashboard after authentication

2. **Resume Upload & Job Details**
   - Users upload their resume (PDF format) via drag-and-drop
   - Fill in job details: position, description, skills, and experience
   - Resume is uploaded to ImageKit CDN for secure storage

3. **API Processing** (`/api/generate-interview-questions`)
   - Receives form data with resume and job details
   - Validates ImageKit credentials
   - Uploads resume to ImageKit CDN
   - Generates unique file URL

4. **n8n Webhook Integration**
   - API sends POST request to n8n webhook with:
     - Resume URL
     - Job position
     - Job description
     - Required skills
     - Years of experience
   - n8n workflow processes the data

5. **AI Question Generation**
   - n8n workflow calls Google Gemini AI
   - AI analyzes resume and job requirements
   - Generates relevant interview questions
   - Returns structured JSON response

6. **Response Handling**
   - API receives interview questions from n8n
   - Returns comprehensive response with:
     - Resume URL and file ID
     - Generated interview questions
     - Job metadata
   - Frontend logs questions to console
   - User receives success confirmation

## 🔑 Key Components

### AddNewInterview Component
- Dialog-based form for creating new mock interviews
- Tab interface for resume upload and job details
- Handles form validation and submission
- Integrated with axios for API calls

### ResumeUpload Component
- Drag-and-drop file upload interface
- PDF file validation
- Real-time file preview

### API Route - Generate Interview Questions
- Handles multipart form data
- Manages ImageKit uploads
- Integrates with n8n webhooks
- Error handling and logging
- Returns structured JSON response

### GeminiAIModel Configuration
- Google Generative AI client setup
- Model: gemini-1.5-flash
- Safety settings configured
- Chat session management

## 📊 Database Schema

```javascript
// Example schema structure (check utils/schema.js for full schema)
- Users (managed by Clerk)
- Interviews
  - userId
  - jobPosition
  - jobDescription
  - skills
  - experience
  - resumeUrl
  - questions (JSON)
  - createdAt
```

## 🔐 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_DRIZZLE_URL` | PostgreSQL database URL | Yes |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | Yes |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit public key | Yes |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | Yes |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | Yes |
| `NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT` | Number of questions to generate | No |

## 🚧 Troubleshooting

### n8n Connection Issues
If you see `ECONNREFUSED` errors:
1. Ensure n8n is running on the correct port
2. Verify `N8N_WEBHOOK_URL` in `.env.local`
3. Restart Next.js dev server after env changes
4. Check n8n webhook is activated and accessible

### ImageKit Upload Failures
1. Verify all ImageKit credentials are correct
2. Check file size limits (usually 25MB for free tier)
3. Ensure file format is supported (PDF for resumes)

### Database Connection Issues
1. Verify PostgreSQL connection string
2. Check Neon database is active
3. Run `npm run db:push` to sync schema

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build production version
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push database schema
npm run db:studio  # Open Drizzle Studio
```

## 🎯 Upcoming Features

- [ ] Save generated questions to database
- [ ] Display interview questions in UI
- [ ] Mock interview practice mode
- [ ] Audio/video recording for practice
- [ ] AI-powered feedback on answers
- [ ] Interview history and analytics
- [ ] Share interview preparation links

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🤝 Support

For support, email your-email@example.com or open an issue in the repository.

---

Built with ❤️ using Next.js, n8n, and Google Gemini AI
