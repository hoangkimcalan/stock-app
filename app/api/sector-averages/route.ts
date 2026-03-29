import { connectDB } from '@/lib/mongodb';
import SectorAverageRatios from '@/models/SectorAverageRatios';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sectorName = searchParams.get('sector');

    if (!sectorName) {
      return Response.json(
        { error: 'Sector name is required' },
        { status: 400 }
      );
    }

    const data = await SectorAverageRatios.findOne({
      sectorName: decodeURIComponent(sectorName),
    }).lean();

    if (!data) {
      return Response.json(
        { ratios: [] },
        { status: 200 }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
