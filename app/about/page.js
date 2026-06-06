import Link from "next/link";

export const metadata = {
  title: "About | Get Me A Chai",
  description:
    "Learn how Get Me A Chai helps creators accept support, build momentum, and stay connected with their biggest supporters.",
};

const highlights = [
  {
    title: "Creator-first setup",
    description:
      "Create a profile, share your story, and start receiving direct support without a complicated onboarding flow.",
  },
  {
    title: "Meaningful fan support",
    description:
      "Supporters can contribute with a message, making every payment feel personal instead of transactional.",
  },
  {
    title: "Built for consistency",
    description:
      "Small recurring acts of support help creators keep shipping videos, art, open-source work, and community projects.",
  },
];

const steps = [
  "Set up your page with your name, profile image, cover image, and payment details.",
  "Share your unique profile link with your audience across social platforms and communities.",
  "Receive support from fans who want to fund the work they already enjoy.",
];

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-16 md:px-10 md:py-20">
      <section className="grid gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm md:grid-cols-[1.2fr_0.8fr] md:p-12">
        <div className="flex flex-col justify-center gap-6">
          <span className="w-fit rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
            About Get Me A Chai
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              A simple way for fans to fuel the work they love.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Get Me A Chai is a creator support platform where audiences can
              contribute directly and leave encouraging messages. It is built
              for artists, developers, educators, writers, and independent
              builders who want a cleaner way to accept support online.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white transition hover:scale-[1.01]"
            >
              Start your page
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-white/15 bg-slate-950/40 px-6 py-3 font-semibold text-slate-100 transition hover:bg-slate-900/80"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/80">
              Mission
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              Help creators stay independent through direct community support.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
              What supporters do
            </p>
            <p className="mt-3 text-slate-200">
              Donate, send a message, and become part of the creator’s progress.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
              What creators get
            </p>
            <p className="mt-3 text-slate-200">
              A public profile, clearer momentum, and a direct line to their
              biggest supporters.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-slate-950/50 p-6"
          >
            <h2 className="text-2xl font-bold text-white">{item.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-cyan-950/30 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            From profile setup to real supporter momentum.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            The platform is intentionally lightweight. Creators spend less time
            configuring tools and more time sharing the work their audience
            actually wants to support.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-lg font-bold text-cyan-200">
                {index + 1}
              </div>
              <p className="leading-7 text-slate-200">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-8 text-center md:p-10">
        <h2 className="text-3xl font-black text-white">
          Ready to let your community support your work?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
          Set up your creator page, share your link, and make it easy for your
          supporters to back what you are building.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Create your page
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Explore homepage
          </Link>
        </div>
      </section>
    </div>
  );
}
