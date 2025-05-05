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

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Socket.io (for real-time messaging)
- Multer (for file uploads)

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

### Environment Setup

1. Create a `.env` file in the `backend` directory with the following variables:

```
DATABASE_URI=mongodb://localhost:27017/foodlens
PORT=3000
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

3. Install frontend dependencies:

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

## Project Structure

```
foodlens/
├── backend/
│   ├── models/         # Database models
│   ├── routes/         # API endpoints
│   ├── uploads/        # User uploaded files
│   ├── database.js     # Database connection
│   ├── server.js       # Express server
│   └── seed.js         # Database seeding script
└── frontend/
    ├── public/         # Static files
    ├── src/
    │   ├── components/ # React components
    │   ├── context/    # Context providers
    │   ├── services/   # API service functions
    │   └── ...         # Other React components and pages
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
