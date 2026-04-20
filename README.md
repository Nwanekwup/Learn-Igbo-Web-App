# Learn Igbo

**Live Product Link:** https://learn-igbo-web-app.vercel.app/

## Project Overview
Learn Igbo is an interactive language learning web application designed to help users build and retain Igbo vocabulary through a confidence-based algorithm. The platform utilizes spaced-repetition logic to adapt to a user's specific learning curve, featuring real-time analytics and targeted practice sessions.

## Technologies Used
* **Frontend:** React, Axios, CSS3 (Glassmorphism)
* **Backend:** Python, FastAPI, JWT Authentication
* **Database:** PostgreSQL (Neon), SQLAlchemy ORM
* **Deployment:** Vercel (Frontend), Render (Backend)

## Setup Instructions
To run this project locally, you must set up both the backend and frontend environments.

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
1. **Start Backend:** In the backend terminal, run `uvicorn main:app --reload`.
2. **Start Frontend:** In the frontend terminal, run `npm run dev`.
3. The application will be accessible at `http://localhost:5173`.

## Example Usage
* **Dashboard:** Monitor your personal retention analytics including accuracy and mastery count.
* **Focus Practice:** Launch a session to specifically target vocabulary marked with low confidence scores.
* **Profile Management:** Update personal account information via the interactive "Edit Profile" feature.
