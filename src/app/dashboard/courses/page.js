"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CourseForm from "@/components/forms/course-form";
import { Skeleton } from "@/components/ui/skeleton";

function CourseRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-10 w-24" />
      </TableCell>
    </TableRow>
  );
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    const endpoint = user?.role === 'student' ? '/api/student/courses' : '/api/courses';
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const { courses } = await res.json();
        setCourses(courses);
      } else {
        const { message } = await res.json();
        setError(message || "Failed to fetch courses.");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/courses/${selectedCourse._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchCourses();
        setIsDeleteModalOpen(false);
        setSelectedCourse(null);
      } else {
        const { message } = await res.json();
        setError(message || "Failed to delete course.");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    }
  };

  const handleCourseUpdated = () => {
    fetchCourses();
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {user?.role === 'student' ? 'My Courses' : 'Course Management'}
        </h1>
        {user?.role === 'admin' && (
          <Button onClick={handleCreate}>Create Course</Button>
        )}
      </div>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Duration (Weeks)</TableHead>
              <TableHead>Price</TableHead>
              {user?.role === 'admin' && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <CourseRowSkeleton key={i} />
                ))
              : courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.level}</TableCell>
                    <TableCell>{course.durationWeeks}</TableCell>
                    <TableCell>{course.price}</TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEdit(course)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(course)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? "Edit Course" : "Create Course"}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse
                ? "Edit the details of the course."
                : "Enter the details of the new course."}
            </DialogDescription>
          </DialogHeader>
          <CourseForm
            course={selectedCourse}
            onClose={() => setIsModalOpen(false)}
            onCourseUpdated={handleCourseUpdated}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
