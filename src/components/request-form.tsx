import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const schema = z
  .object({
    client_name: z.string().trim().min(2, "Enter your name").max(100),
    email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
    phone: z.string().trim().min(6, "Enter a valid phone").max(30).optional().or(z.literal("")),
    request_details: z
      .string()
      .trim()
      .min(10, "Please describe your request (min 10 chars)")
      .max(2000),
  })
  .refine((d) => d.email || d.phone, {
    message: "Provide either an email or a phone number",
    path: ["email"],
  });

export function RequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [values, setValues] = useState({ client_name: "", email: "", phone: "", request_details: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const payload = {
      client_name: parsed.data.client_name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      request_details: parsed.data.request_details,
    };
    const { error } = await supabase.from("requests").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit request", { description: error.message });
      return;
    }
    setSubmitted(true);
    toast.success("Request submitted", { description: "Our team will be in touch shortly." });
    setValues({ client_name: "", email: "", phone: "", request_details: "" });
    onSuccess?.();
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h3 className="mt-4 font-display text-2xl font-bold">Request received</h3>
        <p className="mt-2 text-muted-foreground">
          Thank you. Our team will contact you shortly regarding your spare parts or service inquiry.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="client_name">Full name *</Label>
          <Input
            id="client_name"
            value={values.client_name}
            onChange={(e) => setValues({ ...values, client_name: e.target.value })}
            placeholder="John Banda"
            maxLength={100}
          />
          {errors.client_name && <p className="mt-1 text-xs text-destructive">{errors.client_name}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
            placeholder="+260 …"
            maxLength={30}
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          placeholder="you@example.com"
          maxLength={255}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="request_details">Request details *</Label>
        <Textarea
          id="request_details"
          rows={5}
          value={values.request_details}
          onChange={(e) => setValues({ ...values, request_details: e.target.value })}
          placeholder="Describe the spare part, vehicle make/model, or service you need…"
          maxLength={2000}
        />
        {errors.request_details && (
          <p className="mt-1 text-xs text-destructive">{errors.request_details}</p>
        )}
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Submit Request"}
      </Button>
    </form>
  );
}
