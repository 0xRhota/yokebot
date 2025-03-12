'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Dumbbell, MessageSquare, BarChart3, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/chat')
    }
  }, [user, isLoading, router])

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track Your Workouts with <span className="text-primary">YokeBot</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Log your workouts, track your progress, and get personalized recommendations
                  through natural conversation.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/chat">
                  <Button size="lg" className="gradient-purple gap-1">
                    Start Chatting <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" variant="outline" className="gap-1">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full opacity-20 blur-3xl"></div>
                <div className="relative h-full w-full flex items-center justify-center">
                  <Dumbbell className="h-32 w-32 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to track your fitness journey
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-2xl border border-border bg-secondary p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Chat Interface</h3>
              <p className="text-center text-muted-foreground">
                Log your workouts through natural conversation with YokeBot. No more complicated forms.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-2xl border border-border bg-secondary p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Workout Tracking</h3>
              <p className="text-center text-muted-foreground">
                Track your sets, reps, and weights. Monitor your progress over time with detailed history.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-2xl border border-border bg-secondary p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Progress Analytics</h3>
              <p className="text-center text-muted-foreground">
                Visualize your progress with charts and analytics to help you reach your fitness goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to start your fitness journey?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join YokeBot today and take your workouts to the next level.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/chat">
                <Button size="lg" className="gradient-purple gap-1">
                  Start Chatting <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
