'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { getExerciseProgress, getWorkouts } from '@/lib/workout-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, Dumbbell, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function WorkoutProgressPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const [selectedExercise, setSelectedExercise] = useState<string>(searchParams.get('exercise') || '')
  const [exercises, setExercises] = useState<string[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadExercises() {
      if (!user) return
      
      try {
        // Get all workouts to extract unique exercises
        const workouts = await getWorkouts(user.id)
        
        // Extract unique exercise names
        const uniqueExercises = Array.from(
          new Set(
            workouts.flatMap(workout => 
              workout.exercises.map(ex => ex.name)
            )
          )
        ).sort()
        
        setExercises(uniqueExercises)
        
        // If no exercise is selected but we have exercises, select the first one
        if (!selectedExercise && uniqueExercises.length > 0) {
          setSelectedExercise(uniqueExercises[0])
        }
      } catch (error) {
        console.error('Error loading exercises:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExercises()
  }, [user, selectedExercise])

  useEffect(() => {
    async function loadProgress() {
      if (!user || !selectedExercise) return
      
      setIsLoading(true)
      try {
        const progressData = await getExerciseProgress(user.id, selectedExercise)
        setProgress(progressData)
      } catch (error) {
        console.error('Error loading progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [user, selectedExercise])

  const handleExerciseChange = (value: string) => {
    setSelectedExercise(value)
    router.push(`/workouts/progress?exercise=${encodeURIComponent(value)}`)
  }

  // Calculate progress metrics
  const calculateMetrics = () => {
    if (progress.length < 2) return null
    
    const firstWorkout = progress[0]
    const latestWorkout = progress[progress.length - 1]
    
    // Calculate 1RM improvement
    const firstOneRM = firstWorkout.estimatedOneRepMax
    const latestOneRM = latestWorkout.estimatedOneRepMax
    const oneRMImprovement = latestOneRM - firstOneRM
    const oneRMPercentage = (oneRMImprovement / firstOneRM) * 100
    
    // Calculate volume improvement (total weight lifted)
    const firstVolume = firstWorkout.sets.reduce((total: number, set: any) => total + (set.weight * set.reps), 0)
    const latestVolume = latestWorkout.sets.reduce((total: number, set: any) => total + (set.weight * set.reps), 0)
    const volumeImprovement = latestVolume - firstVolume
    const volumePercentage = (volumeImprovement / firstVolume) * 100
    
    return {
      oneRMImprovement,
      oneRMPercentage,
      volumeImprovement,
      volumePercentage,
      workoutCount: progress.length,
      timeSpan: Math.ceil((new Date(latestWorkout.date).getTime() - new Date(firstWorkout.date).getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold">Exercise Progress</h1>
          <p className="text-muted-foreground mt-1">Track your strength gains over time</p>
        </div>
        
        <div className="w-full max-w-xs">
          <Select value={selectedExercise} onValueChange={handleExerciseChange}>
            <SelectTrigger className="bg-[#1e1b4b] border-[#2d2a5d]">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(exercise => (
                <SelectItem key={exercise} value={exercise}>
                  {exercise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : progress.length === 0 ? (
          <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
            <CardContent className="py-6">
              <div className="text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No progress data available</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't logged any {selectedExercise} workouts yet.
                </p>
                <Button onClick={() => router.push('/chat')}>
                  Log a Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {metrics && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Estimated 1RM Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">
                        {metrics.oneRMImprovement > 0 ? '+' : ''}
                        {metrics.oneRMImprovement.toFixed(1)}
                      </span>
                      <span className="text-sm ml-1">lbs</span>
                      <span className={`ml-2 text-sm ${metrics.oneRMPercentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({metrics.oneRMPercentage > 0 ? '+' : ''}
                        {metrics.oneRMPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="h-1 w-full bg-[#2d2a5d] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(5, 5 + metrics.oneRMPercentage / 2))}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Volume Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">
                        {metrics.volumeImprovement > 0 ? '+' : ''}
                        {metrics.volumeImprovement.toFixed(0)}
                      </span>
                      <span className="text-sm ml-1">lbs total</span>
                      <span className={`ml-2 text-sm ${metrics.volumePercentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({metrics.volumePercentage > 0 ? '+' : ''}
                        {metrics.volumePercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="h-1 w-full bg-[#2d2a5d] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(5, 5 + metrics.volumePercentage / 2))}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Workout Frequency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{metrics.workoutCount}</span>
                      <span className="text-sm ml-1">workouts</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Over {metrics.timeSpan} days ({(metrics.workoutCount / metrics.timeSpan * 7).toFixed(1)} per week)
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Card className="bg-[#1e1b4b] border-[#2d2a5d]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {selectedExercise} History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-60 w-full">
                  <div className="absolute inset-0">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Background grid lines */}
                      {[...Array(5)].map((_, i) => (
                        <line 
                          key={`grid-${i}`}
                          x1="0" 
                          y1={20 * i} 
                          x2="100" 
                          y2={20 * i} 
                          stroke="#2d2a5d" 
                          strokeWidth="0.5"
                        />
                      ))}
                      
                      {/* Progress line */}
                      {progress.length > 1 && (
                        <polyline
                          points={progress.map((p, i) => {
                            const x = (i / (progress.length - 1)) * 100
                            const maxOneRM = Math.max(...progress.map(p => p.estimatedOneRepMax))
                            const minOneRM = Math.min(...progress.map(p => p.estimatedOneRepMax))
                            const range = maxOneRM - minOneRM
                            const y = 100 - ((p.estimatedOneRepMax - minOneRM) / (range || 1)) * 80
                            return `${x},${y}`
                          }).join(' ')}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      
                      {/* Data points */}
                      {progress.map((p, i) => {
                        const x = (i / (progress.length - 1)) * 100
                        const maxOneRM = Math.max(...progress.map(p => p.estimatedOneRepMax))
                        const minOneRM = Math.min(...progress.map(p => p.estimatedOneRepMax))
                        const range = maxOneRM - minOneRM
                        const y = 100 - ((p.estimatedOneRepMax - minOneRM) / (range || 1)) * 80
                        return (
                          <circle
                            key={`point-${i}`}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill="hsl(var(--primary))"
                          />
                        )
                      })}
                    </svg>
                  </div>
                </div>
                
                <div className="mt-4 space-y-4">
                  <h3 className="text-sm font-medium">Recent Workouts</h3>
                  <div className="space-y-2">
                    {progress.slice(-3).reverse().map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-md bg-[#2d2a5d]/50">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(new Date(p.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm mr-2">1RM: {p.estimatedOneRepMax.toFixed(1)} lbs</span>
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 