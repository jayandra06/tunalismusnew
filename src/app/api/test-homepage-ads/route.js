import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import HomepageAd from "@/models/HomepageAd";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectToDB();
    
    // Find a course to use for the test ad
    const course = await Course.findOne();
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'No courses found. Please create a course first.'
      });
    }

    // Check if test ads already exist
    const existingTestAds = await HomepageAd.find({
      special_note: { $regex: /test|Test|TEST/ }
    });

    if (existingTestAds.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Test ads already exist',
        ads: existingTestAds,
        course: {
          id: course._id,
          name: course.name || course.displayName
        }
      });
    }

    // Create a test popup ad
    const popupAd = new HomepageAd({
      course_id: course._id,
      ad_type: 'popup',
      special_note: '🎉 Test Ad: Welcome to Tunalismus! Start your language learning journey today.',
      media_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      cta_text: 'Explore Courses',
      cta_link: '/courses',
      timer: 10,
      closable: true,
      frequency: 'per_session',
      target_audience: 'all',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'published',
      position: 'center',
      priority: 5,
      background_color: '#ffffff',
      text_color: '#000000',
      border_radius: 12,
      animation_type: 'fade_in',
      animation_duration: 500
    });

    await popupAd.save();

    // Create a test banner ad
    const bannerAd = new HomepageAd({
      course_id: course._id,
      ad_type: 'banner',
      special_note: '🔥 Test Banner: New German A1 Course Starting Soon! Limited seats available.',
      cta_text: 'Enroll Now',
      cta_link: '/courses/enroll',
      closable: true,
      frequency: 'per_day',
      target_audience: 'logged_in',
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'published',
      position: 'top',
      priority: 8,
      background_color: '#dc2626',
      text_color: '#ffffff',
      border_radius: 0,
      animation_type: 'slide_in',
      animation_duration: 300
    });

    await bannerAd.save();

    // Test the static method
    const activeAds = await HomepageAd.getActiveAdsForUser(null);

    return NextResponse.json({
      success: true,
      message: 'Test ads created successfully!',
      ads: [popupAd, bannerAd],
      activeAdsCount: activeAds.length,
      course: {
        id: course._id,
        name: course.name || course.displayName
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectToDB();
    
    // Delete all test ads
    const result = await HomepageAd.deleteMany({
      special_note: { $regex: /test|Test|TEST/ }
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} test ads deleted`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete test ads failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
