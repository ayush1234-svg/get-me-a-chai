"use client"
import Link from "next/link"
import { useSession, signOut, } from "next-auth/react"
import { useState } from "react"
import UserSearch from "./UserSearch"

const Navbar = () => {
  const { data: session } = useSession()
  const [Showdropdown, setShowdropdown] = useState(false)


  return (
    <div className='bg-gray-900 text-white flex min-h-14 flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:px-4 sm:py-0'>
      <Link href={"/"} className="logo flex shrink-0 items-center justify-center gap-2">
        <img src="/tea.gif" alt="Tea Logo" width={45} className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
        <span className='font-semibold hidden sm:inline'>Get Me A Tea</span>
      </Link>

      <UserSearch />

      <div className="relative flex shrink-0 items-center gap-1 sm:gap-2">
        {session && <><button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" onClick={() => setShowdropdown(!Showdropdown)} className="inline-flex items-center justify-center rounded-xl border border-blue-700 bg-blue-700 px-2 py-1.5 text-sm font-medium leading-5 text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:px-4 sm:py-2.5" type="button">
          <span className="hidden max-w-28 truncate min-[401px]:inline sm:max-w-48">Welcome {session.user.email}</span>

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
            className="rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 px-2 py-1.5 text-sm font-medium leading-5 text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-blue-300 sm:px-6 sm:py-3"
          >
            Log out
          </button>
        )}




        {!session &&
          <Link href="/login" className="text-white hover:text-gray-300">
            <button
              type="button"



              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base rounded-xl text-sm px-4 py-2 text-center leading-5 sm:px-6"
            >
              Login
            </button>
          </Link>}
      </div>
    </div>
  )
}

export default Navbar
