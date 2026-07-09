import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Wrench, Loader2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — KAPS Spares Solutions" },
      { name: "description", content: "Secure admin dashboard for KAPS Spares Solutions." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Request = {
  id: string;
  client_name: string;
  email: string | null;
  phone: string | null;
  request_details: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUSES = ["Pending", "In Progress", "Resolved"] as const;

function AdminPage() {
  const [session, setSession] = useState<{ userId: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        setSession({ userId: s.user.id, email: s.user.email ?? undefined });
      } else {
        setSession(null);
        setIsAdmin(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession({ userId: data.session.user.id, email: data.session.user.email ?? undefined });
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.userId)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!error && !!data);
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <SignInCard />;
  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return <NotAdmin email={session.email} />;

  return <Dashboard email={session.email} />;
}

function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Sign-in failed", { description: error.message });
    }
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed", {
        description: result.error instanceof Error ? result.error.message : String(result.error),
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold uppercase leading-none">KAPS Admin</h1>
            <p className="text-xs text-muted-foreground">Secure portal</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={onGoogle}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12S6.7 21.7 12 21.7c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2H12z" />
          </svg>
          Continue with Google
        </Button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sign-ups are disabled. Contact your workspace administrator to be added as an admin user.
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotAdmin({ email }: { email?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account ({email}) is signed in but does not have admin access. Contact your workspace
          administrator to be granted the admin role.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Dashboard({ email }: { email?: string }) {
  const [rows, setRows] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Failed to load requests", { description: error.message });
      return;
    }
    setRows((data ?? []) as Request[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRow(id: string, patch: Partial<Request>) {
    const { error } = await supabase.from("requests").update(patch).eq("id", id);
    if (error) {
      toast.error("Update failed", { description: error.message });
      return;
    }
    toast.success("Saved");
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  const counts = {
    Pending: rows.filter((r) => r.status === "Pending").length,
    "In Progress": rows.filter((r) => r.status === "In Progress").length,
    Resolved: rows.filter((r) => r.status === "Resolved").length,
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold uppercase leading-none">KAPS Admin</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">View site</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending" value={counts.Pending} tone="pending" />
          <StatCard label="In Progress" value={counts["In Progress"]} tone="progress" />
          <StatCard label="Resolved" value={counts.Resolved} tone="resolved" />
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-display text-xl font-bold uppercase">Pending Requests</h2>
            <Button size="sm" variant="outline" onClick={load}>Refresh</Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead className="w-[160px]">Status</TableHead>
                    <TableHead className="w-[260px]">Admin notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className="align-top">
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{r.client_name}</TableCell>
                      <TableCell className="text-xs">
                        {r.email && <div>{r.email}</div>}
                        {r.phone && <div>{r.phone}</div>}
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-pre-wrap text-sm">
                        {r.request_details}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <StatusBadge status={r.status} />
                          <Select value={r.status} onValueChange={(v) => updateRow(r.id, { status: v })}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <NotesEditor value={r.admin_notes ?? ""} onSave={(v) => updateRow(r.id, { admin_notes: v })} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "pending" | "progress" | "resolved" }) {
  const toneClass = {
    pending: "border-amber-500/40 bg-amber-500/5",
    progress: "border-blue-500/40 bg-blue-500/5",
    resolved: "border-emerald-500/40 bg-emerald-500/5",
  }[tone];
  return (
    <div className={`rounded-xl border ${toneClass} p-6`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Resolved" ? "default" : status === "In Progress" ? "secondary" : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

function NotesEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [text, setText] = useState(value);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setText(value);
    setDirty(false);
  }, [value]);
  return (
    <div className="space-y-2">
      <Textarea
        rows={3}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
        }}
        placeholder="Internal notes…"
        className="text-xs"
      />
      {dirty && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(text)}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setText(value); setDirty(false); }}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
