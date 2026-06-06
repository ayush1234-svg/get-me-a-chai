"use client"
import Link from "next/link"
import { useSession, signOut, } from "next-auth/react"
import { useState } from "react"
import UserSearch from "./UserSearch"

const Navbar = () => {
  const { data: session } = useSession()
  const [Showdropdown, setShowdropdown] = useState(false)


  return (
    <div className='bg-gray-900 text-white flex justify-between px-4 h-14 items-center gap-2'>
      <Link href={"/"} className="logo flex shrink-0 items-center justify-center gap-2">
        <img src="/tea.gif" alt="Tea Logo" width={45} />
        <span className='font-semibold hidden sm:inline'>Get Me A Tea</span>
      </Link>

      <UserSearch />

      <div className="flex shrink-0 items-center gap-2 relative">
        {session && <><button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" onClick={() => setShowdropdown(!Showdropdown)} className="inline-flex mx-3 rounded-xl items-center justify-center text-white bg-blue-700 border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 shadow-sm font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" type="button">
          Welcome {session.user.email}

          <svg className="w-4 h-4 ms-1.5 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
          </svg>
        </button>

          {/* Dropdown menu */}
          <div id="dropdown" onBlur={()=> setTimeout(() => {setShowdropdown(false)
            
          }, 100)} className={`z-10 ${Showdropdown ? '' : 'hidden'}  absolute top-13 right-32 rounded-lg  border bg-gray-800 rounded-base shadow-lg w-44 text-gray-100 `}>
            <ul className="p-2 text-sm font-medium" aria-labelledby="dropdownDefaultButton">
              <li>
                <Link href="/Dashboard" className="inline-flex items-center w-full p-2 hover:bg-gray-700 rounded">Dashboard</Link>
              </li>

              <li>
                <Link href={`/${session.user.username || session.user.name}`} className="inline-flex items-center w-full p-2 hover:bg-gray-700 rounded">Your Profile</Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center w-full p-2 hover:bg-gray-700 rounded"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div></>}
        {session && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-xl text-sm px-6 py-3 text-center leading-5"
          >
            Log out
          </button>
        )}




        {!session &&
          <Link href="/login" className="text-white hover:text-gray-300">
            <button
              type="button"



              className="text-white  bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base rounded-xl text-sm px-6 py-2 text-center leading-5"
            >
              Login
            </button>
          </Link>}
      </div>
    </div>
  )
}

export default Navbar
