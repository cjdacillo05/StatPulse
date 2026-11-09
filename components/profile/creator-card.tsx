"use client";

import Image from "next/image";
import { useState } from "react";

const PHOTO_SRC = "/images/carl-dacillo.jpg";

export function CreatorCard() {
  const [photoMissing, setPhotoMissing] = useState(false);

  return (
    <section
      aria-label="About the creator"
      className="flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left"
    >
      <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full border-4 border-card shadow-md ring-2 ring-primary/40">
        {photoMissing ? (
          <div className="sp-gradient flex h-full w-full items-center justify-center text-4xl font-extrabold">
            CD
          </div>
        ) : (
          <Image
            src={PHOTO_SRC}
            alt="Portrait of Carl Joseph E. Dacillo"
            fill
            sizes="144px"
            className="object-cover"
            priority
            onError={() => setPhotoMissing(true)}
          />
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Meet the creator</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-card-foreground">Carl Joseph E. Dacillo</h2>
        <p className="mt-1 text-sm font-semibold text-primary">BSIT-3B</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Made StatPulse, a student-built home for learning statistics, one lesson at a time.
        </p>
      </div>
    </section>
  );
}
