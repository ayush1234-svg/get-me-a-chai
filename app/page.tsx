
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex min-h-[22rem] justify-center flex-col gap-3 items-center px-5 py-8 text-sm text-white sm:min-h-[30rem] sm:gap-4 sm:py-10 md:px-0 md:text-base">
        <div className="flex items-center justify-center gap-3 text-center text-2xl font-bold sm:gap-6 sm:text-3xl md:gap-20 md:text-5xl">Get Me a Tea <span><img className="invertImg" src="/tea.gif" width={64} alt="" /></span></div>
        <p className="max-w-xl text-center md:text-left">
          A crowdfunding platform for creators to fund their projects.

        </p>
        <p className="max-w-xl text-center md:text-left">

          A place where your fans can financially support you. Unleash the power of your fans and get your projects funded.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={"/login"}>

            <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Start Here</button>
          </Link>

          <Link href="/about">
            <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Read More</button>
          </Link>

        </div>
      </div>
      <div className="bg-white h-1 opacity-10">
      </div>

      <div className="container mx-auto px-5 py-16 text-white sm:px-8 md:pb-32 md:pt-14">
        <h2 className="mb-8 text-center text-xl font-bold sm:mb-10 sm:text-3xl md:mb-14">Your Fans can buy you a Tea</h2>
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-5">
          <div className="item space-y-3 flex flex-col items-center justify-center">
            <img className="bg-slate-400 rounded-full p-2 text-black" width={72} src="/man.gif" alt="" />
            <p className="text-center text-sm font-bold">Fans want to help</p>
            <p className="text-center text-sm">Your fans are available to support you</p>
          </div>
          <div className="item space-y-3 flex flex-col items-center justify-center">
            <img className="bg-slate-400 rounded-full p-2 text-black" width={72} src="/coin.gif" alt="" />
            <p className="text-center text-sm font-bold">Fans want to contribute</p>
            <p className="text-center text-sm">Your fans are willing to contribute financially</p>
          </div>
          <div className="item space-y-3 flex flex-col items-center justify-center">
            <img className="bg-slate-400 rounded-full p-2 text-black" width={72} src="/group.gif" alt="" />
            <p className="text-center text-sm font-bold">Fans want to collaborate</p>
            <p className="text-center text-sm">Your fans are ready to collaborate with you</p>
          </div>
        </div>
      </div>
      <div className="bg-white h-1 opacity-10">
      </div>

      <div className="container mx-auto flex flex-col items-center justify-center px-5 py-16 text-white sm:px-8 md:pb-32 md:pt-14">
        <h2 className="mb-5 text-center text-xl font-bold sm:text-3xl md:mb-14">Learn more about us</h2>
        <p className="mb-6 max-w-2xl text-center text-sm text-gray-400 sm:mb-8">Watch this tutorial to learn how crowdfunding platforms help creators fund their projects</p>
        {/* Responsive youtube embed  */}
        <div className="flex aspect-video w-full max-w-3xl items-center justify-center">
          <iframe className="w-full h-full" src="https://www.youtube.com/embed/M6msAzqzWh0?si=hBVsl8ua2JVz1_pI" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>

      </div>
    </>
  );
}
