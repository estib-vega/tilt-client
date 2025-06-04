import { Button } from '@/app/components/ui/button'

export default function App() {
  return (
    <div className="flex h-full w-full items-center justify-center ">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold text-accent-foreground">tilt</h1>
        <Button onClick={() => document.documentElement.classList.toggle('dark')}>toggle</Button>
      </div>
    </div>
  )
}
