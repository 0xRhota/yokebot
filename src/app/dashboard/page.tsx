'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/auth-context'
import { getWorkouts } from '@/lib/workout-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Plus, Calendar, ArrowRight, BarChart2, Activity, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default function DashboardPage() {
  const { user } = useUser()
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'stats'>('chat')

  useEffect(() => {
    async function loadWorkouts() {
      if (!user) return
      
      try {
        const workoutData = await getWorkouts(user.id)
        setRecentWorkouts(workoutData.slice(0, 3)) // Get only the 3 most recent workouts
      } catch (error) {
        console.error('Error loading workouts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkouts()
  }, [user])

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatInterface />
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold mb-6">Workout Stats</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Current Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">62.5</span>
                    <span className="text-sm ml-1">kg</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs ml-2 text-muted-foreground">2.0 kg to goal</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Workouts This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{recentWorkouts.length}</span>
                    <span className="text-sm ml-1">/ 5 goal</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                      <div key={day} className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground">{day}</div>
                        <div className={`h-8 w-1 mt-1 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Today's Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">18,452</span>
                    <span className="text-sm ml-1">steps</span>
                  </div>
                  <div className="chart-container mt-2">
                    <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <path 
                        d="M0,80 C30,70 60,20 90,40 C120,60 150,30 180,20 C210,10 240,30 270,20 C300,10 330,30 360,20" 
                        className="chart-line primary-line"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Recent Workouts</h2>
            <div className="grid gap-4">
              {isLoading ? (
                <div className="animate-pulse py-4">Loading workouts...</div>
              ) : recentWorkouts.length === 0 ? (
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
                recentWorkouts.map((workout) => (
                  <Link key={workout.id} href={`/workouts/${workout.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">
                              Workout on {format(new Date(workout.date), 'MMM d, yyyy')}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {workout.notes || 'No notes for this workout'}
                            </p>
                          </div>
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden">
        <div className="flex justify-around p-2">
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'ghost'} 
            className="flex-1" 
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeTab === 'stats' ? 'default' : 'ghost'} 
            className="flex-1" 
            onClick={() => setActiveTab('stats')}
          >
            <Activity className="h-5 w-5" />
          </Button>
          <Link href="/workouts/new" className="flex-1">
            <Button variant="ghost" className="w-full">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 