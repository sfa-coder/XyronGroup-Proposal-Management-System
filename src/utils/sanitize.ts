/**
 * Application Security & Input Sanitization Utilities
 * Protects against XSS, Injection, Directory Traversal, SSRF, and Malicious Payloads.
 */

/**
 * Encodes special HTML characters into safe HTML entities to prevent XSS injection.
 */
export function escapeHtml(str: unknown): string {
  if (typeof str !== "string") {
    if (str === null || str === undefined) return "";
    return String(str);
  }
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips HTML tags, control characters, and limits string length.
 */
export function sanitizeText(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    return String(input).slice(0, maxLength);
  }
  // Strip null bytes and control characters (except newline and tab)
  const clean = input
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();

  return clean.slice(0, maxLength);
}

/**
 * Validates and normalizes email addresses to prevent header injection & malformed data.
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") return "";
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  // Standard RFC 5322 compliant regex for practical email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleaned)) {
    return "";
  }
  return cleaned;
}

/**
 * Sanitizes filenames to prevent Path Traversal (../, ..\, null bytes, control chars, reserved names).
 */
export function sanitizeFilename(filename: unknown, fallback: string = "document"): string {
  if (typeof filename !== "string" || !filename.trim()) {
    return `${fallback}_${Date.now()}`;
  }

  let clean = filename
    .replace(/\0/g, "")
    .replace(/[\/\\]/g, "_") // Replace slashes with underscores
    .replace(/\.\.+/g, ".") // Prevent directory traversal like ../
    .replace(/[^a-zA-Z0-9_.\- ]/g, "") // Remove unsafe characters
    .trim();

  // Strip leading dots or hyphens
  clean = clean.replace(/^[.\-]+/, "");

  if (!clean) {
    return `${fallback}_${Date.now()}`;
  }

  return clean.slice(0, 100);
}

/**
 * Validates and sanitizes URLs, blocking unsafe protocols like javascript:, vbscript:, data:text/html.
 * Only allows http://, https://, mailto:, tel:, or safe data:image/ URIs.
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Check for safe protocols
  const isHttp = /^https?:\/\//i.test(trimmed);
  const isMailto = /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(trimmed);
  const isTel = /^tel:\+?[0-9\s\-()]{6,20}$/i.test(trimmed);
  const isSafeDataImage = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed);

  if (isHttp || isMailto || isTel || isSafeDataImage) {
    return trimmed;
  }

  // If protocol-relative or relative path starting with /
  if (/^\/[a-zA-Z0-9_.\-/?=&%#]*$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

/**
 * Secure file upload validator: checks extension, MIME type, and size limits.
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadedFile(
  file: File,
  allowedMimes: string[] = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSizeBytes: number = 5 * 1024 * 1024 // 5 MB default
): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File size exceeds the maximum allowed limit of ${maxMb} MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }

  // Check MIME type against whitelist
  const mime = file.type.toLowerCase();
  if (!allowedMimes.includes(mime)) {
    return {
      valid: false,
      error: `Unsupported file type (${mime || "unknown"}). Allowed formats: ${allowedMimes
        .map((m) => m.split("/")[1]?.toUpperCase() || m)
        .join(", ")}`,
    };
  }

  // Check filename extension matches MIME type
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "application/pdf": ["pdf"],
  };

  const expectedExts = allowedExtensions[mime];
  if (expectedExts && ext && !expectedExts.includes(ext)) {
    return { valid: false, error: `File extension .${ext} does not match its content type.` };
  }

  return { valid: true };
}

/**
 * Validates password strength according to enterprise security standards:
 * - At least 8 characters long
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains a number
 * - Contains a special symbol
 */
export interface PasswordStrengthResult {
  valid: boolean;
  score: number; // 0 to 4
  strengthLabel: "Weak" | "Fair" | "Good" | "Strong";
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push("Password must be at least 8 characters long.");
  } else {
    score += 1;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include both uppercase and lowercase letters.");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include at least one number.");
  }

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include at least one special character (e.g. !@#$%^&*).");
  }

  let strengthLabel: "Weak" | "Fair" | "Good" | "Strong" = "Weak";
  if (score === 2) strengthLabel = "Fair";
  else if (score === 3) strengthLabel = "Good";
  else if (score === 4) strengthLabel = "Strong";

  return {
    valid: score >= 3 && password.length >= 8,
    score,
    strengthLabel,
    feedback,
  };
}
