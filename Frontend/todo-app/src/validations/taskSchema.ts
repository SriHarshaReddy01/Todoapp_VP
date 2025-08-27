import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string()
    .min(11, { message: 'Title must be longer than 10 characters' })
    .max(256, { message: 'Title must be 256 characters or less' }),
  notes: z.string()
    .max(1000, { message: 'Notes must be 1000 characters or less' })
    .optional()
    .nullable(),
  dueDate: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)), 
      { message: 'Due date must be a valid date' }
    )
});

export const updateTaskSchema = z.object({
  title: z.string()
    .min(11, { message: 'Title must be longer than 10 characters' })
    .max(256, { message: 'Title must be 256 characters or less' })
    .optional(),
  notes: z.string()
    .max(1000, { message: 'Notes must be 1000 characters or less' })
    .optional()
    .nullable(),
  dueDate: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)), 
      { message: 'Due date must be a valid date' }
    ),
  done: z.boolean().optional()
});
