import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// Separator not needed — using subtle borders in layout
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      return;
    }
    try {
      setSubmitting(true);
      setStatus(null);
      // Minimal client-side behavior: pretend to send and show success
      await new Promise((r) => setTimeout(r, 700));
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">We're here to help — send us a message and we'll get back to you within one business day. For urgent matters, please call us.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          {/* Form Card */}
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>Use the form to reach the admin team — we reply within one business day.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@institution.edu" />
                  </div>
                </div>

                <div>
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting} className="inline-flex items-center gap-2">
                      {submitting ? "Sending..." : "Send Message"}
                      <Send className="size-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => { setName(""); setEmail(""); setSubject(""); setMessage(""); }}>
                      Reset
                    </Button>
                  </div>
                  <div>
                    {status === "success" && <span className="text-sm text-emerald-600">Message sent — we'll be in touch.</span>}
                    {status === "error" && <span className="text-sm text-destructive">Please complete required fields.</span>}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle>Contact details</CardTitle>
                <CardDescription>Office and support information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <MapPin className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Hostelia Administrative Office</p>
                      <p className="text-sm text-muted-foreground">123 Campus Road, Building A, City</p>
                    </div>
                  </div>

                  <a href="mailto:support@hostelia.example" className="flex items-start gap-3 hover:bg-muted/5 rounded-md p-2">
                    <div className="rounded-lg bg-muted p-2">
                      <Mail className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@hostelia.example</p>
                    </div>
                  </a>

                  <a href="tel:+15551234567" className="flex items-start gap-3 hover:bg-muted/5 rounded-md p-2">
                    <div className="rounded-lg bg-muted p-2">
                      <Phone className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </a>

                  <div className="pt-1 border-t border-border/60" />

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Clock className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-sm text-muted-foreground">Mon — Fri: 9:00 AM — 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;