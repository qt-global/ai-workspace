"use client";

import Image from "next/image";
import { FileTextIcon, BrainCircuitIcon, GitForkIcon, CpuIcon, SparklesIcon, ShieldCheckIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Section } from "../section";

export function WhatsNewSection({ className }: { className?: string }) {
  const features = [
    {
      label: "Trích xuất Thông tin",
      icon: FileTextIcon,
      accentColor: "text-cyan-400 border-cyan-500/30 bg-cyan-950/60",
      image: "/images/7cfa5f8f-a2f8-47ad-acbd-da7137baf990.jpg",
      title: "OCR CCCD & Hộ chiếu Tự động",
      description: "Nhận diện & trích xuất chính xác họ tên, số CCCD/Passport, ngày sinh, quốc tịch phục vụ xuất vé máy bay & nhập liệu CRM",
    },
    {
      label: "Bộ nhớ Thông minh",
      icon: BrainCircuitIcon,
      accentColor: "text-blue-400 border-blue-500/30 bg-blue-950/60",
      image: "/images/ad76c455-5bf9-4335-8517-fc03834ab828.jpg",
      title: "Ghi nhớ Ngắn hạn & Dài hạn",
      description: "AI thấu hiểu bối cảnh người dùng, lịch sử tra cứu & thói quen đặt vé để đưa ra gợi ý siêu cá nhân hóa",
    },
    {
      label: "Tác vụ Phức tạp",
      icon: GitForkIcon,
      accentColor: "text-indigo-400 border-indigo-500/30 bg-indigo-950/60",
      image: "/images/d3e5adaf-084c-4dd5-9d29-94f1d6bccd98.jpg",
      title: "Lập kế hoạch & Subagents",
      description: "Tự động phân rã nhiệm vụ lớn thành các công việc nhỏ, gọi subagent thực thi song song nhanh chóng",
    },
    {
      label: "Khả năng Mở rộng",
      icon: CpuIcon,
      accentColor: "text-sky-400 border-sky-500/30 bg-sky-950/60",
      image: "/images/4f3e55ee-f853-43db-bfb3-7d1a411f03cb.jpg",
      title: "Skills & MCP Tools",
      description: "Tích hợp API vé máy bay, hệ thống CRM/CMS, Web Search & hệ thống dữ liệu doanh nghiệp nội bộ",
    },
    {
      label: "Đa Mô hình AI",
      icon: SparklesIcon,
      accentColor: "text-purple-400 border-purple-500/30 bg-purple-950/60",
      image: "/images/21cfea46-34bd-4aa6-9e1f-3009452fbeb9.jpg",
      title: "Hỗ trợ Đa LLM Thế hệ mới",
      description: "Gemini 2.0 Flash / Pro, OpenAI GPT-4o, DeepSeek V3, Claude 3.5 & Vision OCR kết hợp thông minh",
    },
    {
      label: "Bảo mật & Tốc độ",
      icon: ShieldCheckIcon,
      accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-950/60",
      image: "/images/3823e443-4e2b-4679-b496-a9506eae462b.jpg",
      title: "Tối ưu cho QTGO",
      description: "Bảo mật thông tin hành khách & dữ liệu doanh nghiệp trong môi trường riêng biệt, tốc độ xử lý siêu tốc",
    },
  ];

  return (
    <Section
      className={cn("", className)}
      title="Tính năng Nổi bật trong QTGO AI Workspace"
      subtitle="QTGO AI tiến hóa mạnh mẽ thành hệ sinh thái SuperAgent đa nhiệm cho doanh nghiệp & người dùng"
    >
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card
              key={idx}
              className="group relative h-68 overflow-hidden border-white/10 bg-zinc-900/60 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between p-6"
            >
              {/* Background Image with Dark Overlay */}
              <Image
                src={feature.image}
                alt=""
                fill
                className="object-cover opacity-20 transition-all duration-500 group-hover:scale-105 group-hover:opacity-30 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/40 z-10" />

              {/* Header Badge */}
              <div className="relative z-20 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border",
                    feature.accentColor,
                  )}
                >
                  <Icon className="size-3.5" />
                  {feature.label}
                </span>
              </div>

              {/* Content Title & Description */}
              <div className="relative z-20 flex flex-col gap-2 mt-auto">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-300 font-light line-clamp-3">
                  {feature.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
