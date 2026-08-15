import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    // No futuro, redirecionar se não autenticado
  },
  component: DashboardPage,
})

function DashboardPage() {
  return null
}
