import { signOut } from "next-auth/react";
import { toast } from "sonner";

const SESSION_EXPIRY_MESSAGE =
  "انتهت صلاحية جلستك أو تم حذف حسابك، يرجى تسجيل الدخول مرة أخرى";

export function handleSessionExpired(data: {
  sessionExpired?: boolean;
  error?: string;
}): boolean {
  if (data.sessionExpired) {
    toast.error(SESSION_EXPIRY_MESSAGE);
    signOut({ callbackUrl: "/login" });
    return true;
  }
  return false;
}
