"use client"
import { useRouter } from 'next/navigation'

import React, { useEffect } from 'react'
import { signIn, useSession } from "next-auth/react"

const Login = () => {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/Dashboard")
    }
  }, [session, router])

  return (
    <div className='text-white container mx-auto'>
      <h1 className="text-3xl font-bold text-center mt-10">Login / Signup to receive donations</h1>
      <div className="loginbuttons">
        <div className="flex flex-col gap-4 items-center min-h-screen p-10 my-5">
          <button
            type="button"
            onClick={() => signIn('github')}
            className="flex items-center w-72 justify-center text-black border bg-slate-50 rounded-lg shadow-md px-6 py-3 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="h-6 w-6 mr-2" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2 .37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.64 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Continue with GitHub
          </button>
          <p className="max-w-xs text-center text-sm text-slate-400">
            GitHub login is active for this showcase app. Connect with your creator profile and configure Razorpay settings from the dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
