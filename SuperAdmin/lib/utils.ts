import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * MD5加密函数
 */
export function md5(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex")
}
