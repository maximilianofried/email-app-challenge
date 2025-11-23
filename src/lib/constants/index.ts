export const API_ENDPOINTS = {
  EMAILS: '/api/emails',
} as const;

export const API_HEADERS = {
  CONTENT_TYPE_JSON: { 'Content-Type': 'application/json' },
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const UI_LABELS = {
  INBOX: 'Inbox',
  IMPORTANT: 'Important',
  SENT: 'Sent',
  TRASH: 'Trash',
  TOTAL: 'Total',
  UNREAD: 'Unread',
  COMPOSE: 'Compose',
  SEARCHING: 'Searching...',
  LOADING: 'Loading...',
  LOAD_MORE: 'Load More',
  SEND: 'Send',
  SENDING: 'Sending...',
  CANCEL: 'Cancel',
  FROM: 'From',
  TO: 'To',
  CC: 'CC',
  BCC: 'BCC',
  SUBJECT: 'Subject',
  CONTENT: 'Content',
  COMPOSE_EMAIL: 'Compose Email',
  APP_TITLE: '📧 Email Client',
} as const;

export const ERROR_MESSAGES = {
  EMAIL_NOT_FOUND: 'Email not Found',
  REQUIRED_FIELDS: 'Subject, to, and content are required',
  FROM_REQUIRED: 'From is required',
  TO_REQUIRED: 'To is required',
  SUBJECT_REQUIRED: 'Subject is required',
  CONTENT_REQUIRED: 'Content is required',
  UPDATE_READ_DELETED: 'Cannot update read status of deleted email',
  CHANGE_IMPORTANCE_DELETED: 'Cannot change importance of deleted email',
  DELETE_THREAD_FAILED: 'Failed to delete thread',
  DELETE_EMAIL_FAILED: 'Failed to delete email',
  SEND_EMAIL_FAILED: 'Failed to send email',
  TOGGLE_IMPORTANT_FAILED: 'Failed to toggle important status',
  INVALID_ID: 'Invalid ID',
  INVALID_UPDATE_DATA: 'Invalid update data',
  THREAD_NOT_FOUND: 'Thread not Found',
} as const;


export const CONFIG = {
  DEFAULT_LIMIT: 20,
} as const;

