import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/historico')({
  component: HistoryPage,
})

function HistoryPage() {
  return null
}
