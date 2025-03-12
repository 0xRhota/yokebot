'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dumbbell, Home, LogOut, User, MessageSquare, BarChart2 } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useUser()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold">YokeBot</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/chat"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/chat') || pathname.startsWith('/chat')
                      ? 'text-primary'
                      : 'text-foreground/60'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/dashboard')
                      ? 'text-primary'
                      : 'text-foreground/60'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" />
                    <span>Stats</span>
                  </span>
                </Link>
                <Link
                  href="/workouts"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith('/workouts')
                      ? 'text-primary'
                      : 'text-foreground/60'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>Workouts</span>
                  </span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button className="gradient-purple">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 