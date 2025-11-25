# Database Documentation

## Overview

This application uses **SQLite** as the database (Node.js equivalent of H2). TypeORM is used as the ORM layer.

SQLite provides:
- Zero configuration required
- File-based storage (easy backup and portability)
- ACID compliance
- Full SQL support
- Perfect for applications with moderate traffic

## Database Schema

### Entities

#### User
- **id**: UUID (Primary Key)
- **email**: String (Unique)
- **username**: String (Unique)
- **password**: String (Hashed)
- **firstName**: String (Optional)
- **lastName**: String (Optional)
- **avatarUrl**: String (Optional)
- **bio**: String (Optional)
- **status**: Enum (online, offline, away)
- **lastSeenAt**: DateTime (Optional)
- **isActive**: Boolean
- **createdAt**: DateTime
- **updatedAt**: DateTime

#### Conversation
- **id**: UUID (Primary Key)
- **type**: Enum (direct, group)
- **name**: String (Optional, for groups)
- **description**: String (Optional)
- **avatarUrl**: String (Optional)
- **createdBy**: UUID (Foreign Key to User)
- **isActive**: Boolean
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **lastMessageAt**: DateTime (Optional)

#### Message
- **id**: UUID (Primary Key)
- **content**: Text
- **type**: Enum (text, image, file, system)
- **status**: Enum (sent, delivered, read)
- **senderId**: UUID (Foreign Key to User)
- **conversationId**: UUID (Foreign Key to Conversation)
- **fileUrl**: String (Optional)
- **fileName**: String (Optional)
- **fileSize**: Number (Optional)
- **fileMimeType**: String (Optional)
- **metadata**: JSON (Optional)
- **isEdited**: Boolean
- **isDeleted**: Boolean
- **deletedAt**: DateTime (Optional)
- **createdAt**: DateTime
- **updatedAt**: DateTime

### Relationships

- **User** has many **Messages** (one-to-many)
- **User** has many **Conversations** through **conversation_participants** (many-to-many)
- **Conversation** has many **Messages** (one-to-many)
- **Conversation** has many **Users** through **conversation_participants** (many-to-many)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
DATABASE_PATH=data/chat.db
DB_SYNCHRONIZE=true
```

### 3. Run Migrations (Optional)

For production, use migrations:

```bash
# Generate migration
npm run migration:generate -- src/migrations/InitialSchema

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### 4. Seed Database

Populate the database with test data:

```bash
npm run seed
```

This creates:
- 3 test users (john@example.com, jane@example.com, bob@example.com)
- 2 conversations (1 direct, 1 group)
- 3 sample messages

**Test Credentials:**
- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`
- Email: `bob@example.com` | Password: `password123`

## Development

### Auto-Synchronization

In development mode, TypeORM automatically synchronizes the schema with your entities. This is controlled by the `DB_SYNCHRONIZE` environment variable.

⚠️ **Warning:** Never use `synchronize: true` in production!

### Database Location

The SQLite database file is stored at `data/chat.db` (relative to the backend root).

### Viewing Data

You can use any SQLite viewer:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)
- Command line: `sqlite3 data/chat.db`

## Production

For production, SQLite continues to be used with these important changes:

1. Set `DB_SYNCHRONIZE=false` (use migrations instead)
2. Enable Write-Ahead Logging (WAL) mode for better concurrency
3. Set up automated backups of the database file
4. Use migrations for all schema changes
5. Consider read replicas if needed (copy database file)

## Troubleshooting

### Database locked error
- Close any SQLite viewers that have the database open
- Restart the application

### Migration errors
- Delete the database file and run migrations again
- Check that all entities are properly imported

### Connection errors
- Verify the `data/` directory exists
- Check file permissions
- Ensure SQLite3 is properly installed

## Scripts

- `npm run seed` - Seed database with test data
- `npm run migration:generate` - Generate a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
