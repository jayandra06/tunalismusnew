import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";
import { BatchManagementService } from "../../../../lib/batch-management-service";

export async function GET(req) {
  try {
    await connectToDB();

    // Debug: Log all headers
    console.log('🔍 API Route Headers Debug:', {
      allHeaders: Object.fromEntries(req.headers.entries()),
      userRole: req.headers.get("X-User-Role"),
      userId: req.headers.get("X-User-Id"),
      authorization: req.headers.get("authorization"),
      cookie: req.headers.get("cookie")
    });

    // Get user role from middleware headers
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
        console.log('✅ Got role from direct token:', userRole);
      }
    }
    
    if (userRole !== "admin") {
      console.log('❌ Admin access denied in API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in API route');

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const language = searchParams.get('language');
    const level = searchParams.get('level');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (language) filter.language = language;
    if (level) filter.level = level;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch courses with pagination and populate trainers and instructor
    const courses = await Course.find(filter)
      .populate('trainers', 'name email')
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    // Get batch distribution for each course
    const coursesWithBatches = await Promise.all(
      courses.map(async (course) => {
        const batchSummary = await BatchManagementService.getBatchDistributionSummary(course._id);
        return {
          ...course.toObject(),
          batchSummary: batchSummary
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithBatches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    // Debug: Log all headers
    console.log('🔍 Course Creation API Headers Debug:', {
      allHeaders: Object.fromEntries(req.headers.entries()),
      userRole: req.headers.get("X-User-Role"),
      userId: req.headers.get("X-User-Id"),
      authorization: req.headers.get("authorization"),
      cookie: req.headers.get("cookie")
    });

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
        console.log('✅ Got role from direct token:', userRole);
      }
    }
    
    if (userRole !== "admin") {
      console.log('❌ Admin access denied in course creation API:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted for course creation');

    const {
      name,
      language,
      level,
      month,
      year,
      totalCapacity,
      courseDuration,
      batchSizeLimit,
      batchTypes,
      pricing,
      offlineMaterials,
      description,
      trainers,
      instructor
    } = await req.json();

    // Validate required fields
    if (!language || !level || !month || !year || !totalCapacity || !courseDuration || !batchSizeLimit) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate batch types configuration
    if (!batchTypes || (!batchTypes.regular?.enabled && !batchTypes.revision?.enabled)) {
      return NextResponse.json(
        { message: "At least one batch type must be enabled" },
        { status: 400 }
      );
    }

    // Check if course already exists for the same language, level, month, year
    const existingCourse = await Course.findOne({
      language,
      level,
      month,
      year
    });

    if (existingCourse) {
      return NextResponse.json(
        { message: "Course already exists for this language, level, month, and year" },
        { status: 400 }
      );
    }

    // Calculate offline materials total cost
    let offlineMaterialsTotalCost = 0;
    if (offlineMaterials?.enabled && offlineMaterials.materials) {
      offlineMaterialsTotalCost = offlineMaterials.materials.reduce((sum, material) => {
        return sum + (material.totalCost || 0);
      }, 0);
    }

    // Create new course
    const course = new Course({
      name: name || null, // null means auto-generate name
      language,
      level,
      month,
      year,
      totalCapacity,
      courseDuration,
      batchSizeLimit,
      batchTypes: {
        regular: {
          enabled: batchTypes.regular?.enabled || false,
          studentCount: batchTypes.regular?.studentCount || 0
        },
        revision: {
          enabled: batchTypes.revision?.enabled || false,
          studentCount: batchTypes.revision?.studentCount || 0
        }
      },
      pricing: {
        regular: {
          basePrice: pricing?.regular?.basePrice || 0,
          offlineMaterialCost: offlineMaterials?.enabled ? offlineMaterialsTotalCost : 0,
          totalPrice: (pricing?.regular?.basePrice || 0) + (offlineMaterials?.enabled ? offlineMaterialsTotalCost : 0)
        },
        revision: {
          basePrice: pricing?.revision?.basePrice || 0,
          offlineMaterialCost: offlineMaterials?.enabled ? offlineMaterialsTotalCost : 0,
          totalPrice: (pricing?.revision?.basePrice || 0) + (offlineMaterials?.enabled ? offlineMaterialsTotalCost : 0)
        }
      },
      price: (pricing?.regular?.basePrice || 0) + (offlineMaterials?.enabled ? offlineMaterialsTotalCost : 0), // Legacy field
      offlineMaterials: {
        enabled: offlineMaterials?.enabled || false,
        materials: offlineMaterials?.materials || [],
        totalCost: offlineMaterialsTotalCost
      },
      description: description || '',
      trainers: trainers || [],
      instructor: instructor || null,
      status: 'draft'
    });

    await course.save();

    // Populate trainer information
    if (course.trainers && course.trainers.length > 0) {
      await course.populate('trainers', 'name email');
    }
    if (course.instructor) {
      await course.populate('instructor', 'name email');
    }

    return NextResponse.json({ course }, { status: 201 });

  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
