# Skillo

A modern platform designed to connect learners, creators, and developers through peer mentoring and collaborative project tasks. Built with a full stack architecture that balances strong UI with scalable backend logic.

## 🚀 Project Overview

**Repository:** https://github.com/Tusharxhub/Skillo  
**Status:** Live deployment currently shows an error, verify config before redeploying.  

## 🎯 Purpose

Skillo helps users find mentors, collaborate on real tasks, and build portfolio-ready experience. It supports task posting, applications, discussions, and project coordination in a simple and intuitive interface.

## 🧩 Features

- User signup and login  
- Dashboard for posting tasks and browsing others  
- Commenting and applying on tasks  
- Smooth UI built with Next.js and Tailwind  
- Optional real time updates and notifications  
- Clean backend architecture with NestJS  
- Responsive design aimed at a frictionless experience  

## 📂 Folder Structure

/frontend → Next.js UI
/backend → NestJS API
.gitignore → ignored files
package.json → project scripts

markdown
Copy code

## 🛠️ Tech Stack

- **Frontend:** Next.js, Tailwind CSS  
- **Backend:** NestJS (Node.js)  
- **Database:** configurable (PostgreSQL, MongoDB, etc.)  
- **Deployment:** Vercel for frontend, separate backend hosting  

## ⚙️ Installation and Setup

### 1. Clone the project
```bash
git clone https://github.com/Tusharxhub/Skillo.git
cd Skillo
2. Install dependencies
bash
Copy code
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
3. Set environment variables
Backend:

DATABASE_URL

JWT_SECRET

OAuth keys if used

Frontend:

NEXT_PUBLIC_API_URL

4. Run locally
bash
Copy code
# Backend
cd backend
npm run start:dev

# Frontend
cd ../frontend
npm run dev
Access the app at:
http://localhost:3000

▶️ How It Works
Create an account

Browse or post tasks

Comment or apply to tasks

Clients select applicants and track progress

Ideal for building real world collaboration experiences

🔮 Future Enhancements
Real time chat using WebSockets

Task recommendations based on skills

Admin analytics panel

Payment integration

Full production deployment with CI/CD

👨‍💻 Developer Info
📧 Email: t.k.d.dey2033929837@gmail.com
🔗 GitHub: Tusharxhub
📸 Instagram: tushardevx01
🌐 Portfolio: https://darkaura.me

📝 License
Released under the MIT License. Feel free to explore, modify, and contribute.
