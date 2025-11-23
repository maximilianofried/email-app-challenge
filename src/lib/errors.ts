import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
  }

  // Fallback for validation errors thrown as generic Error with "Validation Error" prefix
  // This handles the `validateInput` helper which throws standard Errors
  if (error instanceof Error && error.message.startsWith('Validation Error')) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
