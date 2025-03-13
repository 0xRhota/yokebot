'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dumbbell, Send, Plus, ChevronRight, Calendar, BarChart2, Clock } from 'lucide-react'
import { saveWorkout } from '@/lib/workout-service'
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  workout?: any
}

// Workout patterns for better detection
const WORKOUT_PATTERNS = {
  push: ['bench press', 'overhead press', 'shoulder press', 'tricep', 'chest fly', 'push up', 'dip'],
  pull: ['pull up', 'chin up', 'row', 'deadlift', 'bicep curl', 'lat pulldown', 'face pull'],
  legs: ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl', 'calf raise', 'hip thrust'],
  cardio: ['run', 'jog', 'sprint', 'cardio', 'hiit', 'cycling', 'bike', 'treadmill', 'elliptical'],
  fullBody: ['clean', 'snatch', 'thruster', 'burpee', 'kettlebell swing', 'turkish get up']
}

export function ChatInterface() {
  const { user } = useUser()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "I'm here to help track your workouts. Try telling me about your workout, like: 'I did bench press 5×5 at 225lbs today'",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [suggestedInput, setSuggestedInput] = useState('')

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle suggested input appearing as user is typing
  useEffect(() => {
    if (input.toLowerCase().includes('bench') && !input.includes('×')) {
      setSuggestedInput('bench press 5×5 at 225lb')
    } else if (input.toLowerCase().includes('squat') && !input.includes('×')) {
      setSuggestedInput('squats 3×10 at 315lb')
    } else if (input.toLowerCase().includes('deadlift') && !input.includes('×')) {
      setSuggestedInput('deadlift 3×5 at 405lb')
    } else if (input.toLowerCase().includes('overhead') && !input.includes('×')) {
      setSuggestedInput('overhead press 5×5 at 135lb')
    } else {
      setSuggestedInput('')
    }
  }, [input])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSuggestedInput('')
    setIsLoading(true)

    // Simulate bot response with workout detection
    setTimeout(() => {
      let botResponse: Message

      // Enhanced workout detection
      if (detectWorkout(input)) {
        // Extract workout details using pattern matching
        const workout = parseWorkoutFromMessage(input)
        const workoutType = determineWorkoutType(workout)
        
        let responseContent = `I've detected a workout! Here's what I found:\n\n${formatWorkout(workout)}`
        
        if (workoutType) {
          responseContent += `\n\nThis looks like a ${workoutType} workout.`
        }
        
        responseContent += '\n\nWould you like me to save this workout?'
        
        botResponse = {
          id: Date.now().toString(),
          content: responseContent,
          sender: 'bot',
          timestamp: new Date(),
          workout
        }
      } else {
        botResponse = {
          id: Date.now().toString(),
          content: "I'm here to help track your workouts. Try telling me about your workout, like: 'I did bench press 5×5 at 225lbs today'",
          sender: 'bot',
          timestamp: new Date()
        }
      }

      setMessages(prev => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  const detectWorkout = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    
    // Check for exercise keywords
    const hasExercise = Object.values(WORKOUT_PATTERNS).some(patterns => 
      patterns.some(pattern => lowerMessage.includes(pattern))
    )
    
    // Check for set/rep patterns (e.g., 5x5, 3 sets of 10)
    const hasSetRep = /(\d+)\s*[x×]\s*(\d+)/.test(lowerMessage) || 
                      /(\d+)\s*sets?\s+of\s+(\d+)/.test(lowerMessage)
    
    // Check for weight patterns
    const hasWeight = /(\d+)\s*(lbs?|pounds?|kg|kilos?)/.test(lowerMessage)
    
    // Return true if we have an exercise AND either set/rep info or weight info
    return hasExercise && (hasSetRep || hasWeight)
  }

  const parseWorkoutFromMessage = (message: string): any => {
    const exercises = []
    const lowerMessage = message.toLowerCase()
    
    // Check for all possible exercises in the message
    for (const category of Object.values(WORKOUT_PATTERNS)) {
      for (const exercise of category) {
        if (lowerMessage.includes(exercise)) {
          const sets = extractSets(message, exercise)
          exercises.push({
            name: exercise.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            sets
          })
        }
      }
    }
    
    // If no specific exercises found, look for generic exercise words
    if (exercises.length === 0) {
      const genericExercises = ['exercise', 'workout', 'training', 'lift', 'movement']
      for (const generic of genericExercises) {
        if (lowerMessage.includes(generic)) {
          exercises.push({
            name: 'Workout',
            sets: extractSets(message, generic)
          })
          break
        }
      }
    }
    
    // If still no exercises found, create a generic one
    if (exercises.length === 0) {
      exercises.push({
        name: 'Workout',
        sets: [{ weight: 0, reps: 0 }]
      })
    }
    
    return {
      exercises,
      notes: message
    }
  }
  
  const extractSets = (message: string, exerciseName: string): any[] => {
    const lowerMessage = message.toLowerCase()
    
    // Try to find patterns like "5×5" or "5x5" (with different x characters)
    const setsPattern = /(\d+)\s*[x×]\s*(\d+)/i
    const setsMatch = lowerMessage.match(setsPattern)
    
    // Try to find patterns like "3 sets of 10 reps"
    const setsOfPattern = /(\d+)\s*sets?\s+of\s+(\d+)/i
    const setsOfMatch = lowerMessage.match(setsOfPattern)
    
    // Try to find weight patterns like "225lbs" or "100 kg"
    const weightPattern = /(\d+)\s*(lbs?|pounds?|kg|kilos?)/i
    const weightMatch = lowerMessage.match(weightPattern)
    
    // Extract the weight value
    const weight = weightMatch ? parseInt(weightMatch[1]) : 0
    
    // If we found a "5×5" pattern
    if (setsMatch) {
      const sets = parseInt(setsMatch[1])
      const reps = parseInt(setsMatch[2])
      
      return Array(sets).fill({
        weight,
        reps,
        rpe: null
      })
    }
    
    // If we found a "3 sets of 10 reps" pattern
    if (setsOfMatch) {
      const sets = parseInt(setsOfMatch[1])
      const reps = parseInt(setsOfMatch[2])
      
      return Array(sets).fill({
        weight,
        reps,
        rpe: null
      })
    }
    
    // Default to a single set if no pattern found
    return [{ 
      weight, 
      reps: 0,
      rpe: null
    }]
  }
  
  const determineWorkoutType = (workout: any): string | null => {
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
  
  const formatWorkout = (workout: any): string => {
    return workout.exercises.map((exercise: any) => {
      const setsInfo = exercise.sets.length > 0 
        ? `${exercise.sets.length} sets` +
          (exercise.sets[0].weight > 0 ? ` at ${exercise.sets[0].weight}lbs` : '') +
          (exercise.sets[0].reps > 0 ? ` for ${exercise.sets[0].reps} reps` : '')
        : 'No set details'
      
      return `• ${exercise.name}: ${setsInfo}`
    }).join('\n')
  }

  const handleSaveWorkout = async (workout: any) => {
    if (!user) {
      // If user is not authenticated, show a message and add a delay before redirecting
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "To save your workout, you'll need to log in first. I'll take you to the login page.",
        sender: 'bot',
        timestamp: new Date()
      }])
      
      // Navigate to the auth page after a short delay
      setTimeout(() => {
        router.push('/auth')
      }, 2000)
      return
    }
    
    setIsLoading(true)
    try {
      const workoutId = await saveWorkout(user.id, workout)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Great! I've saved your workout. You can view it in your workout history.",
        sender: 'bot',
        timestamp: new Date()
      }])
      
      // Navigate to the workout details
      setTimeout(() => {
        router.push(`/workouts/${workoutId}`)
      }, 1500)
    } catch (error) {
      console.error('Error saving workout:', error)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Sorry, I couldn't save your workout. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    handleSendMessage()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={
                message.sender === 'user' 
                  ? 'chat-message-user' 
                  : 'bg-[#1e1b4b] text-foreground rounded-2xl rounded-tl-none p-4 max-w-[80%]'
              }
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.workout && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => handleSaveWorkout(message.workout)}
                    className="bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Save Workout
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1e1b4b] text-foreground rounded-2xl rounded-tl-none p-4 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          <Card className="bg-[#1e1b4b] flex-shrink-0 cursor-pointer hover:bg-[#2d2a5d] transition-colors" onClick={() => handleQuickAction("I did bench press 5×5 at 225lbs today")}>
            <div className="flex items-center p-2">
              <Dumbbell className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">Log Bench Press</span>
              <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
            </div>
          </Card>
          <Card className="bg-[#1e1b4b] flex-shrink-0 cursor-pointer hover:bg-[#2d2a5d] transition-colors" onClick={() => handleQuickAction("I did squats 3×10 at 315lbs today")}>
            <div className="flex items-center p-2">
              <Dumbbell className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">Log Squats</span>
              <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
            </div>
          </Card>
          <Card className="bg-[#1e1b4b] flex-shrink-0 cursor-pointer hover:bg-[#2d2a5d] transition-colors" onClick={() => handleQuickAction("Show me my workout progress")}>
            <div className="flex items-center p-2">
              <BarChart2 className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">View Progress</span>
              <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
            </div>
          </Card>
          <Card className="bg-[#1e1b4b] flex-shrink-0 cursor-pointer hover:bg-[#2d2a5d] transition-colors" onClick={() => handleQuickAction("What workouts did I do this week?")}>
            <div className="flex items-center p-2">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">Weekly Summary</span>
              <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
            </div>
          </Card>
        </div>
        
        <div className="relative">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about your workout..."
              className="flex-1 bg-[#1e1b4b] border-[#2d2a5d] text-foreground"
              disabled={isLoading}
            />
            {suggestedInput && input && (
              <div className="absolute left-0 top-0 flex items-center h-full pl-[10px] pointer-events-none">
                <span className="text-muted-foreground opacity-0">{input}</span>
                <span className="text-muted-foreground">{suggestedInput.slice(input.length)}</span>
              </div>
            )}
            <Button 
              type="submit" 
              size="icon" 
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 