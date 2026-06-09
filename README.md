# ExterroShop Web

Next.js 16 web application for ExterroShop internal marketplace.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui components
- **State:** Redux Toolkit + redux-persist
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios with JWT interceptors
- **Real-time:** WebSocket (STOMP) for chat and notifications

## Quick Start

### Prerequisites

- Node 18+
- npm

### Setup

```bash
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_BASE_URL

# Run development
npm run dev
```

Web app runs at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

## Features

- Product marketplace (browse, search, filter)
- Real-time chat with sellers
- Call requests for direct contact
- Favorites management
- User profile and settings
- EMS (attendance, leave, directory)
- Wellness/beauty bookings
- Sports events
- Admin CMS and user management
