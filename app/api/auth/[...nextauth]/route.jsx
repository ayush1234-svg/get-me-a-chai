import NextAuth from 'next-auth'
import GitHubProvider from "next-auth/providers/github"
import connectDb from '../../../db/connectDb'
import User from '../../../models/User'

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      if (account?.provider === "github") {
        token.id = token.sub
        token.username = profile?.login || token.username
      }

      if (trigger === "update" && session?.username) {
        token.username = session.username
      }

      if (!token.username && token.email) {
        await connectDb()
        const dbUser = await User.findOne({ email: token.email }).lean()
        token.username = dbUser?.username || token.username
      }

      return token
    },

    
    async session({ session, token }) {
      session.user.id = token.id
      session.user.username = token.username
      return session
    },
    
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "github") {
          await connectDb()

          const email = user.email || profile?.email
          console.log("Attempting to sign in with email:", email)
          
          if (!email) {
            console.error("No email provided by GitHub")
            return false
          }

          // Check if user exists, create if not
          let dbUser = await User.findOneAndUpdate(
            { email },
            {
              email,
              username: profile?.login || user.name || email.split("@")[0],
            },
            { upsert: true, returnDocument: 'after' }
          )
          
          console.log("User signed in:", dbUser.email)
        }
        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
  }
})

export { handler as GET, handler as POST }
