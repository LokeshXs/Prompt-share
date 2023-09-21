import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: import.meta.env.VITE_GOOGLE_ID,
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    }),
  ],

  async session({ session }) {
    const sessionUser = await User.findOne({
      email: session.user.email,
    });

    session.user.id = sessionUser._id.toString();
  },

  async signIn({ profile }) {
    try {
      await connectToDB();

      // check if a user already exists
      const userExist = await User.findOne({
        email: profile.email,
      });
      // if not, create user a new user

      if (!userExist) {
        await User.create({
          email: profile.email,
          username: profile.name.replace(" ", "").tolowerCase(),
          image: profile.picture,
        });
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

export { handler as GET, handler as POST };
