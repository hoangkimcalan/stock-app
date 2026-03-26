/* eslint-disable @typescript-eslint/no-explicit-any */
// api/stocks/[code]/route.ts

import { connectDB } from "@/lib/mongodb";
import FinanceStatement from "@/models/FinanceStatement";
import { buildTree } from "@/utils/buildTree";

export async function GET(req: Request, context: { params: any }) {
  await connectDB();
  const { code } = await context.params;

  const data = await FinanceStatement.findOne({
    code: code.toUpperCase(),
  }).lean(); // <--- THÊM .lean() VÀO ĐÂY để lấy object JS thuần

  if (!data) return Response.json({ error: "Not found" });

  // Đảm bảo data.items tồn tại trước khi build
  const tree = buildTree(data.items || []);

  return Response.json({
    code: data.code,
    name: data.name,
    tree,
    rawItems: data.items // Trả thêm bản phẳng để Frontend lấy Header dễ hơn
  });
}
