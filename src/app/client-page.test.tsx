import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClientPage from './client-page';
import { threads } from '../../database/seed';
import { emails, Email } from '@/lib/schema';
import { db } from '@/lib/database';
import { desc } from 'drizzle-orm';
import { FilterProvider } from '@/contexts/FilterContext';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('Home Page Client', () => {
  let emailList: Email[];

  beforeAll(async () => {
    emailList = await db.select().from(emails).orderBy((email) => desc(email.createdAt));
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    global.fetch = jest.fn((url: string) => {
      return Promise.resolve({
        ok: true,
        json: async () => {
          if (url.includes('/api/emails?')) {
            if (url.includes('search=')) {
              const urlObj = new URL(url, 'http://localhost');
              const search = urlObj.searchParams.get('search') || '';
              return emailList.filter(e => e.subject.includes(search));
            }
            return emailList;
          }
          if (url.match(/\/api\/emails\/\d+/)) {
            const id = parseInt(url.split('/').pop()?.split('?')[0] || '0');
            const email = emailList.find(e => e.id === id);
            const thread = emailList.filter(e => e.threadId === email?.threadId);
            return { email, thread };
          }
          return [];
        },
      });
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Shows the email list in the inbox', async () => {
    const ui = (
      <FilterProvider>
        <ClientPage emails={emailList} />
      </FilterProvider>
    );
    render(ui);

    await screen.findByTestId('email-list');

    expect(screen.getAllByText(threads[0].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[1].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[3].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[4].subject).length).toBeGreaterThan(0);
  });

  test('Displays the email content truncated to 30 characters', async () => {
    const ui = (
      <FilterProvider>
        <ClientPage emails={emailList} />
      </FilterProvider>
    );
    render(ui);

    await screen.findByTestId('email-list');

    expect(screen.getAllByText(threads[0].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[1].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[3].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[4].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
  });

  test('Displays full email content when clicking on an email', async () => {
    const ui = (
      <FilterProvider>
        <ClientPage emails={emailList} />
      </FilterProvider>
    );
    render(ui);

    await screen.findByTestId('email-list');

    const emailCard = screen.getByTestId(`email-card-${threads[0].id}`);
    await act(async () => {
      fireEvent.click(emailCard);
    });

    await screen.findByText(threads[0].content || '');
    expect(screen.getByText(threads[0].content || '')).toBeInTheDocument();
  });

  test('The search feature works as expected', async () => {
    const searchTerm = threads[0].subject;
    const matchingThreads = threads.filter(thread => thread.subject.includes(searchTerm));
    const matchingEmails = emailList.filter(email => email.subject.includes(searchTerm));

    const ui = (
      <FilterProvider>
        <ClientPage emails={emailList} />
      </FilterProvider>
    );
    render(ui);

    await screen.findByTestId('email-list');

    const searchInput = screen.getByPlaceholderText('Search emails...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: searchTerm } });
    });

    await waitFor(() => {
      const displayedEmails = screen.getAllByTestId(/email-card-/);
      expect(displayedEmails.length).toBeLessThan(emailList.length);
    }, { timeout: 2000 });

    expect(screen.getAllByText(searchTerm).length).toBeGreaterThan(0);

    const displayedEmails = screen.getAllByTestId(/email-card-/);
    expect(displayedEmails.length).toBeGreaterThanOrEqual(matchingThreads.length);
    expect(displayedEmails.length).toBeLessThanOrEqual(matchingEmails.length);
  });

  test('The search feature is debounced and works as expected', async () => {
    const searchTerm = threads[0].subject;

    const originalFetch = global.fetch;
    const fetchSpy = jest.fn((url: string, init?: RequestInit) => originalFetch(url, init));
    global.fetch = fetchSpy as typeof fetch;

    const ui = (
      <FilterProvider>
        <ClientPage emails={emailList} />
      </FilterProvider>
    );
    render(ui);

    await screen.findByTestId('email-list');

    fetchSpy.mockClear();

    const searchInput = screen.getByPlaceholderText('Search emails...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: searchTerm } });
    });

    expect(fetchSpy).not.toHaveBeenCalled();

    const displayedEmails = screen.getAllByTestId(/email-card-/);
    expect(displayedEmails.length).toBe(emailList.length);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    }, { timeout: 1500 });

    await waitFor(() => {
      const displayedEmails = screen.getAllByTestId(/email-card-/);
      expect(displayedEmails.length).toBeLessThan(emailList.length);
    });
  });
});
