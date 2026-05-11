"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SERVICES } from "@/data/services";
import { PaymentMethodsSection } from "@/components/shared/PaymentMethodsSection";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  budget: z.string().optional(),
  message: z.string().min(10, "Please describe your project"),
});

type FormData = z.infer<typeof schema>;

const BUDGETS = [
  "Under $500",
  "$500–$1,500",
  "$1,500–$5,000",
  "$5,000–$15,000",
  "$15,000+",
  "Let's discuss",
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }

      let msg = "Something went wrong. WhatsApp us instead.";
      try {
        const payload = (await res.json()) as { error?: string };
        if (payload?.error) msg = payload.error;
      } catch {
        // ignore
      }
      setErrorMessage(msg);
      setStatus("error");
    } catch {
      setErrorMessage("Network error. Please try again, or WhatsApp us instead.");
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text)",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
  };
  const labelStyle = {
    display: "block",
    color: "var(--color-muted)",
    fontSize: 13,
    marginBottom: 6,
  };
  const errStyle = { color: "#FF6B6B", fontSize: 12, marginTop: 4 };

  return (
    <main
      style={{
        paddingTop: 100,
        minHeight: "100vh",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 640, marginBottom: 60 }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", marginBottom: 16 }}>
            Let&apos;s build something great
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 18 }}>
            We respond within 24 hours. Usually much faster. Serving Utah, the US,
            and international clients with web, SaaS, AI, and business setup services.
          </p>
        </div>

        <div className="contact-grid">
          <div>
            {status === "success" ? (
              <div
                style={{
                  padding: 32,
                  background: "rgba(56,163,255,0.08)",
                  border: "1px solid var(--color-border-glow)",
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                  Message received
                </div>
                <p style={{ color: "var(--color-muted)" }}>
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  className="contact-form-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input
                      {...register("name")}
                      placeholder="Your name"
                      style={inputStyle}
                    />
                    {errors.name && (
                      <p style={errStyle}>{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      {...register("email")}
                      placeholder="your@email.com"
                      style={inputStyle}
                    />
                    {errors.email && (
                      <p style={errStyle}>{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div
                  className="contact-form-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      {...register("phone")}
                      placeholder="+1 (000) 000-0000"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Budget range</label>
                    <select {...register("budget")} style={inputStyle}>
                      <option value="">Select budget</option>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Service needed *</label>
                  <select {...register("service")} style={inputStyle}>
                    <option value="">Select a service</option>
                    {SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} — {s.price}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p style={errStyle}>{errors.service.message}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Tell us about your project *</label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    placeholder="Describe what you need..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                  {errors.message && (
                    <p style={errStyle}>{errors.message.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    padding: "15px 32px",
                    background: "var(--color-accent)",
                    color: "#05080F",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "var(--glow-sm)",
                    fontFamily: "inherit",
                    opacity: status === "loading" ? 0.7 : 1,
                  }}
                >
                  {status === "loading" ? "Sending..." : "Send message"}
                </button>
                {status === "error" && (
                  <p style={{ color: "#FF6B6B", fontSize: 14 }}>
                    {errorMessage ?? "Something went wrong. WhatsApp us instead."}
                  </p>
                )}
              </form>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                label: "Email",
                value: "info@alphasolutions.software",
                href: "mailto:info@alphasolutions.software",
              },
              {
                label: "WhatsApp",
                value: "+92 349 4206922",
                href: "https://wa.me/923494206922",
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                style={{
                  display: "block",
                  padding: "20px 24px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    color: "var(--color-muted)",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </div>
                <div style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                  {c.value}
                </div>
              </a>
            ))}
            <div
              style={{
                padding: "20px 24px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  color: "var(--color-muted)",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                US Office
              </div>
              <div
                style={{
                  color: "var(--color-text)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                7533 S Center View Ct Ste R
                <br />
                West Jordan, UT 84084
              </div>
            </div>
          </div>
        </div>

        <section style={{ marginTop: 56 }}>
          <PaymentMethodsSection />
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>Find us on map</h2>
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3375.7696355170965!2d74.20668750000002!3d32.2104375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f29002065f25d%3A0x113f5436d1402267!2sAlpha%20Solutions%20Services%20LLC!5e0!3m2!1sen!2s!4v1776619267643!5m2!1sen!2s"
              style={{ width: "100%", minHeight: 420, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Alpha Solutions Services LLC map"
              allowFullScreen
            />
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>Service areas</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 14,
            }}
          >
            {[
              "West Jordan, Salt Lake County, Utah",
              "United States remote delivery",
              "Pakistan operations and support",
              "International projects with async collaboration",
            ].map((area) => (
              <div
                key={area}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  background: "var(--color-surface)",
                  padding: "14px 16px",
                  color: "var(--color-muted)",
                  fontSize: 14,
                }}
              >
                {area}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>Quick answers before you contact us</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              {
                q: "How quickly can you start?",
                a: "Most projects can start within 2-5 business days after scope confirmation.",
              },
              {
                q: "Do you work with local and remote clients?",
                a: "Yes. We support clients in Utah, across the US, and internationally.",
              },
              {
                q: "Can I request only one service first?",
                a: "Yes. You can begin with a single service, then expand as results come in.",
              },
            ].map((item) => (
              <details
                key={item.q}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  background: "var(--color-surface)",
                  padding: "14px 16px",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{item.q}</summary>
                <p style={{ color: "var(--color-muted)", marginTop: 8, lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
