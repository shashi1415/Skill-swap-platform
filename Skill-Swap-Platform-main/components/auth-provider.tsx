"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  location: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string
  profilePhoto?: string
  isPublic: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  isLoading: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token and get user data
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth-token")
        if (storedToken) {
          setToken(storedToken)

          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("auth-token")
            setToken(null)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("auth-token")
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("auth-token", data.token)
        return true
      } else {
        const errorData = await response.json()
        console.error("Login error:", errorData.error)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (userData: Partial<User> & { email: string; password: string }): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("auth-token", data.token)
        return true
      } else {
        const errorData = await response.json()
        console.error("Registration error:", errorData.error)
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("auth-token")
    }
  }

  const updateProfile = async (updatedData: any) => {
  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // So cookie is sent
      body: JSON.stringify(updatedData),
    })

    if (!res.ok) throw new Error("Failed to update")

    const data = await res.json()
    setUser(data.user) // update local user state
    return true
  } catch (err) {
    console.error("Profile update failed:", err)
    return false
  }
}


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
