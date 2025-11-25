# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                            │
│ UQ  email: String                                                       │
│ UQ  username: String                                                    │
│     password: String (hashed)                                           │
│     firstName: String?                                                  │
│     lastName: String?                                                   │
│     avatarUrl: String?                                                  │
│     bio: String?                                                        │
│     status: Enum(online, offline, away)                                 │
│     lastSeenAt: DateTime?                                               │
│     isActive: Boolean                                                   │
│     createdAt: DateTime                                                 │
│     updatedAt: DateTime                                                 │
└─────────────────────────────────────────────────────────────────────────┘
        │                                    │
        │ 1:M                                │ M:M
        │ (sender)                           │ (participants)
        ▼                                    ▼
┌──────────────────────┐         ┌──────────────────────────────────────┐
│      MESSAGE         │         │   CONVERSATION_PARTICIPANTS          │
├──────────────────────┤         │         (Join Table)                 │
│ PK  id: UUID         │         ├──────────────────────────────────────┤
│     content: Text    │         │ FK  conversationId: UUID             │
│     type: Enum       │         │ FK  userId: UUID                     │
│     status: Enum     │         └──────────────────────────────────────┘
│ FK  senderId: UUID   │                        │
│ FK  conversationId   │                        │ M:M
│     fileUrl: String? │                        ▼
│     fileName: String?│         ┌─────────────────────────────────────┐
│     fileSize: Number?│         │         CONVERSATION                │
│     fileMimeType: ?  │         ├─────────────────────────────────────┤
│     metadata: JSON?  │         │ PK  id: UUID                        │
│     isEdited: Bool   │         │     type: Enum(direct, group)       │
│     isDeleted: Bool  │         │     name: String?                   │
│     deletedAt: Date? │         │     description: String?            │
│     createdAt: Date  │         │     avatarUrl: String?              │
│     updatedAt: Date  │         │ FK  createdBy: UUID                 │
└──────────────────────┘         │     isActive: Boolean               │
        ▲                        │     createdAt: DateTime             │
        │ M:1                    │     updatedAt: DateTime             │
        │ (conversation)         │     lastMessageAt: DateTime?        │
        └────────────────────────┴─────────────────────────────────────┘
