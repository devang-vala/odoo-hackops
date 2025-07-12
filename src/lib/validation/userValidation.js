import { z } from 'zod';

// Rough MongoDB ObjectId pattern (24 hex chars)
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Zod schema mirroring your Mongoose User model
export const UserInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address' }),

  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),

  role: z
    .enum(['user', 'admin'])
    .default('user'),

  notifications: z
    .array(
      z.string()
       .regex(objectIdPattern, { message: 'Invalid notification ID' })
    )
    .optional(),

  questionsAsked: z
    .number()
    .int()
    .nonnegative()
    .default(0),

  answersGiven: z
    .number()
    .int()
    .nonnegative()
    .default(0),

  isActive: z
    .boolean()
    .default(true),

  lastLogin: z
    .preprocess((val) => {
      if (typeof val === 'string' || val instanceof Date) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d;
      }
      return undefined;
    }, z.date().optional()),
});

/**
 * validateUserInput
 * @param {unknown} data incoming payload (e.g. req.body)
 * @returns sanitized data matching the schema
 * @throws ZodError if validation fails
 */
export function validateUserInput(data) {
  return UserInputSchema.parse(data);
}
