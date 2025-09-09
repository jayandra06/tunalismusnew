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

    // Only trainers can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches assigned to this trainer
    const trainerBatches = await Batch.find({ trainer: userId });

    // Get the unique course IDs from these batches
    const courseIds = [...new Set(trainerBatches.map(batch => batch.course))];

    // Find all materials for these courses/batches
    const materials = await Material.find({ 
      $or: [
        { course: { $in: courseIds } },
        { batch: { $in: trainerBatches.map(b => b._id) } }
      ]
    }).populate('course', 'title').populate('batch', 'name');

    // Return materials with additional mock data for demonstration
    // In a real implementation, you would return the actual materials
    const mockMaterials = [
      {
        _id: '1',
        title: 'React Components Guide',
        description: 'Comprehensive guide to React components and their lifecycle methods',
        type: 'pdf',
        fileUrl: '/materials/react-components.pdf',
        batch: {
          _id: trainerBatches[0]?._id || 'batch1',
          name: trainerBatches[0]?.name || 'React Fundamentals - Batch A',
          course: { title: trainerBatches[0]?.course?.title || 'React Fundamentals' }
        },
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        size: '2.5 MB',
        downloads: 45,
        status: 'published'
      },
      {
        _id: '2',
        title: 'JavaScript Async Programming Video',
        description: 'Video tutorial covering promises, async/await, and error handling',
        type: 'video',
        fileUrl: 'https://youtube.com/watch?v=example',
        batch: {
          _id: trainerBatches[1]?._id || 'batch2',
          name: trainerBatches[1]?.name || 'JavaScript Advanced - Batch B',
          course: { title: trainerBatches[1]?.course?.title || 'JavaScript Advanced' }
        },
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        size: '45 min',
        downloads: 32,
        status: 'published'
      },
      {
        _id: '3',
        title: 'Project Requirements Document',
        description: 'Detailed requirements for the final project',
        type: 'doc',
        fileUrl: '/materials/project-requirements.docx',
        batch: {
          _id: trainerBatches[0]?._id || 'batch1',
          name: trainerBatches[0]?.name || 'React Fundamentals - Batch A',
          course: { title: trainerBatches[0]?.course?.title || 'React Fundamentals' }
        },
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        size: '1.2 MB',
        downloads: 28,
        status: 'published'
      },
      {
        _id: '4',
        title: 'Useful Resources and Links',
        description: 'Collection of useful JavaScript resources and documentation',
        type: 'link',
        fileUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        batch: {
          _id: trainerBatches[1]?._id || 'batch2',
          name: trainerBatches[1]?.name || 'JavaScript Advanced - Batch B',
          course: { title: trainerBatches[1]?.course?.title || 'JavaScript Advanced' }
        },
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        size: 'External',
        downloads: 67,
        status: 'published'
      },
      {
        _id: '5',
        title: 'Draft: Advanced React Patterns',
        description: 'Work in progress - advanced React patterns and best practices',
        type: 'pdf',
        fileUrl: '/materials/advanced-react-patterns.pdf',
        batch: {
          _id: trainerBatches[0]?._id || 'batch1',
          name: trainerBatches[0]?.name || 'React Fundamentals - Batch A',
          course: { title: trainerBatches[0]?.course?.title || 'React Fundamentals' }
        },
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        size: '3.1 MB',
        downloads: 0,
        status: 'draft'
      }
    ];

    return NextResponse.json({ materials: mockMaterials }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/materials:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
