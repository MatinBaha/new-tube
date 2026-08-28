import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
}

export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
  const { user } = useUser();

  const utils = trpc.useUtils();
  const clerk = useClerk();
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      toast.success("Comment added");
    },
    onError: (error) => {
      toast.error(error.message);

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const form = useForm<z.infer<typeof commentInsertSchema>>({
    resolver: zodResolver(commentInsertSchema.omit({ userId: true })),
    defaultValues: {
      videoId,
      comment: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof commentInsertSchema>) => {
    create.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="group flex gap-4"
      >
        <UserAvatar
          size="lg"
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          name={user?.username || "User"}
        />
        <div className="flex-1">
          <FormField
            name="comment"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add a comment..."
                    className="min-h-0 resize-none overflow-hidden bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button disabled={create.isPending} type="submit" className="sm">
              Comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
