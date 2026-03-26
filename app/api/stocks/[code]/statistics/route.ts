/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import Statistics from '@/models/Statistics';

export async function GET(req: Request, context: { params: any }) {
  await connectDB();
  const { code } = await context.params;

  const data = await Statistics.findOne({
    code: code.toUpperCase(),
  }).lean();

  if (!data) {
    return Response.json({ error: 'Statistics not found' }, { status: 404 });
  }

  return Response.json(data);
}
