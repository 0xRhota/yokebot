"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useUser } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const { signUp } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await signUp(data.email, data.password)
      if (error) {
        setError(error.message || "Something went wrong. Please try again.")
      } else {
        setSuccess("Check your email for a confirmation link to complete your registration.")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign Up</h1>
        <p className="text-muted-foreground">Create an account to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-500 text-sm p-2 rounded-md">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto" 
            type="button"
            onClick={() => {
              const tabsElement = document.querySelector('[role="tablist"]');
              if (tabsElement) {
                const loginTab = tabsElement.querySelector('[value="login"]') as HTMLElement;
                if (loginTab) {
                  loginTab.click();
                }
              }
            }}
          >
            Login
          </Button>
        </p>
      </div>
    </div>
  )
} 