import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/desempenho')({
  component: PerformancePage,
})

function PerformancePage() {
  return null
}
