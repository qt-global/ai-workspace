"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";

import { AuroraText } from "@/components/ui/aurora-text";
import { Button } from "@/components/ui/button";

import { Section } from "../section";

export function CommunitySection() {
  return (
    <Section
      title={
        <AuroraText colors={["#00c6ff", "#0072ff", "#3b82f6"]}>
          Trải nghiệm QTGO AI Workspace
        </AuroraText>
      }
      subtitle="Sẵn sàng tự động hóa quy trình làm việc, tra cứu vé máy bay & nghiên cứu dữ liệu chuyên sâu cùng trợ lý AI."
    >
      <div className="flex justify-center mt-4">
        <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-lg shadow-xl shadow-cyan-500/25 border border-cyan-400/30 rounded-xl" asChild>
          <Link href="/workspace">
            <SparklesIcon className="size-5 mr-2" />
            Bắt đầu Sử dụng Ngay
          </Link>
        </Button>
      </div>
    </Section>
  );
}
