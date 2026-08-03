"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, type RefObject } from "react";

import { type BentoCardProps } from "@/components/ui/magic-bento";
import {
  usePrefersReducedMotion,
  useRenderActivity,
} from "@/core/dom/render-activity";
import { cn } from "@/lib/utils";

import { Section } from "../section";

import { FileTextIcon, BrainCircuitIcon, GitForkIcon, CpuIcon, SparklesIcon, ShieldCheckIcon } from "lucide-react";

const MagicBento = dynamic(() => import("@/components/ui/magic-bento"), {
  ssr: false,
});

const COLOR = "#0a0a0a";
const features: BentoCardProps[] = [
  {
    color: COLOR,
    label: "Trích xuất Thông tin",
    icon: <FileTextIcon className="size-4 text-cyan-400" />,
    image: "/images/7cfa5f8f-a2f8-47ad-acbd-da7137baf990.jpg",
    title: "OCR CCCD & Hộ chiếu Tự động",
    description: "Nhận diện & trích xuất chính xác họ tên, số CCCD/Passport, ngày sinh, quốc tịch phục vụ xuất vé máy bay & nhập liệu CRM",
  },
  {
    color: COLOR,
    label: "Bộ nhớ Thông minh",
    icon: <BrainCircuitIcon className="size-4 text-blue-400" />,
    image: "/images/ad76c455-5bf9-4335-8517-fc03834ab828.jpg",
    title: "Ghi nhớ Ngắn hạn & Dài hạn",
    description: "AI thấu hiểu bối cảnh người dùng, lịch sử tra cứu & thói quen đặt vé",
  },
  {
    color: COLOR,
    label: "Tác vụ Phức tạp",
    icon: <GitForkIcon className="size-4 text-indigo-400" />,
    image: "/images/d3e5adaf-084c-4dd5-9d29-94f1d6bccd98.jpg",
    title: "Lập kế hoạch & Subagents",
    description: "Tự động phân rã nhiệm vụ lớn, gọi subagent thực thi song song",
  },
  {
    color: COLOR,
    label: "Khả năng Mở rộng",
    icon: <CpuIcon className="size-4 text-sky-400" />,
    image: "/images/4f3e55ee-f853-43db-bfb3-7d1a411f03cb.jpg",
    title: "Skills & MCP Tools",
    description: "Tích hợp API vé máy bay, CRM/CMS, Web Search & hệ thống dữ liệu nội bộ",
  },
  {
    color: COLOR,
    label: "Đa Mô hình AI",
    icon: <SparklesIcon className="size-4 text-purple-400" />,
    image: "/images/21cfea46-34bd-4aa6-9e1f-3009452fbeb9.jpg",
    title: "Hỗ trợ Đa LLM Thế hệ mới",
    description: "Gemini 2.0 Flash / Pro, OpenAI GPT-4o, DeepSeek V3, Claude 3.5 & Vision OCR",
  },
  {
    color: COLOR,
    label: "Bảo mật & Tốc độ",
    icon: <ShieldCheckIcon className="size-4 text-emerald-400" />,
    image: "/images/3823e443-4e2b-4679-b496-a9506eae462b.jpg",
    title: "Tối ưu cho QTGO",
    description: "Bảo mật thông tin hành khách & dữ liệu doanh nghiệp, xử lý siêu tốc",
  },
];

export function WhatsNewSection({ className }: { className?: string }) {
  const bentoContainerRef = useRef<HTMLDivElement>(null);
  const renderBento = useRenderActivity(bentoContainerRef, false, false);
  const reducedMotion = usePrefersReducedMotion();
  useBentoSpotlight(bentoContainerRef, renderBento && !reducedMotion);

  return (
    <Section
      className={cn("", className)}
      title="Tính năng Nổi bật trong QTGO AI Workspace"
      subtitle="QTGO AI tiến hóa mạnh mẽ thành hệ sinh thái SuperAgent đa nhiệm cho doanh nghiệp & người dùng"
    >
      <div
        ref={bentoContainerRef}
        className="flex min-h-96 w-full items-center justify-center"
      >
        {renderBento && (
          <MagicBento
            data={features}
            disableAnimations={reducedMotion}
            enableSpotlight={false}
          />
        )}
      </div>
    </Section>
  );
}

function useBentoSpotlight(
  containerRef: RefObject<HTMLDivElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;

    let pendingPointerFrame: number | undefined;
    let pointer: { x: number; y: number } | undefined;

    const clearGlow = () => {
      container
        .querySelectorAll<HTMLElement>(".magic-bento-card")
        .forEach((card) => card.style.setProperty("--glow-intensity", "0"));
    };
    const renderPointer = () => {
      pendingPointerFrame = undefined;
      if (!pointer) return;
      const { x, y } = pointer;
      pointer = undefined;
      const radius = 300;
      const proximity = radius * 0.5;
      const fadeDistance = radius * 0.75;
      container
        .querySelectorAll<HTMLElement>(".magic-bento-card")
        .forEach((card) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance =
            Math.hypot(x - centerX, y - centerY) -
            Math.max(rect.width, rect.height) / 2;
          const effectiveDistance = Math.max(0, distance);
          const intensity =
            effectiveDistance <= proximity
              ? 1
              : effectiveDistance <= fadeDistance
                ? (fadeDistance - effectiveDistance) /
                  (fadeDistance - proximity)
                : 0;
          card.style.setProperty(
            "--glow-x",
            `${((x - rect.left) / rect.width) * 100}%`,
          );
          card.style.setProperty(
            "--glow-y",
            `${((y - rect.top) / rect.height) * 100}%`,
          );
          card.style.setProperty("--glow-intensity", intensity.toString());
          card.style.setProperty("--glow-radius", `${radius}px`);
        });
    };
    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (pendingPointerFrame !== undefined) return;
      pendingPointerFrame = requestAnimationFrame(renderPointer);
    };

    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerleave", clearGlow);
    return () => {
      if (pendingPointerFrame !== undefined) {
        cancelAnimationFrame(pendingPointerFrame);
      }
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", clearGlow);
      clearGlow();
    };
  }, [active, containerRef]);
}
