# SkyWing - Flight Booking Application

A modern flight booking website built with Node.js, Express, and MongoDB.

## Features

- User registration and authentication
- Flight search and booking
- Deals and offers
- Admin panel
- Mobile-responsive design
- Real-time chatbot support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd skywing-by-ishant-online-hosted
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
   - Create a new cluster (free tier)
   - Create a database user with username and password
   - Network Access: Add IP address `0.0.0.0/0` (allows all IPs) or use your current IP
   - Get your connection string (click "Connect" → "Connect your application")

4. Create environment file:
```bash
cp .env.example .env
```

5. Edit `.env` file with your MongoDB Atlas connection string:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skywing?retryWrites=true&w=majority
SESSION_SECRET=your-secret-key-here
PORT=5000
```

6. Run the development server:
```bash
npm run dev
```

7. Open http://localhost:5000 in your browser

## Deployment to Render

### Option 1: Deploy via GitHub

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/skywing.git
git push -u origin main
```

2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: skywing
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start

6. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `SESSION_SECRET`: A secure random string
   - `NODE_ENV`: production

7. Click "Create Web Service"

### Option 2: Deploy via Render CLI

```bash
render deploy
```

## Project Structure

```
├── public/              # Frontend files
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   ├── *.html         # HTML pages
├── routes/            # API routes
├── models/            # MongoDB models
├── middleware/        # Auth middleware
├── server.js          # Main server file
├── package.json       # Dependencies
└── .env.example      # Environment variables template
```

## API Endpoints

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/session` - Get session
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/flights` - Search flights

## License

ISC

