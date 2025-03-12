import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Workout patterns for detection
const WORKOUT_PATTERNS = {
  push: ['bench press', 'overhead press', 'shoulder press', 'tricep', 'chest fly', 'push up', 'dip'],
  pull: ['pull up', 'chin up', 'row', 'deadlift', 'bicep curl', 'lat pulldown', 'face pull'],
  legs: ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl', 'calf raise', 'hip thrust'],
  cardio: ['run', 'jog', 'sprint', 'cardio', 'hiit', 'cycling', 'bike', 'treadmill', 'elliptical'],
  fullBody: ['clean', 'snatch', 'thruster', 'burpee', 'kettlebell swing', 'turkish get up']
}

// Mock data for development
const mockWorkouts = [
  {
    id: '1',
    userId: 'user123',
    date: new Date().toISOString(),
    notes: 'Push day - felt strong today',
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: [
          { id: '1', weight: 225, reps: 5, rpe: 8 },
          { id: '2', weight: 225, reps: 5, rpe: 8 },
          { id: '3', weight: 225, reps: 5, rpe: 9 },
          { id: '4', weight: 225, reps: 5, rpe: 9 },
          { id: '5', weight: 225, reps: 5, rpe: 10 }
        ]
      },
      {
        id: '2',
        name: 'Overhead Press',
        sets: [
          { id: '6', weight: 135, reps: 8, rpe: 7 },
          { id: '7', weight: 135, reps: 8, rpe: 8 },
          { id: '8', weight: 135, reps: 8, rpe: 9 }
        ]
      },
      {
        id: '3',
        name: 'Tricep Pushdown',
        sets: [
          { id: '9', weight: 70, reps: 12, rpe: 7 },
          { id: '10', weight: 70, reps: 12, rpe: 8 },
          { id: '11', weight: 70, reps: 10, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: '2',
    userId: 'user123',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    notes: 'Pull day - back was sore',
    exercises: [
      {
        id: '4',
        name: 'Deadlift',
        sets: [
          { id: '12', weight: 315, reps: 5, rpe: 8 },
          { id: '13', weight: 315, reps: 5, rpe: 8 },
          { id: '14', weight: 315, reps: 5, rpe: 9 }
        ]
      },
      {
        id: '5',
        name: 'Pull Ups',
        sets: [
          { id: '15', weight: 0, reps: 10, rpe: 7 },
          { id: '16', weight: 0, reps: 10, rpe: 8 },
          { id: '17', weight: 0, reps: 8, rpe: 9 }
        ]
      }
    ]
  },
  {
    id: '3',
    userId: 'user123',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    notes: 'Leg day - squats felt heavy',
    exercises: [
      {
        id: '6',
        name: 'Squat',
        sets: [
          { id: '18', weight: 275, reps: 5, rpe: 8 },
          { id: '19', weight: 275, reps: 5, rpe: 8 },
          { id: '20', weight: 275, reps: 5, rpe: 9 },
          { id: '21', weight: 275, reps: 5, rpe: 10 }
        ]
      },
      {
        id: '7',
        name: 'Leg Press',
        sets: [
          { id: '22', weight: 400, reps: 10, rpe: 7 },
          { id: '23', weight: 400, reps: 10, rpe: 8 },
          { id: '24', weight: 400, reps: 10, rpe: 9 }
        ]
      }
    ]
  }
]

// Type definitions
export interface Set {
  id: string
  weight: number
  reps: number
  rpe: number | null
}

export interface Exercise {
  id: string
  name: string
  sets: Set[]
}

export interface Workout {
  id: string
  userId: string
  date: string
  notes?: string
  exercises: Exercise[]
}

// Function to get all workouts for a user
export async function getWorkouts(userId: string): Promise<Workout[]> {
  try {
    // Check if we're in development mode with no Supabase connection
    if (!supabaseUrl || !supabaseKey) {
      console.log('Using mock workout data')
      return mockWorkouts
    }

    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*, sets(*))')
      .eq('userId', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return []
  }
}

// Function to get a specific workout by ID
export async function getWorkoutById(id: string): Promise<Workout | null> {
  try {
    // Check if we're in development mode with no Supabase connection
    if (!supabaseUrl || !supabaseKey) {
      console.log('Using mock workout data')
      const workout = mockWorkouts.find(w => w.id === id)
      return workout || null
    }

    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*, sets(*))')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching workout:', error)
    return null
  }
}

