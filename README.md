# Email App Challenge

This project is a fully functional email client application built with Next.js, Drizzle ORM, and SQLite. It implements core email functionalities including threading, filtering, composition, and management.

## 🚀 Features Implemented

### Core Assignments
1. **Email Detail View**:
   - Clicking an email in the sidebar displays its full content in the right panel.
   - Shows complete thread history if the email is part of a conversation.
   - Automatically marks all emails in the thread as read when opened.
   - Displays email metadata (from, to, cc, bcc, timestamp).

2. **Email Composition**:
   - Full support for composing and sending new emails.
   - Fields included: `To`, `From`, `Subject`, `Content`, `CC`, and `BCC`.
   - Client-side and server-side validation using Zod schemas.
   - Properly handles email direction (outgoing emails marked as sent).

3. **Advanced Search**:
   - Real-time search functionality with debouncing (reduces API calls).
   - Searches across `Subject`, `To`, `CC`, `BCC`, and `Content` fields.
   - Works seamlessly with filters (direction, importance, deleted status).
   - Maintains pagination state during search.

### Bonus Features (All Implemented)
1. **Threaded View**:
   - The Inbox displays only the latest email per thread for a clean interface.
   - Clicking a thread reveals the entire conversation history in chronological order.
   - Thread grouping works across all filters (Inbox, Sent, etc.).

2. **Sidebar Filters**:
   - **Inbox**: Shows incoming email threads (latest per thread).
   - **Important**: Filters emails marked as important/starred.
   - **Sent**: Shows outgoing emails sent by the user.
   - **Trash**: Contains soft-deleted emails (recoverable).
   - Displays real-time counts for unread and important emails.

3. **Email Management**:
   - **Delete**: Soft delete individual emails or entire threads (data preserved).
   - **Mark as Read**: Automatic marking when viewing; thread-level read status.
   - **Toggle Importance**: Star/Unstar emails with immediate UI updates.
   - **Trash Management**: Deleted emails viewable in Trash folder.

4. **Pagination**:
   - Implemented efficient cursor-based pagination for scalability.
   - "Load More" button appears when additional emails are available.
   - Configurable batch size (defined in `src/lib/constants/index.ts`).
   - State is preserved across filter changes and searches.

## 🛠 Technical Architecture & Improvements

### Clean Architecture
The codebase follows industry best practices with a clear separation of concerns:

- **Controller-Service-Repository Pattern**:
  - **Controllers** (`src/features/*/controllers`): Handle HTTP requests, validate input, and return responses.
  - **Services** (`src/features/*/services`): Contain business logic and orchestrate operations.
  - **Repositories** (`src/features/*/repositories`): Manage database queries and data access.

- **Feature-Based Structure**:
  - Code is organized by domain (`emails`, `threads`) rather than technical role.
  - Each feature contains its own controllers, services, repositories, and tests.
  - Promotes modularity and makes the codebase easier to navigate and maintain.

### State Management & Hooks
- **Custom Hooks**:
  - `useEmailList`: Manages email list state, filtering, search, and pagination.
  - `useEmailSelection`: Handles email selection and thread loading.
- **Context API**: `FilterContext` provides global state for active filters and counts.
- **Optimistic Updates**: UI updates immediately with proper error handling and rollback.

### Type Safety & Validation
- **TypeScript**: Strict typing throughout the codebase with no `any` types.
- **Zod Schemas**: Runtime validation for all API inputs and outputs.
- **DTO Pattern**: Data Transfer Objects (`src/lib/dtos`) define clear contracts between layers.
- **Type Definitions**: Centralized types in `src/lib/types` for consistency.

### Code Quality Improvements
- **Constants Extraction**:
  - Created `src/lib/constants/index.ts` to centralize:
    - API endpoints and HTTP methods
    - UI labels and messages
    - Error messages
    - Configuration values
  - Eliminates "magic strings" and improves maintainability.
  - Makes the app easier to localize or update.

- **Error Handling**:
  - Custom error classes (`BadRequestError`, `NotFoundError`) in `src/lib/errors.ts`.
  - Centralized error handling in API routes with proper HTTP status codes.
  - User-friendly error messages defined in constants.

- **Database Schema**:
  - Drizzle ORM with SQLite for simple, type-safe database access.
  - Soft deletes implemented with `isDeleted` flag.
  - Thread-based email grouping with UUID thread identifiers.
  - **Performance Indexes**: Comprehensive indexing strategy for optimal query performance:
    - **Single-column indexes**: `threadId`, `isDeleted`, `direction`, `isImportant`, `createdAt`
    - **Composite indexes** for common query patterns:
      - `direction + isDeleted`: Used for filtering Inbox/Sent emails
      - `threadId + isDeleted`: Used for retrieving thread conversations
      - `isImportant + isDeleted`: Used for Important filter
      - `direction + isDeleted + isRead`: Used for unread count queries
    - Indexes significantly improve query performance on filtered and paginated lists.

## 📦 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   This will push the schema and seed the database with sample email threads:
   ```bash
   npm run db:init
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run all tests (Node + React)
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:seed` - Seed database with sample data
- `npm run db:init` - Initialize database (push + seed)

## 🧪 Testing

The project includes comprehensive unit and integration tests with separate Jest configurations:

- **Node Tests** (`jest.node.config.js`): API routes, services, repositories, and business logic.
- **React Tests** (`jest.react.config.js`): Components and hooks with React Testing Library.

### Test Coverage
- **Service Tests**: Verify business logic for Email and Thread services.
- **API Tests**: Ensure endpoints return correct status codes and data structures.
- **Component Tests**: Validate UI behavior and user interactions.

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
cd test && yarn test email.service.test.ts
```


## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── emails/        # Email endpoints
│   ├── client-page.tsx    # Main client component
│   └── page.tsx           # Server entry point
├── components/            # React components
│   ├── EmailCard.tsx
│   ├── EmailComposer.tsx
│   ├── EmailDetailPanel.tsx
│   ├── EmailListSidebar.tsx
│   └── SearchBar.tsx
├── contexts/              # React Context providers
│   └── FilterContext.tsx
├── features/              # Feature modules
│   ├── emails/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── tests/
│   └── threads/
│       ├── repositories/
│       ├── services/
│       └── tests/
├── hooks/                 # Custom React hooks
│   └── emails/
├── lib/                   # Shared utilities
│   ├── constants/         # App constants
│   ├── dtos/             # Data Transfer Objects
│   ├── types/            # TypeScript types
│   ├── database.ts       # Database client
│   ├── errors.ts         # Error classes
│   └── schema.ts         # Drizzle schema
```

## 🎨 Design Decisions

### Why Soft Deletes?
Emails are marked as `isDeleted` rather than removed from the database. This allows:
- Recovery of deleted emails
- Audit trails
- Viewing deleted emails in the Trash folder

### Why Cursor-Based Pagination?
- More efficient for large datasets
- Prevents duplicate entries when new data is added
- Better performance than offset-based pagination

### Why Feature-Based Structure?
- Easier to locate related code
- Promotes modularity and reusability
- Scales better as the application grows
- Clear boundaries between features

### Why Controller-Service-Repository?
- Separation of concerns (HTTP, business logic, data access)
- Easier to test each layer independently
- Business logic can be reused across different controllers
- Database can be swapped without changing business logic

---

**Completed by Maximiliano**
