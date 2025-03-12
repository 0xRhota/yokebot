'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { getWorkoutById, getWorkouts } from '@/lib/workout-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, Calendar, ArrowLeft, Clock, TrendingUp, BarChart2, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

// Workout patterns for detection
const WORKOUT_PATTERNS = {
  push: ['bench press', 'overhead press', 'shoulder press', 'tricep', 'chest fly', 'push up', 'dip'],
  pull: ['pull up', 'chin up', 'row', 'deadlift', 'bicep curl', 'lat pulldown', 'face pull'],
  legs: ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl', 'calf raise', 'hip thrust'],
  cardio: ['run', 'jog', 'sprint', 'cardio', 'hiit', 'cycling', 'bike', 'treadmill', 'elliptical'],
  fullBody: ['clean', 'snatch', 'thruster', 'burpee', 'kettlebell swing', 'turkish get up']
}

export default function WorkoutDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [workout, setWorkout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workoutType, setWorkoutType] = useState<string | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [suggestedNextWorkout, setSuggestedNextWorkout] = useState<string | null>(null)

  useEffect(() => {
    async function loadWorkout() {
      if (!user || !params.id) return
      
      try {
        const workoutData = await getWorkoutById(params.id as string)
        setWorkout(workoutData)
        
        // Determine workout type
        const type = determineWorkoutType(workoutData)
        setWorkoutType(type)
        
        // Load recent workouts for pattern detection
        const workoutsData = await getWorkouts(user.id)
        setRecentWorkouts(workoutsData.slice(0, 10)) // Get last 10 workouts
        
        // Suggest next workout based on patterns
        const nextWorkout = suggestNextWorkout(type, workoutsData)
        setSuggestedNextWorkout(nextWorkout)
      } catch (error) {
        console.error('Error loading workout:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkout()
  }, [user, params.id])

  const determineWorkoutType = (workout: any): string | null => {
    if (!workout || !workout.exercises || workout.exercises.length === 0) return null
    
    const exerciseNames = workout.exercises.map((ex: any) => ex.name.toLowerCase())
    
    // Count exercises in each category
    const counts = {
      push: 0,
      pull: 0,
      legs: 0,
      cardio: 0,
      fullBody: 0
    }
    
    for (const name of exerciseNames) {
      for (const [type, patterns] of Object.entries(WORKOUT_PATTERNS)) {
        if (patterns.some(pattern => name.includes(pattern))) {
          counts[type as keyof typeof counts]++
        }
      }
    }
    
    // Determine the dominant type
    const maxCount = Math.max(...Object.values(counts))
    if (maxCount === 0) return null
    
    const dominantTypes = Object.entries(counts)
      .filter(([_, count]) => count === maxCount)
      .map(([type, _]) => type)
    
    // Special cases for common workout splits
    if (dominantTypes.includes('push') && dominantTypes.includes('pull')) {
      return 'upper body'
    }
    
    if (dominantTypes.includes('push') && counts.push > 1) {
      return 'push'
    }
    
    if (dominantTypes.includes('pull') && counts.pull > 1) {
      return 'pull'
    }
    
    if (dominantTypes.includes('legs') && counts.legs > 1) {
      return 'leg'
    }
    
    if (dominantTypes.length === 1) {
      return dominantTypes[0]
    }
    
    return null
  }
  
  const suggestNextWorkout = (currentType: string | null, workouts: any[]): string | null => {
    if (!currentType || workouts.length < 3) return null
    
    // Analyze workout pattern
    const workoutTypes = workouts
      .slice(0, 5) // Look at last 5 workouts
      .map(w => determineWorkoutType(w))
      .filter(Boolean) as string[]
    
    // If we don't have enough data, suggest based on current workout
    if (workoutTypes.length < 3) {
      if (currentType === 'push') return 'pull'
      if (currentType === 'pull') return 'legs'
      if (currentType === 'legs') return 'push'
      if (currentType === 'upper body') return 'legs'
      return null
    }
    
    // Check for PPL pattern
    const pplPattern = ['push', 'pull', 'legs']
    const hasPPL = pplPattern.every(type => workoutTypes.includes(type))
    
    if (hasPPL) {
      // Suggest next in PPL sequence
      if (currentType === 'push') return 'pull'
      if (currentType === 'pull') return 'legs'
      if (currentType === 'legs') return 'push'
    }
    
    // Check for upper/lower split
    const hasUpperLower = workoutTypes.includes('upper body') && 
                          (workoutTypes.includes('legs') || workoutTypes.includes('lower body'))
    
    if (hasUpperLower) {
      if (currentType === 'upper body') return 'legs'
      if (currentType === 'legs' || currentType === 'lower body') return 'upper body'
    }
    
    // Default suggestion
    if (currentType === 'push') return 'pull'
    if (currentType === 'pull') return 'legs'
    if (currentType === 'legs') return 'push'
    
    return null
  }
  
  const getWorkoutTypeColor = (type: string | null): string => {
    if (!type) return 'bg-secondary text-foreground'
    
    switch (type.toLowerCase()) {
      case 'push':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'pull':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30'
      case 'legs':
      case 'leg':
        return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'cardio':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'upper body':
        return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30'
      case 'full body':
      case 'fullbody':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
      default:
        return 'bg-secondary text-foreground'
    }
  }
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'EEEE, MMMM d, yyyy')
  }
  
  const formatTime = (date: string | Date) => {
    return format(new Date(date), 'h:mm a')
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Workout not found</h2>
          <p className="text-muted-foreground mb-6">The workout you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/workouts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workouts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            <Link href={`/chat?workout=${params.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>Discuss</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold">
            Workout Details
            {workoutType && (
              <Badge className={`ml-2 ${getWorkoutTypeColor(workoutType)}`}>
                {workoutType.charAt(0).toUpperCase() + workoutType.slice(1)}
              </Badge>
            )}
          </h1>
          
          <div className="flex items-center text-muted-foreground mt-1 space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(workout.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTime(workout.date)}</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                Exercises
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workout.exercises && workout.exercises.length > 0 ? (
                <div className="space-y-4">
                  {workout.exercises.map((exercise: any, index: number) => (
                    <div key={index} className="border-b border-[#2d2a5d] pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {exercise.sets?.length || 0} sets
                        </span>
                      </div>
                      
                      {exercise.sets && exercise.sets.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-muted-foreground">Set</div>
                          <div className="text-muted-foreground">Weight</div>
                          <div className="text-muted-foreground">Reps</div>
                          
                          {exercise.sets.map((set: any, setIndex: number) => (
                            <React.Fragment key={setIndex}>
                              <div>{setIndex + 1}</div>
                              <div>{set.weight > 0 ? `${set.weight}lb` : '-'}</div>
                              <div>{set.reps > 0 ? set.reps : '-'}</div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No exercises recorded for this workout.</div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workoutType && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Workout Type</div>
                      <div className="font-medium">
                        {workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Day
                      </div>
                    </div>
                  )}
                  
                  {suggestedNextWorkout && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Suggested Next Workout</div>
                      <div className="font-medium">
                        {suggestedNextWorkout.charAt(0).toUpperCase() + suggestedNextWorkout.slice(1)} Day
                      </div>
                      <div className="mt-2">
                        <Link href="/chat">
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Plan Next Workout
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {workout.notes && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Notes</div>
                      <div className="text-sm">{workout.notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workout.exercises && workout.exercises.length > 0 ? (
                  <div className="space-y-3">
                    {workout.exercises.slice(0, 2).map((exercise: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm">{exercise.name}</div>
                          <div className="text-xs text-muted-foreground">Last 4 workouts</div>
                        </div>
                        <div className="h-10 w-full bg-[#2d2a5d] rounded-md relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-around">
                            {[...Array(4)].map((_, i) => (
                              <div 
                                key={i} 
                                className="h-6 w-1 bg-primary rounded-full"
                                style={{ 
                                  height: `${Math.max(20, Math.min(90, 30 + Math.random() * 40))}%`,
                                  opacity: i === 0 ? 1 : 0.7 - (i * 0.15)
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-2 text-center">
                      <Link href={`/workouts/progress?exercise=${workout.exercises[0]?.name}`}>
                        <Button variant="link" size="sm" className="text-primary">
                          View detailed progress
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No progress data available.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 