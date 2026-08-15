import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ redirect }) => {
    throw redirect({
      to: '/dashboard',
    });
  },
});
