# FoodLens Community App

A social media community platform for food enthusiasts to share posts, like, comment, follow other users, and chat in real-time.

## Features

- **User Profiles**: Create and customize user profiles
- **Posts**: Create posts with images, captions, tags, and location
- **Interactions**: Like posts, add comments, and reply to comments
- **Follow System**: Follow/unfollow other users
- **Real-time Chat**: Message users you follow or who follow you
- **Feed**: View posts from all users in a chronological feed
- **Responsive Design**: Works on mobile and desktop devices
- **Ingredient Analysis**: Analyze food product ingredients for safety using OCR and AI
  - Extract ingredients from images using OCR
  - Analyze ingredients for potential health concerns
  - Manual ingredient entry option

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Socket.io (for real-time messaging)
- Multer (for file uploads)
- Google Gemini API (for AI ingredient analysis)
- Python OCR with Tesseract (for ingredient text extraction)

### Frontend

- React
- React Router
- Axios
- Tailwind CSS
- Date-fns
- React Icons

## Setup Instructions

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB installed locally or MongoDB Atlas account
- Python 3.6+ (for OCR functionality)
- Tesseract OCR (for OCR functionality)

### Environment Setup

1. Create a `.env` file in the `backend` directory with the following variables:

```
DATABASE_URI=mongodb://localhost:27017/foodlens
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/foodlens.git
cd foodlens
```

2. Install backend dependencies:

```
cd backend
npm install
```

3. Install Python OCR dependencies:

```
cd backend
npm run install-python-deps
```

4. Install Tesseract OCR:

   - Windows: Download from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
   - Add to PATH or update path in `backend/ocr_script.py`

5. Install frontend dependencies:

```
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:

```
cd backend
npm run dev
```

2. Seed the database with initial data:

```
cd backend
npm run seed
```

3. Start the frontend:

```
cd frontend
npm run dev
```

4. Open your browser and navigate to:

```
http://localhost:5173/
```

### Default User Credentials

- Username: defaultuser
- Email: default@foodlens.com
- Password: password123

## OCR and Ingredient Analysis

FoodLens uses a dual OCR approach for processing ingredient images:

1. **Python-based OCR** (Primary method)

   - Uses `pytesseract` (Python wrapper for Tesseract OCR)
   - Includes image preprocessing for better text recognition

2. **Gemini OCR** (Fallback method)
   - Uses Google's Gemini API Vision capabilities
   - Used automatically if Python OCR fails

### Testing OCR

```
cd backend
npm run test-ocr
```

For more information about the OCR implementation, see [backend/README_OCR.md](backend/README_OCR.md).

## Project Structure

```
foodlens/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── uploads/          # User uploaded files
│   ├── database.js       # Database connection
│   ├── server.js         # Express server
│   ├── seed.js           # Database seeding script
│   ├── geminiService.js  # Gemini API service
│   ├── pythonOcrService.js # Python OCR service
│   ├── geminiOcrService.js # Gemini OCR service
│   └── ocr_script.py     # Python OCR script (auto-generated)
└── frontend/
    ├── public/           # Static files
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # Context providers
    │   ├── services/     # API service functions
    │   └── ...           # Other React components and pages
```

## API Endpoints

### Users

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow a user
- `POST /api/users/:id/unfollow` - Unfollow a user
- `GET /api/users/default/user` - Get default user

### Posts

- `POST /api/posts` - Create a new post
- `GET /api/posts/feed` - Get all posts (feed)
- `GET /api/posts/user/:userId` - Get user's posts
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/unlike` - Unlike a post
- `POST /api/posts/:id/comment` - Add a comment
- `DELETE /api/posts/:id` - Delete a post

### Messages

- `POST /api/messages` - Send a message
- `GET /api/messages/:userId/:otherUserId` - Get conversation
- `PUT /api/messages/read/:senderId/:recipientId` - Mark messages as read
- `GET /api/messages/unread/:userId` - Get unread message count
- `GET /api/messages/conversations/:userId` - Get conversations

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License