```

## Detailed Entity Specifications

### User Entity

**Purpose:** Stores user account information, authentication credentials, and profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User's email address |
| username | VARCHAR | UNIQUE, NOT NULL | User's display name |
| password | VARCHAR | NOT NULL | Bcrypt hashed password |
| firstName | VARCHAR | NULLABLE | User's first name |
| lastName | VARCHAR | NULLABLE | User's last name |
| avatarUrl | VARCHAR | NULLABLE | Profile picture URL |
| bio | TEXT | NULLABLE | User biography |
| status | ENUM | DEFAULT 'offline' | online, offline, away |
| lastSeenAt | DATETIME | NULLABLE | Last activity timestamp |
| isActive | BOOLEAN | DEFAULT true | Account active status |
| createdAt | DATETIME | NOT NULL | Account creation time |
| updatedAt | DATETIME | NOT NULL | Last update time |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- UNIQUE INDEX on `username`
- INDEX on `status` (for presence queries)

**Relationships:**
- One-to-Many with Message (as sender)
- Many-to-Many with Conversation (as participant)

---

### Conversation Entity

**Purpose:** Represents chat conversations (both direct and group).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| type | ENUM | NOT NULL | direct, group |
| name | VARCHAR | NULLABLE | Group name (null for direct) |
| description | TEXT | NULLABLE | Group description |
| avatarUrl | VARCHAR | NULLABLE | Group avatar URL |
| createdBy | UUID | FOREIGN KEY | User who created conversation |
| isActive | BOOLEAN | DEFAULT true | Conversation active status |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |
| lastMessageAt | DATETIME | NULLABLE | Timestamp of last message |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `type` (for filtering)
- INDEX on `lastMessageAt` (for sorting)
- INDEX on `createdBy`

**Relationships:**
- One-to-Many with Message
- Many-to-Many with User (through conversation_participants)

**Business Rules:**
- Direct conversations: exactly 2 participants
- Group conversations: 2+ participants
- Name required for group conversations
- Name should be null for direct conversations

---

### Message Entity

**Purpose:** Stores individual messages within conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| content | TEXT | NOT NULL | Message content |
| type | ENUM | DEFAULT 'text' | text, image, file, system |
| status | ENUM | DEFAULT 'sent' | sent, delivered, read |
| senderId | UUID | FOREIGN KEY | Message sender |
| conversationId | UUID | FOREIGN KEY | Parent conversation |
| fileUrl | VARCHAR | NULLABLE | Attached file URL |
| fileName | VARCHAR | NULLABLE | Original file name |
| fileSize | INTEGER | NULLABLE | File size in bytes |
| fileMimeType | VARCHAR | NULLABLE | File MIME type |
| metadata | JSON | NULLABLE | Additional metadata |
| isEdited | BOOLEAN | DEFAULT false | Edit flag |
| isDeleted | BOOLEAN | DEFAULT false | Soft delete flag |
| deletedAt | DATETIME | NULLABLE | Deletion timestamp |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `conversationId` (for message history)
- INDEX on `senderId` (for user messages)
- INDEX on `createdAt` (for chronological ordering)
- INDEX on `isDeleted` (for filtering)

**Relationships:**
- Many-to-One with User (as sender)
- Many-to-One with Conversation

**Business Rules:**
- Soft delete: set `isDeleted = true` and `deletedAt = NOW()`
- File messages must have `fileUrl`, `fileName`, `fileSize`, `fileMimeType`
- System messages have no sender (senderId can be null)

---

### Conversation_Participants (Join Table)

**Purpose:** Links users to conversations (many-to-many relationship).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| conversationId | UUID | FOREIGN KEY, PRIMARY KEY | Conversation reference |
| userId | UUID | FOREIGN KEY, PRIMARY KEY | User reference |

**Indexes:**
- COMPOSITE PRIMARY KEY on (conversationId, userId)
- INDEX on `userId` (for user's conversations)
- INDEX on `conversationId` (for conversation's participants)

**Relationships:**
- Many-to-One with Conversation
- Many-to-One with User

**Business Rules:**
- No duplicate entries (enforced by composite primary key)
- Cascade delete when conversation is deleted
- Prevent deletion if it would leave conversation with < 2 participants

---

## Enumerations

### UserStatus
```typescript
enum UserStatus {
  ONLINE = 'online',    // User is actively using the app
  OFFLINE = 'offline',  // User is not connected
  AWAY = 'away'         // User is idle/inactive
}
```

### ConversationType
```typescript
enum ConversationType {
  DIRECT = 'direct',    // One-on-one conversation
  GROUP = 'group'       // Group conversation (3+ users)
}
```

### MessageType
```typescript
enum MessageType {
  TEXT = 'text',        // Regular text message
  IMAGE = 'image',      // Image attachment
  FILE = 'file',        // File attachment
  SYSTEM = 'system'     // System notification
}
```

### MessageStatus
```typescript
enum MessageStatus {
  SENT = 'sent',           // Message sent to server
  DELIVERED = 'delivered', // Message delivered to recipient(s)
  READ = 'read'            // Message read by recipient(s)
}
```

---

## Common Queries

### Get User's Conversations
```sql
SELECT c.* 
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversationId
WHERE cp.userId = ? 
ORDER BY c.lastMessageAt DESC;
```

### Get Conversation Messages
```sql
SELECT m.*, u.username, u.avatarUrl
FROM messages m
JOIN users u ON m.senderId = u.id
WHERE m.conversationId = ? 
  AND m.isDeleted = false
