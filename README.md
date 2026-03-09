# Learn Igbo 

## Project Description
Learn Igbo is an interactive language learning web application designed to help users build and retain igbo language vocabulary through a confidence-based algorithm. The platform utilizes spaced-repetition logic to adapt to a user's specific learning curve.

## Technologies Used
* **Backend:** Python, FastAPI
* **Database:** PostgreSQL, Supabase, SQLAlchemy (ORM)
* **Frontend:** (To be added - React)

## Setup Instructions
1. Clone the repository to your local machine.
2. Create a virtual environment: `python3 -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate`
4. Install the required dependencies: `pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv`
5. Create a `.env` file in the root directory and add your Supabase connection string: `DATABASE_URL=your_database_url_here`

## How to Run the Project
1. Ensure your virtual environment is active.
2. Start the backend server by running the following command in your terminal:
   `uvicorn main:app --reload`
3. The API will be available at `http://127.0.0.1:8000`.