"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MultipleSelector from "@/components/ui/multi-select";

const batchFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  course: z.string().nonempty({ message: "Please select a course." }),
  trainer: z.string().nonempty({ message: "Please select a trainer." }),
  startDate: z.string().nonempty({ message: "Please select a start date." }),
  endDate: z.string().nonempty({ message: "Please select an end date." }),
  schedule: z.string().optional(),
  students: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

export default function BatchForm({ batch, onClose, onBatchUpdated }) {
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [coursesRes, usersRes] = await Promise.all([
          fetch("/api/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { courses } = await coursesRes.json();
        const { users } = await usersRes.json();

        setCourses(courses);
        setTrainers(users.filter((u) => u.role === "trainer"));
        setAllStudents(
          users
            .filter((u) => u.role === "student")
            .map((s) => ({ value: s._id, label: s.name }))
        );
      } catch (error) {
        // Handle error
      }
    };
    fetchData();
  }, []);

  const form = useForm({
    resolver: zodResolver(batchFormSchema),
    defaultValues: batch
      ? {
          ...batch,
          course: batch.course._id,
          trainer: batch.trainer._id,
          students: batch.students.map((s) => ({ value: s._id, label: s.name })),
          startDate: new Date(batch.startDate).toISOString().split("T")[0],
          endDate: new Date(batch.endDate).toISOString().split("T")[0],
        }
      : {
          name: "",
          course: "",
          trainer: "",
          startDate: "",
          endDate: "",
          schedule: "",
          students: [],
        },
  });

  const { formState } = form;

  const onSubmit = async (values) => {
    const submissionData = {
      ...values,
      students: values.students.map((s) => s.value),
    };

    try {
      const token = localStorage.getItem("token");
      const url = batch ? `/api/batches/${batch._id}` : "/api/batches";
      const method = batch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        onBatchUpdated();
        onClose();
      } else {
        const { message } = await res.json();
        form.setError("root", { message: message || "Failed to save batch." });
      }
    } catch (error) {
      form.setError("root", { message: "An unexpected error occurred." });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields for name, course, trainer, dates, schedule, students */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. German A1 - Morning Batch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trainer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trainer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trainers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Mon-Wed-Fri 6PM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="students"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Students</FormLabel>
              <FormControl>
                <MultipleSelector
                  {...field}
                  defaultOptions={allStudents}
                  placeholder="Select students..."
                  emptyIndicator={
                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                      no results found.
                    </p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {formState.errors.root && (
          <p className="text-sm text-red-600">
            {formState.errors.root.message}
          </p>
        )}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
