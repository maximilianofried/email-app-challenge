import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  EmailComposerProps,
  EmailComposerFormData,
  EmailComposerFormErrors,
} from '@/features/emails/types/email.types';
import { CreateEmailDto } from '@/features/emails/dtos/emails.dto';

const initialFormData: EmailComposerFormData = {
  from: '',
  subject: '',
  to: '',
  content: '',
  cc: '',
  bcc: '',
};

const initialErrors: EmailComposerFormErrors = {};

const EmailComposer: React.FC<EmailComposerProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<EmailComposerFormData>(initialFormData);
  const [errors, setErrors] = useState<EmailComposerFormErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof EmailComposerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: EmailComposerFormErrors = {};

    if (!formData.from.trim()) {
      newErrors.from = 'From is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.to.trim()) {
      newErrors.to = 'To is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData: CreateEmailDto = {
        from: formData.from.trim(),
        subject: formData.subject.trim(),
        to: formData.to.trim(),
        content: formData.content.trim(),
        cc: formData.cc?.trim() || undefined,
        bcc: formData.bcc?.trim() || undefined,
      };
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Compose Email</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="from"
              type="email"
              label="From"
              value={formData.from}
              onChange={handleChange('from')}
              error={!!errors.from}
              helperText={errors.from}
              required
              fullWidth
            />
            <TextField
              name="to"
              type="email"
              label="To"
              value={formData.to}
              onChange={handleChange('to')}
              error={!!errors.to}
              helperText={errors.to}
              required
              fullWidth
            />
            <TextField
              name="cc"
              type="email"
              label="CC"
              value={formData.cc}
              onChange={handleChange('cc')}
              error={!!errors.cc}
              helperText={errors.cc}
              fullWidth
            />
            <TextField
              name="bcc"
              type="email"
              label="BCC"
              value={formData.bcc}
              onChange={handleChange('bcc')}
              error={!!errors.bcc}
              helperText={errors.bcc}
              fullWidth
            />
            <TextField
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleChange('subject')}
              error={!!errors.subject}
              helperText={errors.subject}
              required
              fullWidth
            />
            <TextField
              name="content"
              label="Content"
              value={formData.content}
              onChange={handleChange('content')}
              error={!!errors.content}
              helperText={errors.content}
              required
              fullWidth
              multiline
              rows={8}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailComposer;

