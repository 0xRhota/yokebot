'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/auth-context'
import { getWorkouts } from '@/lib/workout-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function WorkoutsPage() {
  const { user } = useUser()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadWorkouts() {
      if (!user) return
      
      try {
        const workoutData = await getWorkouts(user.id)
        setWorkouts(workoutData)
      } catch (error) {
        console.error('Error loading workouts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkouts()
  }, [user])

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Workouts</h1>
        <Link href="/workouts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Workout
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse">Loading workouts...</div>
        </div>
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-4">
              <p className="text-lg font-medium mb-2">No workouts yet</p>
              <p className="text-muted-foreground">
                Start tracking your progress by logging your first workout
              </p>
            </div>
            <Link href="/workouts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Log Your First Workout
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <Link key={workout.id} href={`/workouts/${workout.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">
                      Workout on {format(new Date(workout.date), 'MMMM d, yyyy')}
                    </CardTitle>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {workout.notes || 'No notes for this workout'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 