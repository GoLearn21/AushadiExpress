# FileGenie

FileGenie is a powerful document management and processing application that helps you organize, search, and analyze your files with ease.

## Features

- **Document Management**: Upload, organize, and manage your files
- **AI-Powered Search**: Find documents using natural language queries
- **Document Processing**: Extract text and metadata from various file formats
- **User-Friendly Interface**: Intuitive UI built with modern web technologies

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v9 or later) or yarn
- PostgreSQL (v14 or later)
- Google Cloud Vision API credentials (for OCR and document processing)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Durga-prasad-hota/AushadiExpress.git
cd AushadiExpress
```

### 2. Install Dependencies

```bash
# Install all dependencies (including client and server)
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/filegenie"

# Google Cloud Vision API
GOOGLE_APPLICATION_CREDENTIALS="./path/to/your/service-account-key.json"

# Server
PORT=3001
NODE_ENV="development"

# Client
VITE_API_BASE_URL="http://localhost:3001"
```

### 4. Set Up Database

1. Create a new PostgreSQL database:
   ```bash
   createdb filegenie
   ```

2. Run database migrations:
   ```bash
   npx drizzle-kit push
   ```

### 5. Start the Development Servers

In separate terminal windows, run:

```bash
# Start the backend server (runs on port 3000)
cd server
npm run dev

# In a new terminal, start the frontend (runs on port 3001)
cd client
npx vite --port 3001
```

Once both servers are running:
- Frontend will be available at: `http://localhost:3001`
- Backend API will be available at: `http://localhost:3000/api`

### Available API Endpoints

- `GET    /api/status` - Check server status
- `POST   /api/ai/chat` - AI chat endpoint

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Node.js/Express server
- `/shared` - Shared TypeScript types and utilities
- `/scripts` - Utility scripts
- `/docs` - Project documentation

## Available Scripts

### Root Directory
- `npm install` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production

### Client Directory
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server Directory
- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Environment Setup for Production

1. Set `NODE_ENV=production` in your environment variables
2. Update the database connection string to point to your production database
3. Ensure all required environment variables are set in your production environment
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the production server:
   ```bash
   cd server
   npm start
   ```

## Troubleshooting

- **Database Connection Issues**: Ensure PostgreSQL is running and the connection string in `.env` is correct
- **Missing Dependencies**: Run `npm install` in both root and client directories
- **Environment Variables**: Double-check that all required environment variables are set

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
