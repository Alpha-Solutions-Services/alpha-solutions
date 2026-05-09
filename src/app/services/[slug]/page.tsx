import { SERVICES, PILLARS } from "@/data/services";
import { SITE_URL } from "@/data/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const SERVICE_FAQS: Record<string, { q: string; a: string }[]> = {
  "custom-web-development": [
    {
      q: "How long does a custom website take?",
      a: "Most websites are delivered in 2-4 weeks depending on scope. We share a milestone timeline on day one so you always know what is next.",
    },
    {
      q: "Do you work with clients outside the US?",
      a: "Yes. We serve clients in the US, UK, Pakistan, and globally. Payments accepted in USD, PKR, EUR, and GBP.",
    },
    {
      q: "What technologies do you use?",
      a: "React.js, Next.js, Node.js, Tailwind CSS, and headless CMS platforms like Sanity.io.",
    },
    {
      q: "Can I edit the site myself after launch?",
      a: "Yes. We integrate a CMS so you can update content without touching any code.",
    },
    {
      q: "What is included in the $349 starting price?",
      a: "A fully designed, mobile-responsive website with up to 5 pages, contact form, and basic SEO setup. Additional features are scoped separately.",
    },
  ],
  "ai-chatbot": [
    {
      q: "What platforms can the chatbot be added to?",
      a: "We deploy chatbots on your website, WhatsApp, Instagram DMs, Facebook Messenger, and more.",
    },
    {
      q: "Does the chatbot handle real conversations or just FAQs?",
      a: "Both. It handles FAQs automatically and can qualify leads, book calls, and escalate complex queries to a human agent.",
    },
    {
      q: "What does $599 setup include?",
      a: "Full chatbot design, training on your business data, platform integration, and testing. The $299/mo covers hosting, maintenance, and updates.",
    },
    {
      q: "How long does setup take?",
      a: "Typically 5-10 business days from kickoff to go-live.",
    },
    {
      q: "Can it integrate with my CRM?",
      a: "Yes. We connect it to your existing CRM, email system, or Google Sheets for lead logging.",
    },
  ],
  "mobile-app-development": [
    {
      q: "Do you build iOS and Android both?",
      a: "Yes. We build cross-platform apps using React Native that run on both iOS and Android from a single codebase.",
    },
    {
      q: "What is included in the $1,499 starting price?",
      a: "A core mobile app with up to 5 screens, user authentication, and basic backend. Complex features are quoted separately.",
    },
    {
      q: "How long does a mobile app take to build?",
      a: "Simple apps take 4-6 weeks. Feature-rich apps with backend integrations typically take 8-12 weeks.",
    },
    {
      q: "Will you submit the app to the App Store and Google Play?",
      a: "Yes. We handle the full submission process for both stores.",
    },
    {
      q: "Do you provide support after launch?",
      a: "Yes. We offer optional monthly maintenance and update packages post-launch.",
    },
  ],
  "llc-registration": [
    {
      q: "Can you register an LLC for a non-US resident?",
      a: "Yes. We specialize in helping international founders - especially from Pakistan, UAE, and the UK - register US LLCs without visiting the US.",
    },
    {
      q: "What state do you register in?",
      a: "We register in Wyoming by default (lowest fees, most privacy-friendly). Utah or Delaware available on request.",
    },
    {
      q: "What is included in the $299 flat fee?",
      a: "LLC name check, Articles of Organization filing, registered agent (1 year), EIN application, and digital document delivery.",
    },
    {
      q: "How long does registration take?",
      a: "Typically 5-10 business days for standard filing. Expedited options are available.",
    },
    {
      q: "Do I need a US address or bank account?",
      a: "No US address needed - we provide a registered agent address. We also guide you on opening a US business bank account remotely.",
    },
  ],
};

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = SERVICES.find((s) => s.slug === params.slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} | Alpha Solutions Services LLC`,
    description: `Professional ${service.name.toLowerCase()} starting ${service.price}. Alpha Solutions Services LLC — West Jordan, Utah. Get a free quote today.`,
    alternates: { canonical: `/services/${service.slug}` },
    keywords: [
      service.name,
      `${service.name} services`,
      "Alpha Solutions Services LLC",
      "West Jordan Utah software company",
      "web development and AI automation",
    ],
    openGraph: {
      title: `${service.name} | Alpha Solutions`,
      description: `${service.name} starting ${service.price}`,
      images: [{ url: "/og/services.png", width: 1200, height: 630 }],
    },
  };
}

export default function ServicePage({
  params,
}: {
  params: { slug: string };
}) {
  const service = SERVICES.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const pillar = PILLARS[service.pillar];
  const pillarHref =
    service.pillar === 5 ? "/freight" : `/services/${pillar.slug}`;
  const related = SERVICES.filter(
    (s) => s.pillar === service.pillar && s.slug !== service.slug
  ).slice(0, 3);
  const relatedProjects = [
    {
      client: "Redmon Resources LLC",
      category: "Web Development",
      summary:
        "AI-driven website with SEO-focused rendering, conversion pathways, and custom integrations.",
      href: "https://redmonresourcesllc.com/",
      pillars: [1, 4],
    },
    {
      client: "Giftify Store",
      category: "E-commerce",
      summary:
        "Storefront architecture with high-conversion product flows and streamlined purchasing.",
      href: "https://giftifystore.com.pk/",
      pillars: [1, 3],
    },
    {
      client: "AH Logistics",
      category: "Operations Platform",
      summary:
        "Dispatch and operations workflows for better day-to-day visibility and execution.",
      href: "/projects",
      pillars: [3, 5],
    },
  ].filter((p) => p.pillars.includes(service.pillar));
  const faqs = SERVICE_FAQS[service.slug] ?? [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: `Professional ${service.name} services`,
    provider: {
      "@type": "Organization",
      name: "Alpha Solutions Services LLC",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: service.price.replace(/[^0-9]/g, "") || "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main
        style={{
          paddingTop: 100,
          minHeight: "100vh",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
          <p style={{ color: "var(--color-muted)", fontSize: 13 }}>
            <Link href="/" style={{ color: "var(--color-muted)" }}>
              Home
            </Link>
            {" / "}
            <Link href="/services" style={{ color: "var(--color-muted)" }}>
              Services
            </Link>
            {" / "}
            <Link href={pillarHref} style={{ color: "var(--color-muted)" }}>
              {pillar.name}
            </Link>
            {" / "}
            <span style={{ color: "var(--color-accent)" }}>{service.name}</span>
          </p>
        </div>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 20,
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
              fontSize: 12,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            {pillar.name}
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem,5vw,3.2rem)",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            {service.name}
          </h1>
          <div
            style={{
              display: "inline-block",
              padding: "8px 20px",
              borderRadius: 8,
              background: "var(--color-accent-dim)",
              color: "var(--color-accent-2)",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 24,
              border: "1px solid var(--color-border-glow)",
            }}
          >
            {service.price}
          </div>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: 18,
              maxWidth: 600,
              marginBottom: 40,
            }}
          >
            Professional {service.name.toLowerCase()} tailored for growing
            businesses. Delivered by a US-registered company with a dedicated
            development team.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link
              href={`/contact?service=${service.slug}`}
              style={{
                padding: "14px 28px",
                background: "var(--color-accent)",
                color: "#05080F",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Get a free quote
            </Link>
            <a
              href="https://wa.me/923494206922"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "14px 28px",
                border: "1px solid var(--color-border-glow)",
                color: "var(--color-accent)",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              WhatsApp us
            </a>
          </div>
        </section>

        {related.length > 0 && (
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
            <h2 style={{ fontSize: 22, marginBottom: 32 }}>Related services</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                gap: 16,
              }}
            >
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  style={{
                    display: "block",
                    padding: "20px 24px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    textDecoration: "none",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--color-text)",
                      marginBottom: 6,
                    }}
                  >
                    {r.name}
                  </div>
                  <div style={{ color: "var(--color-accent)", fontSize: 13 }}>
                    {r.price}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 24px 60px" }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>Relevant project examples</h2>
            <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
              Proof from similar work in this field so you can evaluate delivery quality
              before starting.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                gap: 16,
              }}
            >
              {relatedProjects.map((project) => (
                <article
                  key={project.client}
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    borderRadius: 12,
                    padding: "20px 18px",
                  }}
                >
                  <div
                    style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}
                  >
                    {project.client}
                  </div>
                  <div style={{ color: "var(--color-accent)", fontSize: 12, marginBottom: 10 }}>
                    {project.category}
                  </div>
                  <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 16 }}>
                    {project.summary}
                  </p>
                  <Link
                    href={project.href}
                    target={project.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      project.href.startsWith("http") ? "noopener noreferrer" : undefined
                    }
                    style={{
                      color: "var(--color-accent)",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                  >
                    {project.href.startsWith("http") ? "Visit project site" : "See project list"} →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
          <h2 style={{ fontSize: 22, marginBottom: 18 }}>Why clients choose us for this service</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 14,
            }}
          >
            {[
              "Clear scope and milestone plan before build starts",
              "Direct communication with implementation team",
              "Business-focused delivery, not only technical output",
              "Post-launch support and optimization options",
            ].map((point) => (
              <div
                key={point}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  background: "var(--color-surface)",
                  color: "var(--color-muted)",
                  fontSize: 14,
                }}
              >
                {point}
              </div>
            ))}
          </div>
        </section>

        {faqs.length > 0 ? (
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>
              Frequently asked questions about {service.name}
            </h2>
            <p style={{ color: "var(--color-muted)", marginBottom: 16 }}>
              SEO-friendly service details for timeline, scope, technologies, and
              international delivery expectations.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {faqs.map((item) => (
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
        ) : null}

        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "60px 24px 100px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>
            Ready to get started with {service.name}?
          </h2>
          <p style={{ color: "var(--color-muted)", marginBottom: 32 }}>
            US-registered company · West Jordan, Utah · Fast delivery · Real
            support
          </p>
          <Link
            href={`/contact?service=${service.slug}`}
            style={{
              padding: "16px 36px",
              background: "var(--color-accent)",
              color: "#05080F",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: "var(--glow-sm)",
            }}
          >
            Start your project
          </Link>
        </section>
      </main>
    </>
  );
}
