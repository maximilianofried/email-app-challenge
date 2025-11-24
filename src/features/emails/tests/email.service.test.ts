import { EmailService } from '../services/email.service';
import { EmailRepository } from '../repositories/email.repository';
import { ThreadService } from '../../threads/services/thread.service';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import { CreateEmailDto } from '@/lib/dtos/emails.dto';
import { Email, EmailDirection } from '@/lib/schema';

const mockEmailRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  search: jest.fn(),
  findByDirection: jest.fn(),
  findImportant: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findDeleted: jest.fn(),
};

const mockThreadService = {
  getThreadEmailsForDeletedEmail: jest.fn(),
  getEmailsByThreadId: jest.fn(),
  getThreadedEmailsByDirection: jest.fn(),
};

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();


    emailService = new EmailService(
      mockEmailRepository as unknown as EmailRepository,
      mockThreadService as unknown as ThreadService,
    );
  });

  describe('getEmailById', () => {
    it('should return an email if found', async () => {
      const mockEmail = { id: 1, subject: 'Test' } as Email;
      mockEmailRepository.findById.mockResolvedValue(mockEmail);

      const result = await emailService.getEmailById(1);

      expect(result).toEqual(mockEmail);
      expect(mockEmailRepository.findById).toHaveBeenCalledWith(1, false);
    });

    it('should throw NotFoundError if email does not exist', async () => {
      mockEmailRepository.findById.mockResolvedValue(undefined);

      await expect(emailService.getEmailById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createEmail', () => {
    const validData: CreateEmailDto = {
      from: 'me@test.com',
      to: 'you@test.com',
      subject: 'Hello',
      content: 'World',
    };

    it('should create an email successfully', async () => {
      const mockCreatedEmail = { id: 1, ...validData } as unknown as Email;
      mockEmailRepository.create.mockResolvedValue(mockCreatedEmail);

      const result = await emailService.createEmail(validData);

      expect(result).toEqual(mockCreatedEmail);
      expect(mockEmailRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Hello',
        isRead: true,
        direction: EmailDirection.OUTGOING,
      }));
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      const invalidData = { ...validData, subject: '' };
      await expect(emailService.createEmail(invalidData)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateReadStatus', () => {
    it('should update read status successfully', async () => {
      const mockEmail = { id: 1, isDeleted: false } as Email;
      mockEmailRepository.findById.mockResolvedValue(mockEmail);
      mockEmailRepository.update.mockResolvedValue({ ...mockEmail, isRead: true });

      const result = await emailService.updateReadStatus(1, true);

      expect(result.isRead).toBe(true);
      expect(mockEmailRepository.update).toHaveBeenCalledWith(1, { isRead: true });
    });

    it('should throw NotFoundError if email not found', async () => {
      mockEmailRepository.findById.mockResolvedValue(undefined);
      await expect(emailService.updateReadStatus(999, true)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if email is deleted', async () => {
      const mockEmail = { id: 1, isDeleted: true } as Email;
      mockEmailRepository.findById.mockResolvedValue(mockEmail);

      await expect(emailService.updateReadStatus(1, true)).rejects.toThrow(BadRequestError);
    });
  });
});
