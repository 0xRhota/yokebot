"use client"

import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UserButton() {
  return (
    <Button variant="ghost" size="icon" className="rounded-full">
      <User className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">User profile</span>
    </Button>
  )
} 