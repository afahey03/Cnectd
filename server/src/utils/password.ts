export function validatePassword(pw: string): string | null {
  if (pw.length < 8 || pw.length > 20) {
    return "Password must be 8–20 characters long.";
  }
  if (!/[a-z]/.test(pw)) return "Password must contain a lowercase letter.";
  if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain a number.";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw))
    return "Password must contain a special character.";
  return null;
}
