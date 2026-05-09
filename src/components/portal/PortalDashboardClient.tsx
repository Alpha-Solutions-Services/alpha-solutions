"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, FileText, FolderKanban, MessageSquare } from "lucide-react";
import clsx from "clsx";
import type { PortalFile, PortalProject } from "@/lib/sanity/portal-data";
import { ProjectCard } from "./ProjectCard";
import { FileLibrary } from "./FileLibrary";

const DashboardStats = dynamic(
  () => import("./DashboardStats").then((m) => m.DashboardStats),
  { ssr: false }
);
const DirectMessageThread = dynamic(
  () => import("./DirectMessageThread").then((m) => m.DirectMessageThread),
  { ssr: false }
);

const WHATSAPP_DIGITS = "923494206922";

const tabs = [
  { id: "overview" as const, label: "Overview", icon: BarChart3 },
  { id: "projects" as const, label: "Projects", icon: FolderKanban },
  { id: "files" as const, label: "Files", icon: FileText },
  { id: "messages" as const, label: "Messages", icon: MessageSquare },
];

export function PortalDashboardClient({
  projects,
  files,
}: {
  projects: PortalProject[];
  files: PortalFile[];
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>(
    "overview"
  );

  const completedProjects = useMemo(
    () => projects.filter((p) => p.status === "Completed").length,
    [projects]
  );
  const inProgressProjects = useMemo(
    () => projects.filter((p) => p.status === "In Progress").length,
    [projects]
  );

  function openWhatsApp() {
    const text = encodeURIComponent(
      "Hello Alpha Solutions team, I have a question about my project:"
    );
    window.open(`https://wa.me/${WHATSAPP_DIGITS}?text=${text}`, "_blank");
  }

  function handleUploadClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      const selected = input.files?.length ?? 0;
      if (selected > 0) {
        window.alert(
          `Selected ${selected} file(s). Client uploads are not yet wired in this Next.js build; contact your project manager or use WhatsApp to share files.`
        );
      }
    };
    input.click();
  }

  return (
    <div className="min-w-0 flex-1 p-6 md:p-8">
      <header className="mb-8">
        <h1
          className="text-2xl font-bold text-[var(--color-text)] md:text-3xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Overview, projects, files, and messages for your engagement with Alpha
          Solutions.
        </p>
      </header>

      <div
        className="mb-8 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-4"
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-8">
          <DashboardStats
            totalProjects={projects.length}
            completedProjects={completedProjects}
            inProgressProjects={inProgressProjects}
          />
          {projects.length > 0 ? (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Your projects
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.slice(0, 4).map((p) => (
                  <ProjectCard key={p.id} project={p} compact />
                ))}
              </div>
            </section>
          ) : (
            <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-8 text-center text-[var(--color-muted)]">
              No projects are linked to your account yet. If you expect to see
              work here, ask your team to connect your Supabase user ID in
              Sanity.
            </p>
          )}
        </div>
      ) : null}

      {activeTab === "projects" ? (
        <div className="space-y-6">
          {projects.length > 0 ? (
            projects.map((p) => <ProjectCard key={p.id} project={p} />)
          ) : (
            <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-8 text-center text-[var(--color-muted)]">
              No projects yet.
            </p>
          )}
        </div>
      ) : null}

      {activeTab === "files" ? (
        <FileLibrary files={files} onUploadClick={handleUploadClick} />
      ) : null}

      {activeTab === "messages" ? (
        <div className="space-y-6">
          <DirectMessageThread />
          <p className="text-center text-xs text-[var(--color-muted)]">
            Need something urgent?{" "}
            <button
              type="button"
              onClick={openWhatsApp}
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              WhatsApp the team
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}
