import { ThreadService } from '../services/thread.service';
import { ThreadRepository } from '../repositories/thread.repository';
import { Email, EmailDirection } from '@/lib/schema';

// Manual mock for ThreadRepository
const mockThreadRepository = {
  findLatestByThread: jest.fn(),
  findLatestByThreadAndDirection: jest.fn(),
  findByThreadId: jest.fn(),
  markThreadAsRead: jest.fn(),
  deleteByThreadId: jest.fn(),
};

describe('ThreadService', () => {
  let threadService: ThreadService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Explicit dependency injection
    threadService = new ThreadService(
      mockThreadRepository as unknown as ThreadRepository,
    );
  });

  describe('getThreadedEmails', () => {
    it('should return latest emails grouped by thread', async () => {
      const mockEmails = [{ id: 1, subject: 'Test' }] as Email[];
      mockThreadRepository.findLatestByThread.mockResolvedValue(mockEmails);

      const result = await threadService.getThreadedEmails();

      expect(result).toEqual(mockEmails);
      expect(mockThreadRepository.findLatestByThread).toHaveBeenCalled();
    });

    it('should filter by direction if provided', async () => {
      const mockEmails = [{ id: 1, subject: 'Test' }] as Email[];
      mockThreadRepository.findLatestByThreadAndDirection.mockResolvedValue(mockEmails);

      const result = await threadService.getThreadedEmails(EmailDirection.INCOMING);

      expect(result).toEqual(mockEmails);
      expect(mockThreadRepository.findLatestByThreadAndDirection).toHaveBeenCalledWith(EmailDirection.INCOMING, 20, undefined);
    });

    it('should pass pagination parameters to repository', async () => {
      const mockEmails = [{ id: 1, subject: 'Test' }] as Email[];
      mockThreadRepository.findLatestByThread.mockResolvedValue(mockEmails);

      const limit = 10;
      const cursor = 100;

      await threadService.getThreadedEmails(undefined, limit, cursor);

      expect(mockThreadRepository.findLatestByThread).toHaveBeenCalledWith(limit, cursor);
    });

    it('should pass pagination parameters with direction', async () => {
      const mockEmails = [{ id: 1, subject: 'Test' }] as Email[];
      mockThreadRepository.findLatestByThreadAndDirection.mockResolvedValue(mockEmails);

      const limit = 10;
      const cursor = 100;
      const direction = EmailDirection.INCOMING;

      await threadService.getThreadedEmails(direction, limit, cursor);

      expect(mockThreadRepository.findLatestByThreadAndDirection).toHaveBeenCalledWith(direction, limit, cursor);
    });
  });

  describe('getThreadEmailsForDeletedEmail', () => {
    it('should return entire thread if all emails are deleted', async () => {
      const threadId = 'thread-123';
      const allDeletedEmails = [
        { id: 1, threadId, isDeleted: true },
        { id: 2, threadId, isDeleted: true },
      ] as Email[];

      mockThreadRepository.findByThreadId.mockResolvedValue(allDeletedEmails);

      const result = await threadService.getThreadEmailsForDeletedEmail(threadId);

      expect(result).toEqual(allDeletedEmails);
    });

    it('should return only deleted emails if thread is partially deleted', async () => {
      const threadId = 'thread-123';
      const mixedEmails = [
        { id: 1, threadId, isDeleted: true },
        { id: 2, threadId, isDeleted: false },
      ] as Email[];

      mockThreadRepository.findByThreadId.mockResolvedValue(mixedEmails);

      const result = await threadService.getThreadEmailsForDeletedEmail(threadId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('deleteThread', () => {
    it('should delete all emails in a thread', async () => {
      const threadId = 'thread-123';
      const activeEmails = [{ id: 1, threadId, isDeleted: false }] as Email[];

      mockThreadRepository.findByThreadId.mockResolvedValue(activeEmails);

      await threadService.deleteThread(threadId);

      expect(mockThreadRepository.deleteByThreadId).toHaveBeenCalledWith(threadId);
    });

    it('should do nothing if all emails are already deleted', async () => {
      const threadId = 'thread-123';

      // First call returns no active emails
      mockThreadRepository.findByThreadId
        .mockResolvedValueOnce([]) // active
        .mockResolvedValueOnce([{ id: 1, isDeleted: true }]); // all

      await threadService.deleteThread(threadId);

      expect(mockThreadRepository.deleteByThreadId).not.toHaveBeenCalled();
    });

    it('should throw Error if thread not found', async () => {
      const threadId = 'thread-123';

      mockThreadRepository.findByThreadId
        .mockResolvedValueOnce([]) // active
        .mockResolvedValueOnce([]); // all (empty means not found)

      await expect(threadService.deleteThread(threadId)).rejects.toThrow('Thread not found');
    });
  });
});
