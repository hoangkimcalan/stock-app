/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import IncomeStatement from '@/models/IncomeStatement';

export async function GET(req: Request, context: { params: any }) {
  await connectDB();
  const { code } = await context.params;

  const data = await IncomeStatement.findOne({
    code: code.toUpperCase(),
  }).lean();

  if (!data) {
    return Response.json(
      { error: 'Income Statement not found' },
      { status: 404 }
    );
  }

  return Response.json(data);
}
