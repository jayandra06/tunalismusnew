import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import HomepageAd from "@/models/HomepageAd";

// POST /api/homepage-ads/[id]/track - Track specific ad interactions
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { action } = body; // action: 'impression', 'click', 'close'

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    const validActions = ['impression', 'click', 'close'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: impression, click, close' },
        { status: 400 }
      );
    }

    await connectToDB();

    const ad = await HomepageAd.findById(params.id);
    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Increment the appropriate counter
    switch (action) {
      case 'impression':
        await ad.incrementImpressions();
        break;
      case 'click':
        await ad.incrementClicks();
        break;
      case 'close':
        await ad.incrementCloses();
        break;
    }

    return NextResponse.json({
      success: true,
      message: `${action} tracked successfully`,
      ad: {
        id: ad._id,
        impressions: ad.impressions,
        clicks: ad.clicks,
        closes: ad.closes
      }
    });

  } catch (error) {
    console.error('Error tracking ad interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction', details: error.message },
      { status: 500 }
    );
  }
}

