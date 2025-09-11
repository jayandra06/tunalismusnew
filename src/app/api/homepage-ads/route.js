import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import HomepageAd from "@/models/HomepageAd";
import Course from "@/models/Course";

// GET /api/homepage-ads - Get active ads for current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    await connectToDB();

    // Get active ads based on targeting rules
    const ads = await HomepageAd.getActiveAdsForUser(session?.user || null);

    // Apply frequency filtering based on localStorage (this would be handled on frontend)
    // For now, we return all active ads and let the frontend handle frequency logic

    return NextResponse.json({
      success: true,
      ads,
      user: session?.user || null
    });

  } catch (error) {
    console.error('Error fetching active homepage ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/homepage-ads/[id]/track - Track ad interactions (impressions, clicks, closes)
export async function POST(request) {
  try {
    const body = await request.json();
    const { adId, action } = body; // action: 'impression', 'click', 'close'

    if (!adId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: adId and action' },
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

    const ad = await HomepageAd.findById(adId);
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
      message: `${action} tracked successfully`
    });

  } catch (error) {
    console.error('Error tracking ad interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction', details: error.message },
      { status: 500 }
    );
  }
}

