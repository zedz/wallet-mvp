import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const sendUSDCSchema = z.object({
  toAddress: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
  label: z.string().optional(),
});

export const sendUSDTSchema = z.object({
  toAddress: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
  label: z.string().optional(),
});

export const sendXRPSchema = z.object({
  toAddress: z.string().min(1, 'Recipient address is required'),
  amountXrp: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
  label: z.string().optional(),
});

export const crossBorderSchema = z.object({
  toUserId: z.string().min(1, 'Recipient user ID is required'),
  amount: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
});

export const issueCardSchema = z.object({
  amount: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
});

export const topupCardSchema = z.object({
  amount: z.string().min(1, 'Amount is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SendUSDCData = z.infer<typeof sendUSDCSchema>;
export type SendUSDTData = z.infer<typeof sendUSDTSchema>;
export type SendXRPData = z.infer<typeof sendXRPSchema>;
export type CrossBorderData = z.infer<typeof crossBorderSchema>;
export type IssueCardData = z.infer<typeof issueCardSchema>;
export type TopupCardData = z.infer<typeof topupCardSchema>;