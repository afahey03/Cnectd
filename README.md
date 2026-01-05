# Cnectd

Cnectd is a full-stack React Native chat application built with **Expo** and a **Node.js/Express backend**.  
It allows users to register with a unique username, manage friends, and chat via direct messages or groups.

---

## Tech Stack

### Frontend (Mobile App)
- **[React Native](https://reactnative.dev/)** with **[Expo](https://expo.dev/)** — cross-platform mobile development
- **[React Navigation](https://reactnavigation.org/)** — navigation and stack handling
- **[Zustand](https://github.com/pmndrs/zustand)** — lightweight state management
- **[TanStack React Query](https://tanstack.com/query)** — API data fetching & caching
- **[Axios](https://axios-http.com/)** — networking
- **[Socket.IO Client](https://socket.io/)** — real-time messaging
- **[Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)** — secure token storage
- **[UUID](https://www.npmjs.com/package/uuid)** + **react-native-get-random-values** — ID generation

### Backend (API Server)
- **[Node.js](https://nodejs.org/)** + **[Express](https://expressjs.com/)** — REST API
- **[Prisma](https://www.prisma.io/)** — ORM for database access
- **[PostgreSQL](https://www.postgresql.org/)** — relational database
- **[Socket.IO](https://socket.io/)** — real-time chat
- **[JWT](https://jwt.io/)** — authentication

### Infrastructure
- **[Docker](https://www.docker.com/)** + **docker-compose** — database containerization
- **TypeScript** — type safety for both frontend and backend

---

## Features

- **User Registration**  
  Sign up with a unique username, password and display name.  
  Authentication handled via JWT.

- **Friends System**  
  - Send and accept/deny friend requests  
  - Only friends can start DMs

- **Direct Messaging**  
  - Real-time private chat between two users  
  - Message bubbles, timestamps, and sender labels

- **Group Chat**  
  - Multi-user conversations with shared history
  - Only friends can add friends to group chats
  - Currently no way to add or remove users from existing gc's

- **Accounts**
  - Change display name and avatar color
  - Delete accounts with usernames being reserved