ORDER BY m.createdAt ASC;
```

### Get Unread Message Count
```sql
SELECT COUNT(*) 
FROM messages m
JOIN conversation_participants cp ON m.conversationId = cp.conversationId
WHERE cp.userId = ? 
  AND m.senderId != ?
  AND m.status != 'read';
```

### Get Online Users
```sql
SELECT * 
FROM users 
WHERE status = 'online' 
  AND isActive = true;
```

### Search Messages
```sql
SELECT m.*, c.name, u.username
FROM messages m
JOIN conversations c ON m.conversationId = c.id
JOIN users u ON m.senderId = u.id
JOIN conversation_participants cp ON c.id = cp.conversationId
WHERE cp.userId = ? 
  AND m.content LIKE ?
  AND m.isDeleted = false
ORDER BY m.createdAt DESC;
```

---

## Data Integrity Rules

### Referential Integrity
- All foreign keys have CASCADE DELETE or SET NULL
- Orphaned records are prevented by database constraints
- Join table entries are automatically cleaned up

### Data Validation
- Email format validation at application layer
- Password strength requirements enforced
- Username character restrictions
- File size limits for attachments

### Soft Deletes
- Messages: Set `isDeleted = true`, keep data
- Conversations: Set `isActive = false`, keep history
- Users: Set `isActive = false`, preserve data

---

## Performance Optimization

### Indexing Strategy
1. **Primary Keys**: UUID with B-tree index
2. **Foreign Keys**: Automatic indexes for joins
3. **Frequently Queried**: status, type, createdAt
4. **Composite Indexes**: (conversationId, createdAt) for message pagination

### Query Optimization
- Use pagination for message history
- Limit conversation list to recent conversations
- Cache user presence data
- Batch message status updates

### Database Tuning
- Connection pooling (HikariCP equivalent)
- Prepared statements for common queries
- Query result caching for static data
- Lazy loading for relationships

---

## Migration Strategy

### Development to Production
1. **SQLite in Production**
   - Same database engine for consistency
   - No migration between database types needed
   - Copy database file for deployment
   - Enable WAL mode for better concurrency

2. **Schema Changes**
   - Always use migrations (never synchronize in production)
   - Test migrations on staging first
   - Keep rollback scripts ready
   - Document all schema changes

3. **Data Migration**
   - Export from SQLite: `sqlite3 chat.db .dump > backup.sql`
   - Import to new SQLite instance if needed
   - Verify data integrity
   - Test application with migrated data

---

## Backup and Recovery

### Backup Strategy
- **Development**: SQLite file backup (simple file copy)
- **Production**: Automated SQLite file backups
- **Frequency**: Hourly backups with rotation
- **Retention**: 30 days
- **Method**: File copy with timestamp + S3 upload

### Recovery Procedures
1. Stop application
2. Restore database from backup
3. Run any pending migrations
4. Verify data integrity
5. Restart application

---

## Security Considerations

### Data Protection
- Passwords: Bcrypt hashed (never plain text)
- Sensitive data: Encrypted at rest (production)
- File URLs: Signed URLs with expiration
- API access: JWT authentication required

### Access Control
- Users can only access their own conversations
- Message deletion: Only by sender or admin
- Conversation creation: Authenticated users only
- File uploads: Size and type restrictions

### Audit Trail
- All modifications tracked via updatedAt
- Soft deletes preserve history
- User actions logged
- Failed login attempts tracked

---

## Future Enhancements

### Planned Features
- [ ] Message reactions (separate table)
- [ ] Read receipts (separate table)
- [ ] Typing indicators (Redis cache)
- [ ] Message threading/replies
- [ ] User blocking/muting
- [ ] Conversation pinning
- [ ] Message search indexing (Elasticsearch)
- [ ] File storage metadata
- [ ] User activity logs
- [ ] Admin audit logs

### Schema Evolution
- Add tables as needed for new features
- Maintain backward compatibility
- Use feature flags for gradual rollout
- Document all changes in migrations
