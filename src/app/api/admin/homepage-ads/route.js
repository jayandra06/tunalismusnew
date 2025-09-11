import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import HomepageAd from "@/models/HomepageAd";
import Course from "@/models/Course";

// GET /api/admin/homepage-ads - Get all ads with optional filtering
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Build query based on filter
    let query = {};
    const now = new Date();

    switch (filter) {
      case 'active':
        query = {
          status: 'published',
          start_date: { $lte: now },
          end_date: { $gte: now }
        };
        break;
      case 'draft':
        query = { status: 'draft' };
        break;
      case 'published':
        query = { status: 'published' };
        break;
      case 'expired':
        query = {
          status: 'published',
          end_date: { $lt: now }
        };
        break;
      case 'scheduled':
        query = {
          status: 'published',
          start_date: { $gt: now }
        };
        break;
      // 'all' case - no additional query filters
    }

    const ads = await HomepageAd.find(query)
      .populate('course_id', 'name language level displayName')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HomepageAd.countDocuments(query);

    return NextResponse.json({
      success: true,
      ads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching homepage ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/homepage-ads - Create a new ad
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['course_id', 'ad_type', 'special_note', 'frequency', 'target_audience', 'start_date', 'end_date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate course exists
    const course = await Course.findById(body.course_id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Validate ad type
    const validAdTypes = ['popup', 'banner', 'toast', 'badge', 'flyer', 'floating_button'];
    if (!validAdTypes.includes(body.ad_type)) {
      return NextResponse.json(
        { error: 'Invalid ad type' },
        { status: 400 }
      );
    }

    // Validate target audience
    const validTargetAudiences = ['all', 'guest', 'logged_in', 'role_based'];
    if (!validTargetAudiences.includes(body.target_audience)) {
      return NextResponse.json(
        { error: 'Invalid target audience' },
        { status: 400 }
      );
    }

    // If role_based, ensure target_roles is provided
    if (body.target_audience === 'role_based' && (!body.target_roles || body.target_roles.length === 0)) {
      return NextResponse.json(
        { error: 'Target roles required when target audience is role_based' },
        { status: 400 }
      );
    }

    // Validate date range
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create the ad
    const ad = new HomepageAd({
      ...body,
      created_by: session.user.id
    });

    await ad.save();
    await ad.populate('course_id', 'name language level displayName');

    return NextResponse.json({
      success: true,
      ad,
      message: 'Ad created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating homepage ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad', details: error.message },
      { status: 500 }
    );
  }
}

