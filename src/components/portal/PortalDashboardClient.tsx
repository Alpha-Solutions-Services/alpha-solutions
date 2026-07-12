"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");

  useEffect(() => {
    if (
      tabParam === "projects" ||
      tabParam === "files" ||
      tabParam === "messages" ||
      tabParam === "overview"
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
          `Selected ${selected} file(s). Please email files to info@alphasolutions.software or share via WhatsApp until portal uploads are enabled.`
        );
      }
    };
    input.click();
  }

  return (
    <div className={"min-w-0 flex-1 px-4 py-6 supports-[padding:max(0px)]:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 md:p-8"}>
      <header className={"mb-8"}>
        <h1
          className={"text-2xl font-bold text-[var(--color-text)] md:text-3xl"}
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Client dashboard
        </h1>
        <p className={"mt-1 text-sm text-[var(--color-muted)]"}>
          Track projects, files, and messages with Alpha Solutions. Support:{" "}
          <a
            href={"mailto:info@alphasolutions.software"}
            className={"text-[var(--color-accent)] hover:underline"}
          >
            info@alphasolutions.software
          </a>
        </p>
      </header>

      <div
        className={"mb-8 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-4"}
        role={"tablist"}
        aria-label={"Dashboard sections"}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type={"button"}
            role={"tab"}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            )}
          >
            <tab.icon className={"h-4 w-4 shrink-0"} aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className={"space-y-8"}>
          <DashboardStats
            totalProjects={projects.length}
            completedProjects={completedProjects}
            inProgressProjects={inProgressProjects}
          />
          {projects.length > 0 ? (
            <section>
              <h2 className={"mb-4 text-lg font-semibold text-[var(--color-text)]"}>
                Your projects
              </h2>
              <div className={"grid gap-4 md:grid-cols-2"}>
                {projects.slice(0, 4).map((p) => (
                  <ProjectCard key={p.id} project={p} compact />
                ))}
              </div>
            </section>
          ) : (
            <div className={"rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30 px-6 py-10 text-center"}>
              <p className={"text-sm font-medium text-[var(--color-text)]"}>
                Your projects will appear here
              </p>
              <p className={"mt-2 text-sm text-[var(--color-muted)]"}>
                Once Alpha assigns your engagement, you will see status, files, and messages here.
              </p>
              <button
                type={"button"}
                onClick={openWhatsApp}
                className={"mt-5 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#05080f]"}
              >
                Message us on WhatsApp
              </button>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "projects" ? (
        <div className={"space-y-6"}>
          {projects.length > 0 ? (
            projects.map((p) => <ProjectCard key={p.id} project={p} />)
          ) : (
            <p className={"rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-8 text-center text-[var(--color-muted)]"}>
              No projects yet. Email{" "}
              <a href={"mailto:info@alphasolutions.software"} className={"text-[var(--color-accent)]"}>
                info@alphasolutions.software
              </a>
              .
            </p>
          )}
        </div>
      ) : null}

      {activeTab === "files" ? (
        <FileLibrary files={files} onUploadClick={handleUploadClick} />
      ) : null}

      {activeTab === "messages" ? (
        <div className={"space-y-6"}>
          <DirectMessageThread />
          <p className={"text-center text-xs text-[var(--color-muted)]"}>
            Need something urgent?{" "}
            <button
              type={"button"}
              onClick={openWhatsApp}
              className={"font-semibold text-[var(--color-accent)] hover:underline"}
            >
              WhatsApp the team
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}