// Function to save a new workout
export async function saveWorkout(userId: string, workoutData: any): Promise<string> {
  try {
    // Prepare workout object
    const workout = {
      userId,
      date: new Date().toISOString(),
      notes: workoutData.notes || '',
      exercises: workoutData.exercises || []
    }

    // Check if we're in development mode with no Supabase connection
    if (!supabaseUrl || !supabaseKey) {
      console.log('Using mock workout data - workout saved locally')
      const newId = (mockWorkouts.length + 1).toString()
      const newWorkout = {
        id: newId,
        ...workout,
        exercises: workout.exercises.map((ex: any, i: number) => ({
          id: `new-${i}`,
          name: ex.name,
          sets: ex.sets.map((set: any, j: number) => ({
            id: `new-set-${j}`,
            weight: set.weight || 0,
            reps: set.reps || 0,
            rpe: set.rpe || null
          }))
        }))
      }
      mockWorkouts.unshift(newWorkout)
      return newId
    }

    // In a real app, we would use transactions to save the workout and related exercises/sets
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()

    if (error) throw error
    return data[0].id
  } catch (error) {
    console.error('Error saving workout:', error)
    throw error
  }
}

// Function to determine workout type based on exercises
export function determineWorkoutType(workout: Workout): string | null {
  if (!workout || !workout.exercises || workout.exercises.length === 0) return null
  
  const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase())
  
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

// Function to suggest next workout based on workout history
export function suggestNextWorkout(workouts: Workout[]): string | null {
  if (!workouts || workouts.length < 2) return null
  
  // Get the most recent workout
  const latestWorkout = workouts[0]
  const currentType = determineWorkoutType(latestWorkout)
  
  if (!currentType) return null
  
  // Analyze workout pattern
  const workoutTypes = workouts
    .slice(0, 5) // Look at last 5 workouts
    .map(w => determineWorkoutType(w))
    .filter(Boolean) as string[]
  
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

// Function to get exercise progress over time
export async function getExerciseProgress(userId: string, exerciseName: string): Promise<any[]> {
  try {
    // Check if we're in development mode with no Supabase connection
    if (!supabaseUrl || !supabaseKey) {
      console.log('Using mock workout data for progress')
      
      // Extract all instances of the exercise from mock workouts
      const progress = mockWorkouts
        .filter(workout => workout.userId === userId)
        .flatMap(workout => {
          const matchingExercises = workout.exercises.filter(
            ex => ex.name.toLowerCase() === exerciseName.toLowerCase()
          )
          
          return matchingExercises.map(ex => ({
            date: workout.date,
            sets: ex.sets,
            // Calculate 1RM using Brzycki formula: weight * (36 / (37 - reps))
            estimatedOneRepMax: Math.max(
              ...ex.sets.map(set => 
                set.weight * (36 / (37 - Math.min(set.reps, 36)))
              )
            )
          }))
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      return progress
    }

    // In a real app, we would query the database for all instances of the exercise
    // This would require a more complex query joining workouts, exercises, and sets
    const { data, error } = await supabase
      .from('workouts')
      .select('date, exercises!inner(name, sets(weight, reps))')
      .eq('userId', userId)
      .eq('exercises.name', exerciseName)
      .order('date')
    
    if (error) throw error
    
    // Process the data to calculate progress metrics
    const progress = data.map((workout: any) => {
      const exercise = workout.exercises[0]
      return {
        date: workout.date,
        sets: exercise.sets,
        // Calculate 1RM using Brzycki formula
        estimatedOneRepMax: Math.max(
          ...exercise.sets.map((set: any) => 
            set.weight * (36 / (37 - Math.min(set.reps, 36)))
          )
        )
      }
    })
    
    return progress
  } catch (error) {
    console.error('Error fetching exercise progress:', error)
    return []
  }
} 