# Email App Challenge

This project is a fully functional email client application built with Next.js, Drizzle ORM, and SQLite. It implements core email functionalities including threading, filtering, composition, and management.

## 🚀 Features Implemented

### Core Assignments
1.  **Email Detail View**:
    *   Clicking an email in the sidebar displays its full content on the right panel.
    *   Shows thread history if the email is part of a conversation.
2.  **Email Composition**:
    *   Full support for sending new emails.
    *   Fields included: `To`, `From`, `Subject`, `Content`, `CC`, and `BCC`.
    *   Form validation to ensure required fields are present.
3.  **Advanced Search**:
    *   Real-time search functionality with debouncing.
    *   Searches across `Subject`, `To`, `From`, `CC`, `BCC`, and `Content`.

### Bonus Features (All Implemented)
1.  **Threaded View**:
    *   The Inbox displays only the latest email per thread to keep the view clean.
    *   Clicking a thread reveals the entire conversation history.
2.  **Sidebar Filters**:
    *   **Inbox**: Shows incoming threads.
    *   **Important**: Filters emails marked as important.
    *   **Sent**: Shows outgoing emails.
    *   **Trash**: Contains deleted emails.
3.  **Email Management**:
    *   **Delete**: Support for soft deleting individual emails or entire threads.
    *   **Mark as Read/Unread**: Automatically handles read status.
    *   **Toggle Importance**: Star/Unstar emails.
4.  **Pagination**:
    *   Implemented efficient cursor-based pagination for the email list.
    *   "Load More" button appears when more emails are available (batch size: 20).
    *   State is preserved across filter changes and searches.

## 🛠 Technical Architecture & Improvements

### Codebase Refactoring
To ensure scalability and maintainability, the codebase was refactored with the following improvements:

*   **Constants Extraction**: Created `src/lib/constants/index.ts` to centralize API endpoints, HTTP methods, UI labels, and error messages. This eliminates "magic strings" and makes the app easier to localize or update.
*   **Type Safety**: Enhanced TypeScript usage by moving Enums (like `EmailDirection`) to dedicated type definitions (`src/lib/types`) and ensuring strict DTO validation with Zod.
*   **Feature-Based Structure**: Organized code into `src/features` (e.g., `emails`, `threads`), following a **Controller-Service-Repository** pattern for clear separation of concerns.

### Tech Stack
*   **Framework**: Next.js 15 (App Router)
*   **Database**: SQLite with Drizzle ORM
*   **UI Library**: Material UI (MUI)
*   **Validation**: Zod
*   **Testing**: Jest

## 📦 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Initialize Database**:
    This will push the schema and seed the database with sample threads.
    ```bash
    npm run db:init
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Run Tests**:
    ```bash
    npm test
    ```

## 🧪 Testing

The project includes unit and integration tests for services and API routes.
*   **Service Tests**: Verify business logic for Email and Thread services.
*   **API Tests**: Ensure endpoints return correct status codes and data structures.

---
*Completed by Maximiliano*
