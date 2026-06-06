"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { searchUsers } from "../actions/useractions"

const UserSearch = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await searchUsers(query)
        // Handle both array and object response formats
        const users = Array.isArray(response) ? response : (response?.data || [])
        setResults(users)
        setShowDropdown(true)
      } catch (err) {
        console.error(err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const goToUser = (username) => {
    setQuery("")
    setResults([])
    setShowDropdown(false)
    router.push(`/${username}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const exactMatch = results.find(
      (user) => user.username.toLowerCase() === trimmed.toLowerCase()
    )

    if (exactMatch) {
      goToUser(exactMatch.username)
      return
    }

    if (results.length === 1) {
      goToUser(results[0].username)
      return
    }

    setShowDropdown(true)
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          placeholder="Search creators to donate..."
          className="w-full rounded-xl bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
        </button>
      </form>

      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 shadow-lg overflow-hidden">
          {loading && (
            <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
          )}

          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No creators found</p>
          )}

          {!loading &&
            results.map((user, index) => (
              <button
                key={`${user.username}-${index}`}
                type="button"
                onClick={() => goToUser(user.username)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors"
              >
                <img
                  src={user.profilePicture || "/avatar.gif"}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">@{user.username}</p>
                  {user.name && (
                    <p className="text-xs text-gray-400">{user.name}</p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export default UserSearch
