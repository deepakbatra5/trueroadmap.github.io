# Expert Hub

AI chat app with role-based assistants, deployed serverless on Vercel.

## Features

- **Role-based chat**: Doctor, Lawyer, Engineer, Teacher, Student
- **Themes**: Midnight, Ocean, Sunrise, Forest
- **Markdown formatting**: Code blocks, lists, headings in responses
- **Serverless deployment**: Fast, scalable, low cost

## Quick Start

### Local Testing

```bash
# Install Node.js (LTS) first
npm install
# Create .env from .env.example
# Add your GROQ_API_KEY
```

To run the app locally (serves `public/` and `/api/chat`):
```bash
npm run dev
```

### Deploy to Vercel

1. **Push to GitHub** (if not already):
   ```bash
   git add -A
   git commit -m "Ready for Vercel"
   git push
   ```

2. **Link to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Select your GitHub repo
   - Vercel auto-detects configuration from `vercel.json`
   - Click "Deploy"

3. **Set Environment Variable**:
   - After deployment starts, go to Project Settings → Environment Variables
   - Add: `GROQ_API_KEY` = your Groq key
   - Redeploy

Your app is live! 🚀

## Project Structure

```
.
├── api/
│   └── chat.js          # Serverless function (Vercel)
├── public/
│   ├── index.html       # Frontend UI
│   ├── style.css        # Themes + styling
│   └── script.js        # Chat logic
├── vercel.json          # Vercel deployment config
├── package.json         # Dependencies
└── .env.example         # Environment template
```

## API Reference

**POST** `/api/chat`

Request:
```javascript
{
  "message": "Explain quantum computing",
  "role": "teacher"
}
```

Response:
```javascript
{
  "reply": "Quantum computing uses quantum bits..."
}
```

**Roles**: `doctor` | `lawyer` | `engineer` | `teacher` | `student`

## Environment Variables

Set in Vercel dashboard (Project Settings → Environment Variables):

- `GROQ_API_KEY` (required) - Your Groq API key
- `GROQ_MODEL` (optional) - Defaults to `llama3-8b-8192`

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js serverless function
- **AI**: Groq (OpenAI-compatible Chat Completions)
- **Hosting**: Vercel (zero-config deployment)

## License

MIT
