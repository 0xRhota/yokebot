import { WorkoutForm } from '@/components/workout/WorkoutForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewWorkoutPage() {
  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Log New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm />
        </CardContent>
      </Card>
    </div>
  )
} 