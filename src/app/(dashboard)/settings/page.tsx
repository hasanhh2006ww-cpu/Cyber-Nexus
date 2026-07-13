"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  User, Mail, Lock, Bell, Shield, Trash2, Save, Eye, EyeOff, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";

interface SettingsData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  preferences: {
    newCourseNotifications: boolean;
    emailNotifications: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [newCourseNotifications, setNewCourseNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user/settings");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.sessionExpired) {
          toast.error(data.error);
          signOut({ callbackUrl: "/login" });
          return;
        }
        setSettings(data);
        setName(data.name);
        setEmail(data.email);
        setNewCourseNotifications(data.preferences.newCourseNotifications);
        setEmailNotifications(data.preferences.emailNotifications);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [router]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.sessionExpired) {
        toast.error(data.error);
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        toast.success("تم حفظ التغييرات بنجاح");
        setSettings((s) => s ? { ...s, name, email } : s);
      } else {
        toast.error(data.error || "فشل حفظ التغييرات");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.sessionExpired) {
        toast.error(data.error);
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        toast.success("تم تحديث كلمة المرور بنجاح");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "فشل تحديث كلمة المرور");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: { newCourseNotifications, emailNotifications },
        }),
      });
      const data = await res.json();
      if (data.sessionExpired) {
        toast.error(data.error);
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        toast.success("تم حفظ تفضيلات الإشعارات");
      } else {
        toast.error(data.error || "فشل حفظ التفضيلات");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/settings", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("تم حذف الحساب بنجاح");
        signOut({ callbackUrl: "/login" });
      } else {
        toast.error(data.error || "فشل حذف الحساب");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-48 bg-[var(--secondary)] rounded-[var(--radius)] animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">الإعدادات</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">إدارة حسابك وتفضيلاتك</p>
            </div>

            {/* Section 1: Account Info */}
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                  <User className="h-5 w-5 text-[var(--primary)]" />
                  معلومات الحساب
                </CardTitle>
                <CardDescription>تحديث معلوماتك الشخصية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center text-xl font-bold text-[var(--primary)]">
                    {settings?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{settings?.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{settings?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[var(--foreground)]">الاسم</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[var(--background)] border-[var(--border)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--foreground)]">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[var(--background)] border-[var(--border)]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !name || !email}
                    className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
                  >
                    {savingProfile ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                    ) : (
                      <Save className="ml-2 h-4 w-4" />
                    )}
                    {savingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Password */}
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                  <Lock className="h-5 w-5 text-[var(--primary)]" />
                  كلمة المرور
                </CardTitle>
                <CardDescription>تحديث كلمة المرور الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-[var(--foreground)]">كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-[var(--background)] border-[var(--border)] pl-10"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-[var(--foreground)]">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[var(--background)] border-[var(--border)] pl-10"
                      placeholder="6 أحرف على الأقل"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[var(--foreground)]">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[var(--background)] border-[var(--border)]"
                    placeholder="••••••"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
                  >
                    {savingPassword ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                    ) : (
                      <Lock className="ml-2 h-4 w-4" />
                    )}
                    {savingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Notifications */}
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                  <Bell className="h-5 w-5 text-[var(--primary)]" />
                  الإشعارات
                </CardTitle>
                <CardDescription>تخصيص تفضيلات الإشعارات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">إشعارات الدورات الجديدة</p>
                    <p className="text-xs text-[var(--muted-foreground)]">تنبيه عند إضافة دورات جديدة</p>
                  </div>
                  <Switch
                    checked={newCourseNotifications}
                    onCheckedChange={setNewCourseNotifications}
                  />
                </div>
                <Separator className="bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">إشعارات البريد الإلكتروني</p>
                    <p className="text-xs text-[var(--muted-foreground)]">استلام تحديثات عبر البريد</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={savingNotifications}
                    className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
                  >
                    {savingNotifications ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                    ) : (
                      <Save className="ml-2 h-4 w-4" />
                    )}
                    {savingNotifications ? "جاري الحفظ..." : "حفظ التفضيلات"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Security */}
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
                  <Shield className="h-5 w-5 text-[var(--primary)]" />
                  الأمان
                </CardTitle>
                <CardDescription>معلومات الأمان لحسابك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[var(--muted-foreground)]">تاريخ الإنشاء</span>
                  <span className="text-sm text-[var(--foreground)]">
                    {settings?.createdAt ? new Date(settings.createdAt).toLocaleDateString("ar-SA") : "—"}
                  </span>
                </div>
                <Separator className="bg-[var(--border)]" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[var(--muted-foreground)]">طريقة تسجيل الدخول</span>
                  <span className="text-sm text-[var(--foreground)]">البريد الإلكتروني وكلمة المرور</span>
                </div>
                <Separator className="bg-[var(--border)]" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[var(--muted-foreground)]">الدور</span>
                  <span className="text-sm text-[var(--foreground)] capitalize">
                    {settings?.role === "admin" ? "مدير" : "طالب"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Danger Zone */}
            <Card className="border-red-500/20 bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Trash2 className="h-5 w-5" />
                  الحساب
                </CardTitle>
                <CardDescription>الإجراءات الخطيرة على حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">حذف الحساب</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      حذف حسابك نهائياً وجميع البيانات المرتبطة به
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف الحساب
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    هل أنت متأكد من حذف حسابك؟
                  </DialogTitle>
                  <DialogDescription>
                    هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع بياناتك نهائياً،
                    بما في ذلك التقدم في الدورات ونتائج الاختبارات والمسجل في الدورات.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={deleting}
                    className="border-[var(--border)]"
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                    ) : null}
                    {deleting ? "جاري الحذف..." : "نعم، حذف الحساب"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
