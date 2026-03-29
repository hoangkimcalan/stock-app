/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import FinancialRatios from '@/models/FinancialRatios';

export async function GET(req: Request, context: { params: any }) {
  await connectDB();
  const { code } = await context.params;

  const data = await FinancialRatios.findOne({
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
