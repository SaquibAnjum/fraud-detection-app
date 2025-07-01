import { create } from "zustand"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "analyst"
  token: string
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: "admin" | "analyst") => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  login: async (email: string, password: string, role: "admin" | "analyst") => {
    set({ isLoading: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock JWT token generation
    const mockToken = btoa(JSON.stringify({ email, role, exp: Date.now() + 24 * 60 * 60 * 1000 }))

    const user: User = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email,
      role,
      token: mockToken,
    }

    // Store in localStorage for persistence
    localStorage.setItem("fraud_platform_user", JSON.stringify(user))

    set({ user, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem("fraud_platform_user")
    set({ user: null })
  },
}))

// Auto-login from localStorage
if (typeof window !== "undefined") {
  const storedUser = localStorage.getItem("fraud_platform_user")
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      // Check if token is still valid (simple expiration check)
      const tokenData = JSON.parse(atob(user.token))
      if (tokenData.exp > Date.now()) {
        useAuthStore.setState({ user })
      } else {
        localStorage.removeItem("fraud_platform_user")
      }
    } catch (error) {
      localStorage.removeItem("fraud_platform_user")
    }
  }
}
