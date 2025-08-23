import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    id: "home-20250823",
    isOpen: true,
    bgType: "color",
    bgValue: "#F9E8EE",
    text: "오프라인 픽업 오픈! 지금 주문하면 오늘 수령 🎉",
    href: "/event/pickup",
  });
}
