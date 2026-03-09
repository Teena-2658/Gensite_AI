import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await axios.post(
            'http://localhost:8000/api/auth/google',
            {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              avatar: firebaseUser.photoURL,
            },
            { withCredentials: true }
          )
          setUser(response.data.user)
        } catch (err) {
          console.error('Backend sync failed:', err)
          setUser({
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
            credits: 0,
            plan: 'free',
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

const logout = async () => {
  try {
    // Step 1: Sign out from Firebase (clears local auth listener)
    await auth.signOut();

    // Step 2: Tell backend to clear the JWT cookie
    await axios.post(
      `${serverUrl}/api/auth/logout`,   // ← use same serverUrl you already have
      {},                               // empty body
      { withCredentials: true }         // MUST send cookies
    );

    console.log("Logout successful — Firebase + cookie cleared");
  } catch (err) {
    console.error("Logout failed:", err);
    // Still clear Firebase even if backend call fails
    await auth.signOut();
  }
};

  const value = { user, loading, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}