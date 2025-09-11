import { connectToDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import Blog from '@/models/Blog';

export default async function sitemap() {
  const baseUrl = 'https://tunalismus.in';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    await connectToDB();
    
    // Dynamic course pages
    const courses = await Course.find({ status: { $in: ['active', 'published'] } });
    const coursePages = courses.map((course) => ({
      url: `${baseUrl}/courses/enroll/${course._id}`,
      lastModified: course.updatedAt || course.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Dynamic blog pages
    const blogs = await Blog.find({ status: 'published' });
    const blogPages = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt || blog.createdAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    return [...staticPages, ...coursePages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
