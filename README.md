# StepUp

An animated, blue-and-black website that teaches people about Artificial Intelligence — what it is, how it works, the big AI companies, and what coding is — with a working AI chatbot built in.

Built by **Sayyoon Anthony Charles**.

## What's inside

- `templates/index.html` — the page content
- `static/style.css` — blue/black theme, animations, chatbot styling
- `static/script.js` — scroll animations, animated network background, chatbot logic
- `app.py` — Flask server + `/api/chat` endpoint that calls the Gemini API
- `requirements.txt` — Python dependencies
- `.env.example` — copy this to `.env` and add your real key
- `Procfile` — tells Railway how to start the app

## Run it locally — step by step

1. Open a terminal in this folder.
2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   venv\Scripts\activate      (Windows)
   source venv/bin/activate   (Mac/Linux)
   ```
3. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to a new file named `.env`:
   ```
   cp .env.example .env
   ```
5. Open `.env` and paste in your real Gemini API key (get one free at https://aistudio.google.com/apikey):
   ```
   GEMINI_API_KEY=your_real_key_here
   ```
6. Run the app:
   ```
   python app.py
   ```
7. Open your browser to `http://localhost:5000` — your site and chatbot are live.

## Deploying to Railway (same flow you used before)

1. Push this folder to a GitHub repo (e.g. under `sayyoonanthonycharles`).
2. In Railway, choose **New Project → Deploy from GitHub repo** and select it.
3. In the Railway project's **Variables** tab, add `GEMINI_API_KEY` with your real key. Do **not** commit `.env` to GitHub — it's already ignored.
4. Railway will detect the `Procfile` and start the app automatically with `gunicorn`.
5. Once deployed, open the generated Railway URL to see your live site.

## Customizing

- **Colors:** edit the `:root` variables at the top of `static/style.css`.
- **Content:** all the AI/coding text lives directly in `templates/index.html`.
- **Chatbot personality:** edit `SYSTEM_PROMPT` in `app.py`.
- **Chatbot model:** change `MODEL_NAME` in `app.py` if you want a different Gemini model.
