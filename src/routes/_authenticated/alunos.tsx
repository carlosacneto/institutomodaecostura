import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/alunos")({
  component: AlunosLayout,
});

function AlunosLayout() {
  return <Outlet />;
}