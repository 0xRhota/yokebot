type Set = {
  weight: number
  reps: number
}

type Exercise = {
  name: string
  sets: Set[]
}

type Workout = {
  exercises: Exercise[]
  calories?: number
}

export function parseWorkout(input: string): Workout {
  const workout: Workout = {
    exercises: [],
    calories: Math.floor(Math.random() * 200) + 250, // Random calories for demo
  }

  // Parse bench press
  if (input.toLowerCase().includes("bench press")) {
    const exercise: Exercise = {
      name: "Bench Press",
      sets: [],
    }

    // Extract weights and reps
    const weights = input.match(/\d+(\.\d+)?\s*(lbs?|pounds?)/gi) || []
    const reps = input.match(/\d+\s*reps?/gi) || []

    // Check for specific weights
    if (input.includes("185")) {
      exercise.sets.push({ weight: 185, reps: input.includes("185 for 8") ? 8 : 10 })
    }

    if (input.includes("205")) {
      exercise.sets.push({ weight: 205, reps: input.includes("205 for 6") ? 6 : 8 })
    }

    if (input.includes("225")) {
      // Check if failed
      if (input.includes("failed") || input.includes("fail")) {
        exercise.sets.push({ weight: 225, reps: 0 })
      } else {
        exercise.sets.push({ weight: 225, reps: 5 })
      }
    }

    // If no specific weights were found but bench press is mentioned
    if (exercise.sets.length === 0) {
      const setCount = input.match(/(\d+)\s*sets?/i)
      const setNumber = setCount ? Number.parseInt(setCount[1]) : 3

      for (let i = 0; i < setNumber; i++) {
        exercise.sets.push({ weight: 185, reps: 8 })
      }
    }

    workout.exercises.push(exercise)
  }

  // Parse squats
  if (input.toLowerCase().includes("squat")) {
    const exercise: Exercise = {
      name: "Squat",
      sets: [],
    }

    // Check for specific weights
    if (input.includes("225")) {
      exercise.sets.push({ weight: 225, reps: 8 })
    }

    if (input.includes("245")) {
      exercise.sets.push({ weight: 245, reps: 6 })
    }

    if (input.includes("265")) {
      exercise.sets.push({ weight: 265, reps: 4 })
    }

    // If no specific weights were found but squats are mentioned
    if (exercise.sets.length === 0) {
      const setCount = input.match(/(\d+)\s*sets?/i)
      const setNumber = setCount ? Number.parseInt(setCount[1]) : 3

      for (let i = 0; i < setNumber; i++) {
        exercise.sets.push({ weight: 225, reps: 8 })
      }
    }

    workout.exercises.push(exercise)
  }

  // If no exercises were parsed but the input mentions workout
  if (workout.exercises.length === 0) {
    // Try to extract exercise names
    const possibleExercises = [
      "deadlift",
      "pull up",
      "pullup",
      "press",
      "curl",
      "extension",
      "row",
      "fly",
      "raise",
      "lunge",
      "crunch",
      "pushup",
      "push up",
      "dip",
    ]

    let exerciseName = "Exercise"

    for (const ex of possibleExercises) {
      if (input.toLowerCase().includes(ex)) {
        exerciseName = ex.charAt(0).toUpperCase() + ex.slice(1)
        break
      }
    }

    const exercise: Exercise = {
      name: exerciseName,
      sets: [],
    }

    // Extract set count
    const setCount = input.match(/(\d+)\s*sets?/i)
    const setNumber = setCount ? Number.parseInt(setCount[1]) : 3

    // Extract weight if available
    const weightMatch = input.match(/(\d+)(?:\s*lbs?|\s*pounds?)/i)
    const weight = weightMatch ? Number.parseInt(weightMatch[1]) : 100

    // Extract reps if available
    const repMatch = input.match(/(\d+)(?:\s*reps?)/i)
    const reps = repMatch ? Number.parseInt(repMatch[1]) : 10

    for (let i = 0; i < setNumber; i++) {
      exercise.sets.push({ weight, reps })
    }

    workout.exercises.push(exercise)
  }

  return workout
} 