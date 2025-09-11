import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import HomepageAd from "@/models/HomepageAd";
import Course from "@/models/Course";

// GET /api/admin/homepage-ads/[id] - Get a specific ad
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const ad = await HomepageAd.findById(params.id)
      .populate('course_id', 'name language level displayName');

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ad
    });

  } catch (error) {
    console.error('Error fetching homepage ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/homepage-ads/[id] - Update a specific ad
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const body = await request.json();
    
    // Check if ad exists
    const existingAd = await HomepageAd.findById(params.id);
    if (!existingAd) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Validate course if course_id is being updated
    if (body.course_id) {
      const course = await Course.findById(body.course_id);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    // Validate ad type if provided
    if (body.ad_type) {
      const validAdTypes = ['popup', 'banner', 'toast', 'badge', 'flyer', 'floating_button'];
      if (!validAdTypes.includes(body.ad_type)) {
        return NextResponse.json(
          { error: 'Invalid ad type' },
          { status: 400 }
        );
      }
    }

    // Validate target audience if provided
    if (body.target_audience) {
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
    }

    // Validate date range if dates are provided
    if (body.start_date || body.end_date) {
      const startDate = body.start_date ? new Date(body.start_date) : existingAd.start_date;
      const endDate = body.end_date ? new Date(body.end_date) : existingAd.end_date;
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Update the ad
    const updatedAd = await HomepageAd.findByIdAndUpdate(
      params.id,
      { ...body, updated_by: session.user.id },
      { new: true, runValidators: true }
    ).populate('course_id', 'name language level displayName');

    return NextResponse.json({
      success: true,
      ad: updatedAd,
      message: 'Ad updated successfully'
    });

  } catch (error) {
    console.error('Error updating homepage ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/homepage-ads/[id] - Partially update a specific ad (for status changes, etc.)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const body = await request.json();
    
    // Check if ad exists
    const existingAd = await HomepageAd.findById(params.id);
    if (!existingAd) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['draft', 'published'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Update the ad
    const updatedAd = await HomepageAd.findByIdAndUpdate(
      params.id,
      { ...body, updated_by: session.user.id },
      { new: true, runValidators: true }
    ).populate('course_id', 'name language level displayName');

    return NextResponse.json({
      success: true,
      ad: updatedAd,
      message: 'Ad updated successfully'
    });

  } catch (error) {
    console.error('Error updating homepage ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/homepage-ads/[id] - Delete a specific ad
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    // Check if ad exists
    const ad = await HomepageAd.findById(params.id);
    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Delete the ad
    await HomepageAd.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting homepage ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad', details: error.message },
      { status: 500 }
    );
  }
}

