'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { saveWorkout } from '@/lib/workout-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ExerciseSet {
  weight: number
  reps: number
  rpe?: number
}

interface Exercise {
  name: string
  sets: ExerciseSet[]
}

export function WorkoutForm() {
  const router = useRouter()
  const { user } = useUser()
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: [{ weight: 0, reps: 0 }] }
  ])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ weight: 0, reps: 0 }] }])
  }

  const removeExercise = (index: number) => {
    const newExercises = [...exercises]
    newExercises.splice(index, 1)
    setExercises(newExercises)
  }

  const updateExerciseName = (index: number, name: string) => {
    const newExercises = [...exercises]
    newExercises[index].name = name
    setExercises(newExercises)
  }

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.push({ weight: 0, reps: 0 })
    setExercises(newExercises)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to save a workout')
      return
    }

    // Validate form
    const isValid = exercises.every(exercise => 
      exercise.name.trim() !== '' && 
      exercise.sets.length > 0 && 
      exercise.sets.every(set => set.weight > 0 && set.reps > 0)
    )

    if (!isValid) {
      toast.error('Please fill in all exercise names, weights, and reps')
      return
    }

    setIsSubmitting(true)

    try {
      const workoutData = {
        exercises,
        notes
      }

      await saveWorkout(user.id, workoutData)
      toast.success('Workout saved successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Exercise {exerciseIndex + 1}</CardTitle>
                {exercises.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeExercise(exerciseIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-2">
                <Label htmlFor={`exercise-${exerciseIndex}`}>Exercise Name</Label>
                <Input
                  id={`exercise-${exerciseIndex}`}
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                  placeholder="e.g., Bench Press"
                  className="mt-1"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                  <div className="col-span-4">Set</div>
                  <div className="col-span-3">Weight (kg)</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-2">RPE</div>
                </div>
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 flex items-center">
                      <span className="text-sm font-medium">Set {setIndex + 1}</span>
                      {exercise.sets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        value={set.reps}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', parseFloat(e.target.value))}
                        className="h-8"
                        placeholder="1-10"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exerciseIndex)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="button" variant="outline" onClick={addExercise} className="w-full">
          <Plus className="h-4 w-4 mr-1" /> Add Exercise
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Workout Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did the workout feel? Any PRs or things to remember?"
          rows={3}
        />
      </div>

      <CardFooter className="px-0 pt-6">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Workout
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  )
} 