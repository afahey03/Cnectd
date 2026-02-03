# Cnectd

Cnectd is a full-stack React Native chat application built with **Expo** and a **Node.js/Express backend**.  
It allows users to register with a unique username, manage friends, and chat via direct messages or groups.

---

## Tech Stack

### Frontend (Mobile App)
- **React Native** with **Expo**
- **Socket.IO Client**

### Backend (API Server)
- **TypeScript**
- **Node.js**
- **Express**
- **PostgreSQL**
- **Socket.IO**
- **Docker**

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
