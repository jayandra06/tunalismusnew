"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

function ProgressCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { progress: progressData } = await res.json();
          setProgress(progressData);
        } else {
          setError("Failed to fetch progress data.");
        }
      } catch (e) {
        setError("An error occurred while fetching progress.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">My Progress</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <ProgressCardSkeleton key={i} />
            ))
          : progress.map((item) => (
              <Card key={item._id}>
                <CardHeader>
                  <CardTitle>{item.course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">
                      {item.completedLessons} / {item.totalLessons} lessons completed
                    </p>
                    <p className="text-sm font-bold">{Math.round(item.percentage)}%</p>
                  </div>
                  <Progress value={item.percentage} />
                </CardContent>
              </Card>
            ))}
      </div>
      {!loading && progress.length === 0 && (
        <div className="mt-6 text-center text-muted-foreground">
          <p>Your progress has not been updated yet.</p>
        </div>
      )}
    </div>
  );
}
