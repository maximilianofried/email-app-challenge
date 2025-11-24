import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export enum EmailDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export const emails = sqliteTable('emails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: text('thread_id').notNull(),
  subject: text('subject').notNull(),
  from: text('from').notNull(),
  to: text('to').notNull(),
  cc: text('cc'),
  bcc: text('bcc'),
  content: text('content'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  isImportant: integer('is_important', { mode: 'boolean' })
    .default(false)
    .notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' })
    .default(false)
    .notNull(),
  direction: text('direction')
    .notNull()
    .$type<EmailDirection>()
    .default(EmailDirection.INCOMING),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  // Single column indexes for frequently queried fields
  threadIdIdx: index('thread_id_idx').on(table.threadId),
  isDeletedIdx: index('is_deleted_idx').on(table.isDeleted),
  directionIdx: index('direction_idx').on(table.direction),
  isImportantIdx: index('is_important_idx').on(table.isImportant),
  createdAtIdx: index('created_at_idx').on(table.createdAt),

  // Composite indexes for common query patterns
  // Used in: getLatestByThreadAndDirection, getEmailsByDirection
  directionDeletedIdx: index('direction_deleted_idx').on(table.direction, table.isDeleted),

  // Used in: getEmailsByThreadId
  threadDeletedIdx: index('thread_deleted_idx').on(table.threadId, table.isDeleted),

  // Used in: getImportantEmails
  importantDeletedIdx: index('important_deleted_idx').on(table.isImportant, table.isDeleted),

  // Used in: countUnreadInbox (direction + isDeleted + isRead)
  inboxUnreadIdx: index('inbox_unread_idx').on(table.direction, table.isDeleted, table.isRead),
}));

export type Email = typeof emails.$inferSelect;
export type EmailData = typeof emails.$inferInsert;
