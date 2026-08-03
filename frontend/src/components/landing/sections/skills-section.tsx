"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

import { useRenderActivity } from "@/core/dom/render-activity";
import { cn } from "@/lib/utils";

import { Section } from "../section";

const ProgressiveSkillsAnimation = dynamic(
  () => import("../progressive-skills-animation"),
  { ssr: false },
);

export function SkillsSection({ className }: { className?: string }) {
  const animationRef = useRef<HTMLDivElement>(null);
  const renderAnimation = useRenderActivity(animationRef, false);

  return (
    <Section
      className={cn("h-[calc(100vh-64px)] w-full bg-white/2", className)}
      title="Kỹ năng & Tích hợp (Skills & Tools)"
      subtitle={
        <div>
          QTGO AI SuperAgent tự động kích hoạt các kỹ năng chuyên biệt khi cần thiết.
          <br />
          Mở rộng khả năng với các kỹ năng Tra cứu Vé máy bay, Kết nối CRM/CMS, Web Search & Phân tích Dữ liệu.
        </div>
      }
    >
      <div ref={animationRef} className="relative min-h-96 overflow-hidden">
        {renderAnimation && <ProgressiveSkillsAnimation />}
      </div>
    </Section>
  );
}
