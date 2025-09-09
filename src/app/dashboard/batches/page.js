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
} from "@/components/ui/dialog";
import BatchForm from "@/components/forms/batch-form";
import { Skeleton } from "@/components/ui/skeleton";

function BatchRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-10 w-24" />
      </TableCell>
    </TableRow>
  );
}

export default function BatchesPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/batches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const { batches } = await res.json();
        setBatches(batches);
      } else {
        const { message } = await res.json();
        setError(message || "Failed to fetch batches.");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreate = () => {
    setSelectedBatch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleDelete = (batch) => {
    setSelectedBatch(batch);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBatch) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/batches/${selectedBatch._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchBatches();
        setIsDeleteModalOpen(false);
        setSelectedBatch(null);
      } else {
        const { message } = await res.json();
        setError(message || "Failed to delete batch.");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    }
  };

  const handleBatchUpdated = () => {
    fetchBatches();
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Batch Management</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Batch Management</h1>
        {user?.role === 'admin' && (
          <Button onClick={handleCreate}>Create Batch</Button>
        )}
      </div>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              {user?.role === 'admin' && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <BatchRowSkeleton key={i} />
                ))
              : batches.map((batch) => (
                  <TableRow key={batch._id}>
                    <TableCell>{batch.name}</TableCell>
                    <TableCell>{batch.course.title}</TableCell>
                    <TableCell>{batch.trainer.name}</TableCell>
                    <TableCell>
                      {new Date(batch.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(batch.endDate).toLocaleDateString()}
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEdit(batch)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(batch)}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBatch ? "Edit Batch" : "Create Batch"}
            </DialogTitle>
            <DialogDescription>
              {selectedBatch
                ? "Edit the details of the batch."
                : "Enter the details of the new batch."}
            </DialogDescription>
          </DialogHeader>
          <BatchForm
            batch={selectedBatch}
            onClose={() => setIsModalOpen(false)}
            onBatchUpdated={handleBatchUpdated}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this batch?
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
