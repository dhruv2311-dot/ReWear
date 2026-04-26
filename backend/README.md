# ⚙️ ReWear Backend

The robust Node.js/Express API powering the ReWear sustainable clothing exchange platform.

## 🚀 Core Functionalities
- **RESTful API**: Scalable endpoints for item management, user profiles, and reviews.
- **Authentication**: Multi-strategy login (Local, Google, GitHub) managed via Passport.js.
- **Account Recovery**: Forgot/reset password workflow with token-based validation and SMTP email support.
- **Real-time Engine**: Socket.io integration for instant messaging and platform notifications.
- **Notification APIs**: Persistent notifications with unread counters, mark-as-read, and mark-all-read support.
- **Database**: MongoDB/Mongoose for flexible and performant data storage.
- **Security**: JWT-based authorization and secure cookie-based sessions.

## 🆕 Latest Backend Additions
- Added `Notification` model and notification controller/routes.
- Integrated notification creation hooks in swap/message/review/item workflows.
- Added SMTP mailer utility for password reset emails.
- Improved Google OAuth profile synchronization (name/avatar/provider mapping).
- Added admin-safe swap detail backend usage support.

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

Required mail variables for password reset flow:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
MAIL_FROM="ReWear <your_email>"
```

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
