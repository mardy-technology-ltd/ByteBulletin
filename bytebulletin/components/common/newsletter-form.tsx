"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { success: false, error: "", message: "" };

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await subscribeToNewsletter(formData);
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex w-full items-center space-x-2">
        <Input 
          type="email" 
          name="email" 
          placeholder="Enter your email" 
          required 
          className="max-w-[220px]"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && <p className="text-sm text-green-500">{state.message}</p>}
    </form>
  );
}
