import { connectDB } from '@/lib/mongodb';
import {
  calculateAndSaveAllSectorAverages,
  calculateYearlyRatios,
  saveFinancialRatios,
} from '@/services/finance.service';
import { NextResponse } from 'next/server';

const STOCKS = [
  'VIC',
  'VHM',
  'VNM',
  'HPG',
  'MSN',
  'VJC',
  'NVL',
  'KDH',
  'DXG',
  'PDR',
  'BCM',
  'HSG',
  'NKG',
  'GAS',
  'PLX',
  'MWG',
  'FPT',
  'SAB',
  'DGW',
  'GMD',
  'AST',
  'BTT',
  'CMV',
  'COM',
  'DGW',
  'FRT',
  'MWG',
  'PET',
  'PIT',
  'SBV',
  'SVT',
  'AGG',
  'BCM',
  'CCL',
  'CKG',
  'CRE',
  'CRV',
  'D2D',
  'DIG',
  'DRH',
  'DTA',
  'DXG',
  'DXS',
  'FDC',
  'FIR',
  'HAR',
  'HDC',
  'HDG',
  'HPX',
  'HQC',
  'HTN',
  'IJC',
  'ITC',
  'KBC',
  'KDH',
  'KHG',
  'KOS',
  'LDG',
  'LGL',
  'LHG',
  'NBB',
  'NLG',
  'NTC',
  'NTL',
  'NVL',
  'NVT',
  'PDR',
  'PTL',
  'QCG',
  'SCR',
  'SGR',
  'SIP',
  'SJS',
  'SZC',
  'SZL',
  'TAL',
  'TCH',
  'TDC',
  'TDH',
  'TEG',
  'TIP',
  'TIX',
  'TN1',
  'VHM',
  'VIC',
  'VPH',
  'VPI',
  'VRC',
  'VRE',
  'DTL',
  'HMC',
  'HPG',
  'HSG',
  'NKG',
  'SHA',
  'SHI',
  'SMC',
  'TLH',
  'TNI',
  'VCA',
  'CMG',
  'FPT',
  'ICT',
  'ITD',
  'SGT',
  'ASG',
  'CLL',
  'DVP',
  'GMD',
  'GSP',
  'HAH',
  'HTV',
  'ILB',
  'MHC',
  'NCT',
  'PDN',
  'PDV',
  'PJT',
  'PVP',
  'PVT',
  'QNP',
  'SFI',
  'SGN',
  'STG',
  'TCL',
  'TMS',
  'VIP',
  'VNL',
  'VOS',
  'VSC',
  'VTO',
  'VTP',
  'ACC',
  'ADP',
  'BCE',
  'BMP',
  'C32',
  'C47',
  'CCC',
  'CDC',
  'CIG',
  'CII',
  'CRC',
  'CTD',
  'CTI',
  'CTR',
  'CVT',
  'DC4',
  'DHA',
  'DLG',
  'DPG',
  'DXV',
  'EVG',
  'FCM',
  'FCN',
  'GEL',
  'GMH',
  'HAS',
  'HHV',
  'HID',
  'HT1',
  'HTI',
  'HU1',
  'HUB',
  'HVH',
  'KSB',
  'LBM',
  'LCG',
  'LGC',
  'LM8',
  'MDG',
  'NAV',
  'NHA',
  'NNC',
  'PC1',
  'PHC',
  'PTC',
  'RYG',
  'SC5',
  'TCD',
  'TCR',
  'THG',
  'TLD',
  'TNT',
  'TSA',
  'VCG',
  'VGC',
  'VNE',
  'VSI',
];

export async function GET() {
  await connectDB();

  const results = [];
  const currentYear = new Date().getFullYear();
  let processed = 0;
  let failed = 0;

  for (const code of STOCKS) {
    try {
      const allRatios = [];

      // Tính 7 năm gần nhất
      for (let year = currentYear - 8; year <= currentYear; year++) {
        const ratios = await calculateYearlyRatios(code, year);
        if (Object.keys(ratios).length > 1) {
          // Check if có tính được chỉ số
          allRatios.push(ratios);
        }
      }

      // Lưu vào DB
      if (allRatios.length > 0) {
        const saved = await saveFinancialRatios(code, allRatios);
        if (saved) {
          results.push({
            code,
            status: 'ok',
            message: `Calculated ${allRatios.length} yearly ratios`,
          });
          processed++;
        } else {
          results.push({
            code,
            status: 'error',
            message: 'Failed to save ratios',
          });
          failed++;
        }
      } else {
        results.push({
          code,
          status: 'warning',
          message: 'No ratios calculated (missing data)',
        });
        failed++;
      }
    } catch (err) {
      results.push({
        code,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      failed++;
    }
  }

  // Tính sector averages sau khi xong tất cả
  try {
    console.log('Calculating sector averages...');
    await calculateAndSaveAllSectorAverages();
    results.push({
      code: 'SECTOR_AVERAGES',
      status: 'ok',
      message: 'All sector averages calculated',
    });
  } catch (err) {
    results.push({
      code: 'SECTOR_AVERAGES',
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }

  return NextResponse.json({
    success: true,
    summary: {
      total: STOCKS.length,
      processed,
      failed,
      totalStocks: [...new Set(STOCKS)].length, // Loại bỏ duplicates
    },
    results,
  });
}
