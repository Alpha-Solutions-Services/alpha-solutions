"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  videoId: string;
  title: string;
  className?: string;
}

export default function YouTubeEmbed({
  videoId,
  title,
  className = "",
}: Props) {
  const [clicked, setClicked] = useState(false);
  const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: thumb,
    uploadDate: "2024-01-01",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 12,
          overflow: "hidden",
          cursor: "pointer",
          background: "#0B1120",
          border: "1px solid rgba(56,163,255,0.15)",
        }}
        onClick={() => setClicked(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setClicked(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Play video: ${title}`}
      >
        {!clicked ? (
          <>
            <Image
              src={thumb}
              alt={title}
              fill
              sizes="(max-width:768px) 100vw, 800px"
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5,8,15,0.35)",
                transition: "background 0.2s",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(56,163,255,0.88)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(56,163,255,0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderLeft: "18px solid white",
                  marginLeft: 4,
                }}
              />
            </div>
          </>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        )}
      </div>
    </>
  );
}
