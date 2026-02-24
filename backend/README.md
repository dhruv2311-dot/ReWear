# ⚙️ ReWear Backend

The robust Node.js/Express API powering the ReWear sustainable clothing exchange platform.

## 🚀 Core Functionalities
- **RESTful API**: Scalable endpoints for item management, user profiles, and reviews.
- **Authentication**: Multi-strategy login (Local, Google, GitHub) managed via Passport.js.
- **Real-time Engine**: Socket.io integration for instant messaging and platform notifications.
- **Database**: MongoDB/Mongoose for flexible and performant data storage.
- **Security**: JWT-based authorization and secure cookie-based sessions.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **DB**: MongoDB & Mongoose
- **Auth**: Passport.js & JWT
- **Communication**: Socket.io
- **Logs**: Morgan

## 📦 Getting Started

### Installation
```bash
npm install
```

### Configuration
Copy `.env.example` to `.env` and configure your credentials.

### Development
```bash
npm run dev
```

### Seeding Data
```bash
npm run seed
```

## 📁 Structure
- `/config`: Database and Passport strategy configurations.
- `/controllers`: Business logic for various entities.
- `/models`: Mongoose schemas.
- `/routes`: Definition of API endpoints.
- `/sockets`: Socket.io event handlers.
- `/middleware`: Custom express middlewares (auth, error handling).

---
Part of the [ReWear Project](../README.md).
