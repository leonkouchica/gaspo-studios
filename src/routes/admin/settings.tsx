import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAdmin } from "../admin";
import {
  CreditCard, Users, Settings as SettingsIcon, Save,
  Plus, Shield, Key, Eye, EyeOff, UserMinus, ToggleLeft, ToggleRight, Trash2, Mail
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchPaymentSettings,
  upsertPaymentSettings
} from "../../lib/actions/payment";
import {
  listStaffUsers,
  createStaffUser,
  updateUserRole,
  deleteStaffUser
} from "../../lib/actions/auth";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { role } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"payments" | "staff" | "site">("payments");

  // Redirect if not admin
  useEffect(() => {
    if (role && role !== "admin") {
      toast.error("Access denied. Settings are restricted to administrators.");
      navigate({ to: "/admin" });
    }
  }, [role, navigate]);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Individual gateway forms
  const [paystackPub, setPaystackPub] = useState("");
  const [paystackSec, setPaystackSec] = useState("");
  const [paystackActive, setPaystackActive] = useState(false);
  const [paystackTest, setPaystackTest] = useState(true);

  const [flwPub, setFlwPub] = useState("");
  const [flwSec, setFlwSec] = useState("");
  const [flwActive, setFlwActive] = useState(false);
  const [flwTest, setFlwTest] = useState(true);

  // Staff users state
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Staff Form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor" | "photographer" | "viewer">("viewer");
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Site info state (mock)
  const [studioName, setStudioName] = useState("Gaspo Studios");
  const [studioEmail, setStudioEmail] = useState("info@gaspostudios.com");
  const [studioPhone, setStudioPhone] = useState("0806 585 6429");
  const [studioAddress, setStudioAddress] = useState("Phase 2, Charly Boy Bus/Stop, 4a Ajidagan St, Gbagada, Lagos 100101, Lagos");

  // Load payment settings
  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await fetchPaymentSettings();
      setPaymentSettings(data);
      const paystack = data.find(p => p.gateway === "paystack");
      if (paystack) {
        setPaystackPub(paystack.publicKey);
        setPaystackActive(paystack.active);
        setPaystackTest(paystack.testMode);
        setPaystackSec(""); // Masked
      }
      const flw = data.find(p => p.gateway === "flutterwave");
      if (flw) {
        setFlwPub(flw.publicKey);
        setFlwActive(flw.active);
        setFlwTest(flw.testMode);
        setFlwSec(""); // Masked
      }
    } catch (err: any) {
      toast.error(`Error loading payment settings: ${err.message}`);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Load staff users
  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const data = await listStaffUsers();
      setStaffUsers(data);
    } catch (err: any) {
      toast.error(`Error listing staff: ${err.message}`);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      loadPayments();
      loadStaff();
    }
  }, [role]);

  // Save payments handler
  const handleSavePayment = async (gateway: "paystack" | "flutterwave") => {
    try {
      const pubKey = gateway === "paystack" ? paystackPub : flwPub;
      const secKey = gateway === "paystack" ? paystackSec : flwSec;
      const active = gateway === "paystack" ? paystackActive : flwActive;
      const testMode = gateway === "paystack" ? paystackTest : flwTest;

      const result = await upsertPaymentSettings({
        data: {
          gateway,
          publicKey: pubKey,
          secretKey: secKey || undefined, // don't send if empty/unchanged
          active,
          testMode,
        }
      });

      toast.success(`${gateway === "paystack" ? "Paystack" : "Flutterwave"} settings updated successfully.`);
      loadPayments();
    } catch (err: any) {
      toast.error(`Failed to update settings: ${err.message}`);
    }
  };

  // Create staff handler
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast.error("Please fill in email and password.");
      return;
    }
    setSubmittingStaff(true);
    try {
      await createStaffUser({
        data: {
          email: newEmail,
          password: newPassword,
          role: newRole
        }
      });
      toast.success(`Staff user ${newEmail} created successfully.`);
      setNewEmail("");
      setNewPassword("");
      setNewRole("viewer");
      setShowCreateModal(false);
      loadStaff();
    } catch (err: any) {
      toast.error(`Failed to create user: ${err.message}`);
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Role toggle handler
  const handleRoleChange = async (userId: string, currentRole: string) => {
    const roles: ("admin" | "editor" | "photographer" | "viewer")[] = ["admin", "editor", "photographer", "viewer"];
    const currentIndex = roles.indexOf(currentRole as any);
    const nextIndex = (currentIndex + 1) % roles.length;
    const targetRole = roles[nextIndex];

    try {
      await updateUserRole({
        data: {
          userId,
          role: targetRole
        }
      });
      toast.success(`Role updated to ${targetRole.toUpperCase()}`);
      loadStaff();
    } catch (err: any) {
      toast.error(`Failed to update role: ${err.message}`);
    }
  };

  // Delete staff handler
  const handleDeleteStaff = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove staff member ${email}?`)) return;

    try {
      await deleteStaffUser({ data: { userId } });
      toast.success(`Staff user ${email} removed.`);
      loadStaff();
    } catch (err: any) {
      toast.error(`Failed to delete staff: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage gateways, credentials, site details, and staff users.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "payments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-dark"
          }`}
        >
          <CreditCard size={16} /> Payment Gateways
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "staff" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-dark"
          }`}
        >
          <Users size={16} /> Staff Accounts
        </button>
        <button
          onClick={() => setActiveTab("site")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "site" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-dark"
          }`}
        >
          <SettingsIcon size={16} /> Site Settings
        </button>
      </div>

      {/* TAB CONTENT: PAYMENTS */}
      {activeTab === "payments" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* PAYSTACK PANEL */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">P</div>
                  <div>
                    <h3 className="font-bold text-dark">Paystack Gateway</h3>
                    <p className="text-xs text-muted-foreground">Process card and bank transfers instantly.</p>
                  </div>
                </div>
                <button
                  onClick={() => setPaystackActive(!paystackActive)}
                  className="focus:outline-none transition-transform hover:scale-105"
                >
                  {paystackActive ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">Inactive</span>
                  )}
                </button>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Sandbox Mode</span>
                  <button
                    type="button"
                    onClick={() => setPaystackTest(!paystackTest)}
                    className="text-primary hover:text-primary-hover"
                  >
                    {paystackTest ? <ToggleRight size={38} className="text-primary" /> : <ToggleLeft size={38} className="text-slate-400" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark block">Public Key</label>
                  <input
                    type="text"
                    value={paystackPub}
                    onChange={(e) => setPaystackPub(e.target.value)}
                    placeholder="pk_test_..."
                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark block">Secret Key</label>
                  <div className="relative">
                    <Key size={14} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={paystackSec}
                      onChange={(e) => setPaystackSec(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••"
                      className="w-full bg-slate-50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSavePayment("paystack")}
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save size={15} /> Save Paystack Config
            </button>
          </div>

          {/* FLUTTERWAVE PANEL */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">F</div>
                  <div>
                    <h3 className="font-bold text-dark">Flutterwave Gateway</h3>
                    <p className="text-xs text-muted-foreground">Collect worldwide mobile money & cards.</p>
                  </div>
                </div>
                <button
                  onClick={() => setFlwActive(!flwActive)}
                  className="focus:outline-none transition-transform hover:scale-105"
                >
                  {flwActive ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">Inactive</span>
                  )}
                </button>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Sandbox Mode</span>
                  <button
                    type="button"
                    onClick={() => setFlwTest(!flwTest)}
                    className="text-primary hover:text-primary-hover"
                  >
                    {flwTest ? <ToggleRight size={38} className="text-primary" /> : <ToggleLeft size={38} className="text-slate-400" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark block">Public Key</label>
                  <input
                    type="text"
                    value={flwPub}
                    onChange={(e) => setFlwPub(e.target.value)}
                    placeholder="FLWPUBK_TEST-..."
                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark block">Secret Key</label>
                  <div className="relative">
                    <Key size={14} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={flwSec}
                      onChange={(e) => setFlwSec(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••"
                      className="w-full bg-slate-50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSavePayment("flutterwave")}
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save size={15} /> Save Flutterwave Config
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STAFF */}
      {activeTab === "staff" && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-dark">Staff Users & Access Controls</h3>
              <p className="text-xs text-muted-foreground">Manage admin, editor, photographer, and read-only roles.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
            >
              <Plus size={16} /> Create Staff
            </button>
          </div>

          {loadingStaff ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium tracking-wide">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle" />
              Fetching Accounts...
            </div>
          ) : staffUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">No staff users configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Assigned</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-dark">{user.email}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleRoleChange(user.userId, user.role)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "editor"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "photographer"
                                  ? "bg-teal-100 text-teal-700"
                                  : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteStaff(user.userId, user.email)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center ml-auto transition-colors cursor-pointer"
                          title="Remove user account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CREATE STAFF MODAL */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
              <div className="relative bg-white border border-border shadow-2xl rounded-3xl w-full max-w-md p-6 space-y-5 z-10">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-dark">Register New Staff Account</h3>
                  <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-lg bg-muted text-slate-500 hover:text-dark flex items-center justify-center">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark block">Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="editor@gaspostudios.com"
                      className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark block">Temporary Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters..."
                      className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark block">Assign Role Level</label>
                    <select
                      value={newRole}
                      onChange={(e: any) => setNewRole(e.target.value)}
                      className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                    >
                      <option value="admin">Admin (Full Control)</option>
                      <option value="editor">Editor (Blog, Events, Gallery)</option>
                      <option value="photographer">Photographer (Gallery only)</option>
                      <option value="viewer">Viewer (Read-only Analytics/Bookings)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingStaff}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submittingStaff ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Account <Plus size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SITE INFO */}
      {activeTab === "site" && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-bold text-dark">Studio & Profile Settings</h3>
            <p className="text-xs text-muted-foreground">Customize contact values and visual branding preferences (Static Preview).</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark block">Studio Name</label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark block">Public Contact Email</label>
              <input
                type="email"
                value={studioEmail}
                onChange={(e) => setStudioEmail(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark block">Public Phone Number</label>
              <input
                type="text"
                value={studioPhone}
                onChange={(e) => setStudioPhone(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark block">Physical Studio Address</label>
              <input
                type="text"
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => toast.success("Site info preferences updated! (Preview mode)")}
            className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl px-6 py-2.5 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Save size={15} /> Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
