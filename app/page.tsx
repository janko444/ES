export default function StudyWrapped() {
  const stats = [
    {
      title: 'Hours Studied',
      value: '428h',
      subtitle: 'You studied more than 92% of users.'
    },
    {
      title: 'Longest Streak',
      value: '37 Days',
      subtitle: 'Consistency carried your year.'
    },
    {
      title: 'Favorite Subject',
      value: 'Programming',
      subtitle: 'JavaScript owned your brain.'
    },
  ]

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden snap-y snap-mandatory">
      {/* HERO */}
      <section className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-700 via-black to-black snap-start px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
          Study Wrapped
        </h1>

        <p className="text-zinc-300 text-lg md:text-2xl max-w-2xl mb-10">
          Your entire learning journey in one beautiful recap.
        </p>

        <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition">
          Start Recap
        </button>
      </section>

      {/* STATS */}
      {stats.map((stat, index) => (
        <section
          key={index}
          className="h-screen snap-start flex items-center justify-center px-6"
        >
          <div className="max-w-4xl w-full text-center">
            <p className="uppercase tracking-[0.4em] text-zinc-500 mb-6">
              {stat.title}
            </p>

            <h2 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
              {stat.value}
            </h2>

            <p className="text-xl md:text-3xl text-zinc-300">
              {stat.subtitle}
            </p>
          </div>
        </section>
      ))}

      {/* FINAL SLIDE */}
      <section className="h-screen snap-start flex flex-col items-center justify-center bg-gradient-to-t from-purple-900 to-black text-center px-6">
        <h2 className="text-5xl md:text-7xl font-black mb-8">
          This was YOUR year.
        </h2>

        <p className="text-zinc-400 text-xl max-w-xl mb-10">
          Thousands of hours. Hundreds of sessions. One massive glow up.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition">
            Share Recap
          </button>

          <button className="border border-zinc-700 px-8 py-4 rounded-full font-bold hover:bg-zinc-900 transition">
            Replay
          </button>
        </div>
      </section>
    </main>
  )
}

