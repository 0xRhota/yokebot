"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Calendar, BarChart2, Dumbbell, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { parseWorkout } from "@/lib/workout-parser"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  isWorkoutSummary?: boolean
  parsedWorkout?: any
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hi! I'm your workout tracker. Just tell me what you did today in your own words, and I'll remember everything. No setup needed.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot response with workout summary
    setTimeout(() => {
      const isWorkoutMessage =
        input.toLowerCase().includes("did") ||
        input.toLowerCase().includes("sets") ||
        input.toLowerCase().includes("reps") ||
        input.toLowerCase().includes("workout")

      if (isWorkoutMessage) {
        // Parse the workout message
        const parsedWorkout = parseWorkout(input)

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Got it! I've logged your workout:",
          sender: "bot",
          timestamp: new Date(),
        }

        const workoutSummary: Message = {
          id: (Date.now() + 2).toString(),
          content: "",
          sender: "bot",
          timestamp: new Date(),
          isWorkoutSummary: true,
          parsedWorkout,
        }

        setMessages((prev) => [...prev, botResponse, workoutSummary])
        setIsTyping(false)
      } else {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm here to track your workouts. Tell me what exercises you did today!",
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      }
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setInput("Did 4 sets of squats at 225 pounds, 8 reps each")
      }, 2000)
    }
  }

  const renderWorkoutSummary = (workout: any) => {
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      return <p>No workout data available</p>
    }

    return (
      <div className="space-y-3">
        {workout.exercises.map((exercise: any, index: number) => (
          <div key={index} className="space-y-2">
            <div className="font-medium text-primary">{exercise.name}</div>
            <div className="grid grid-cols-3 gap-2">
              {exercise.sets.map((set: any, setIndex: number) => (
                <div
                  key={setIndex}
                  className="bg-card/50 backdrop-blur-sm p-2 rounded-lg border border-border/50 text-center"
                >
                  <div className="text-sm font-medium">{set.weight} lbs</div>
                  <div className="text-xs text-muted-foreground">{set.reps} reps</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>Estimated calories: {workout.calories || "320"} kcal</span>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="chat" className="flex flex-col h-full" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex-1 flex flex-col">
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex-1">
          <ScrollArea className="flex-1 p-4 pb-20">
            <div className="space-y-6 max-w-md mx-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Yokebot" />
                        <AvatarFallback className="bg-primary text-primary-foreground">YB</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[80%]",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.isWorkoutSummary
                            ? "bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
                            : "bg-muted text-foreground",
                      )}
                    >
                      {message.isWorkoutSummary ? (
                        renderWorkoutSummary(message.parsedWorkout)
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Yokebot" />
                    <AvatarFallback className="bg-primary text-primary-foreground">YB</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce"></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t backdrop-blur-sm bg-background/80 fixed bottom-16 left-0 right-0 md:bottom-0">
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me about your workout..."
                className="flex-1 rounded-full border-primary/20 focus-visible:ring-primary/50 bg-card/50 backdrop-blur-sm"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      className={cn("rounded-full transition-all duration-300", isRecording && "animate-pulse")}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={handleSend}
                      className="rounded-full bg-primary hover:bg-primary/90"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-4 m-0">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Workout History</h2>
            <p className="text-muted-foreground">Your workout history will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="flex-1 p-4 m-0">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Progress Tracking</h2>
            <p className="text-muted-foreground">Your workout progress will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="flex-1 p-4 m-0">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Workout Plans</h2>
            <p className="text-muted-foreground">Your workout plans will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="flex-1 p-4 m-0">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <p className="text-muted-foreground">Your profile information will appear here.</p>
          </div>
        </TabsContent>
      </div>

      <TabsList className="fixed bottom-0 left-0 right-0 h-16 grid grid-cols-5 rounded-none border-t bg-background/80 backdrop-blur-sm z-10">
        <TabsTrigger
          value="chat"
          className="flex flex-col items-center justify-center data-[state=active]:bg-muted/50 rounded-none"
        >
          <Send className="h-5 w-5" />
          <span className="text-xs mt-1">Chat</span>
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex flex-col items-center justify-center data-[state=active]:bg-muted/50 rounded-none"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">History</span>
        </TabsTrigger>
        <TabsTrigger
          value="progress"
          className="flex flex-col items-center justify-center data-[state=active]:bg-muted/50 rounded-none"
        >
          <BarChart2 className="h-5 w-5" />
          <span className="text-xs mt-1">Progress</span>
        </TabsTrigger>
        <TabsTrigger
          value="plans"
          className="flex flex-col items-center justify-center data-[state=active]:bg-muted/50 rounded-none"
        >
          <Dumbbell className="h-5 w-5" />
          <span className="text-xs mt-1">Plans</span>
        </TabsTrigger>
        <TabsTrigger
          value="profile"
          className="flex flex-col items-center justify-center data-[state=active]:bg-muted/50 rounded-none"
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
} 