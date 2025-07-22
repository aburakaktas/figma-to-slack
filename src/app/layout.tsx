import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Figma to Slack Connector',
  description: 'Lightweight connector to send Figma notifications to Slack',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}