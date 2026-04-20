# Learn Igbo

**Live Product Link:** [https://learn-igbo-web-app.vercel.app/]

## Project Overview
[cite_start]Learn Igbo is an interactive language learning web application designed to help users build and retain Igbo vocabulary through a confidence-based algorithm[cite: 95]. [cite_start]The platform utilizes spaced-repetition logic to adapt to a user's specific learning curve, featuring real-time analytics and targeted practice sessions[cite: 106].

## Technologies Used
* [cite_start]**Frontend:** React, Axios, CSS3 (Glassmorphism) [cite: 102]
* [cite_start]**Backend:** Python, FastAPI, JWT Authentication [cite: 102]
* [cite_start]**Database:** PostgreSQL (Neon), SQLAlchemy ORM [cite: 102]
* **Deployment:** Vercel (Frontend), Render (Backend)

## Setup Instructions
[cite_start]To run this project locally, you must set up both the backend and frontend environments[cite: 122].

### Backend Setup
1. Clone the repository and navigate to the `backend` directory.
2. Create and activate a virtual environment:
   `python3 -m venv venv`
   `source venv/bin/activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Create a `.env` file and add your `DATABASE_URL`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Update your API base URL to `http://127.0.0.1:8000` for local development.

## How to Run the Project
1. [cite_start]**Start Backend:** In the backend terminal, run `uvicorn main:app --reload`[cite: 129].
2. [cite_start]**Start Frontend:** In the frontend terminal, run `npm run dev`[cite: 129].
3. The application will be accessible at `http://localhost:5173`.

## Example Usage
* [cite_start]**Dashboard:** Monitor your personal retention analytics including accuracy and mastery count[cite: 130].
* [cite_start]**Focus Practice:** Launch a session to specifically target vocabulary marked with low confidence scores[cite: 130].
* [cite_start]**Profile Management:** Update personal account information via the interactive "Edit Profile" feature[cite: 130].
