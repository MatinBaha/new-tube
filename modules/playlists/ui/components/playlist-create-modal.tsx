"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

const formSchema = z.object({
  name: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (playlistId: string) => void;
}

export const PlaylistCreateModal = ({
  open,
  onOpenChange,
  onSuccess,
}: PlaylistCreateModalProps) => {
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = trpc.playlists.create.useMutation({
    onSuccess: (data) => {
      toast.success("Playlist created");
      utils.playlists.getMany.invalidate();
      form.reset();
      onOpenChange(false);
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create playlist");
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New playlist</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add a title"
                      autoFocus
                      disabled={createMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell viewers about your playlist"
                      rows={3}
                      className="resize-none"
                      disabled={createMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={createMutation.isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
