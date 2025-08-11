import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

	const user = await prisma.user.findUnique({ where: { email: credentials.email } });
	if (!user) return null;
	const ok = await bcrypt.compare(credentials.password, user.passwordHash);
	if (!ok) return null;
	return { id: user.id, email: user.email, role: user.role, name: user.name };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    }
  },
  session: { strategy: "jwt" }
});

export { handler as GET, handler as POST };
