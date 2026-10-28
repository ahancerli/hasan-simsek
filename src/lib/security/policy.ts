import { z } from "zod";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

/** Parola politikası: uzunluk + harf + rakam. (Eski sistem: 6-8 karakter, md5.) */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Şifre en az ${PASSWORD_MIN} karakter olmalı`)
  .max(PASSWORD_MAX)
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Şifre en az bir harf ve bir rakam içermeli");
