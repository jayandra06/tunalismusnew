import { NextResponse } from "next/server";
import Material from "../../../../models/Material";
import Batch from "../../../../models/Batch";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only students can access this route
    if (!authorize("student", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches the student is in
    const studentBatches = await Batch.find({ students: userId });

    // Get the unique course IDs from these batches
    const courseIds = [...new Set(studentBatches.map(batch => batch.course))];

    // Find all materials for these courses
    const materials = await Material.find({ 
      course: { $in: courseIds } 
    }).populate('course', 'title');

    // For now, return mock data since we don't have all materials set up
    // In a real implementation, you would return the actual materials
    const mockMaterials = [
      {
        _id: '1',
        title: 'React Components Guide',
        type: 'pdf',
        course: 'React Fundamentals',
        courseId: courseIds[0] || 'course1',
        fileUrl: '/materials/react-components.pdf',
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        size: '2.5 MB',
        description: 'Comprehensive guide to React components and their lifecycle methods'
      },
      {
        _id: '2',
        title: 'JavaScript Async Programming Video',
        type: 'video',
        course: 'JavaScript Advanced',
        courseId: courseIds[1] || 'course2',
        fileUrl: 'https://youtube.com/watch?v=example',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        size: '45 min',
        description: 'Video tutorial covering promises, async/await, and error handling'
      },
      {
        _id: '3',
        title: 'Project Requirements Document',
        type: 'doc',
        course: 'React Fundamentals',
        courseId: courseIds[0] || 'course1',
        fileUrl: '/materials/project-requirements.docx',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        size: '1.2 MB',
        description: 'Detailed requirements for the final project'
      },
      {
        _id: '4',
        title: 'Useful Resources and Links',
        type: 'link',
        course: 'JavaScript Advanced',
        courseId: courseIds[1] || 'course2',
        fileUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        size: 'External',
        description: 'Collection of useful JavaScript resources and documentation'
      }
    ];

    return NextResponse.json({ materials: mockMaterials }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/student/materials:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
