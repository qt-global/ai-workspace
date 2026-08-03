import Image from "next/image";
import Link from "next/link";
import { PlaneIcon, CompassIcon, HeadphonesIcon, BarChart3Icon, SearchCheckIcon, FileTextIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { pathOfThread } from "@/core/threads/utils";
import { cn } from "@/lib/utils";

import { Section } from "../section";

export function CaseStudySection({ className }: { className?: string }) {
  const caseStudies = [
    {
      threadId: "7cfa5f8f-a2f8-47ad-acbd-da7137baf990",
      category: "Vé Máy Bay",
      icon: PlaneIcon,
      title: "Săn Vé Máy Bay & So Sánh Giá Tự Động",
      description:
        "SuperAgent tự động tra cứu dữ liệu hàng không từ Vietnam Airlines, Vietjet Air, Bamboo Airways, đưa ra danh sách vé tối ưu chi phí & thời gian.",
    },
    {
      threadId: "4f3e55ee-f853-43db-bfb3-7d1a411f03cb",
      category: "Du Lịch & Lịch Trình",
      icon: CompassIcon,
      title: "Lập Lịch Trình Du Lịch & Đặt Vé Trọn Gói",
      description:
        "Nghiên cứu điểm đến, gợi ý khách sạn, địa điểm ăn uống và lên kế hoạch chuyến đi 4 ngày 3 đêm kèm gợi ý chuyến bay phù hợp.",
    },
    {
      threadId: "21cfea46-34bd-4aa6-9e1f-3009452fbeb9",
      category: "Tự Động Hóa CSKH",
      icon: HeadphonesIcon,
      title: "Trợ Lý CSKH & Tư Vấn Đặt Vé 24/7",
      description:
        "Giải đáp thắc mắc quy định hành lý, chính sách hoàn hủy đổi vé, tra cứu trạng thái đơn hàng CRM/CSKH và tư vấn hành khách tức thì.",
    },
    {
      threadId: "ad76c455-5bf9-4335-8517-fc03834ab828",
      category: "Phân Tích Dữ Liệu",
      icon: BarChart3Icon,
      title: "Phân Tích Dữ Liệu Đơn Hàng CRM & CMS",
      description:
        "Khai phá dữ liệu lịch sử đặt vé, phân tích xu hướng mua sắm theo mùa, dự báo doanh thu và xuất báo cáo biểu đồ trực quan.",
    },
    {
      threadId: "d3e5adaf-084c-4dd5-9d29-94f1d6bccd98",
      category: "Deep Research",
      icon: SearchCheckIcon,
      title: "Deep Research Thị Trường Hàng Không",
      description:
        "Thu thập dữ liệu giá cước các hãng, phân tích báo cáo thị trường du lịch hàng không và tổng hợp thành slide / báo cáo web.",
    },
    {
      threadId: "3823e443-4e2b-4679-b496-a9506eae462b",
      category: "Trích Xuất Dữ Liệu",
      icon: FileTextIcon,
      title: "Chuyển Đổi Ảnh CCCD Sang Format Thực Tế",
      description:
        "Tự động đọc ảnh chụp CCCD/Hộ chiếu, trích xuất dữ liệu thô và chuẩn hóa cấu trúc JSON/Excel phục vụ nhập thông tin hành khách & đặt vé.",
    },
  ];

  return (
    <Section
      className={className}
      title="Kịch bản Sử dụng Thực tế QTGO AI"
      subtitle="Khám phá cách QTGO AI SuperAgent xử lý mượt mà các bài toán thực tế cho người dùng và doanh nghiệp"
    >
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((caseStudy) => {
          const Icon = caseStudy.icon;
          return (
            <Link
              key={caseStudy.title}
              href={pathOfThread(caseStudy.threadId) + "?mock=true"}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="relative h-72 overflow-hidden border-white/10 bg-zinc-900/60 backdrop-blur-md transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-xl group-hover:shadow-cyan-500/10">
                <Image
                  src={`/images/${caseStudy.threadId}.jpg`}
                  alt={`${caseStudy.title} preview`}
                  width={640}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                  className="absolute inset-0 z-0 h-full w-full object-cover opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:opacity-30"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

                <div className="relative z-20 flex h-full flex-col justify-between p-5">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
                      <Icon className="size-3.5" />
                      {caseStudy.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <h3 className="text-lg font-bold leading-snug text-white group-hover:text-cyan-300 transition-colors duration-200">
                      {caseStudy.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-gray-300 line-clamp-3 font-light">
                      {caseStudy.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
