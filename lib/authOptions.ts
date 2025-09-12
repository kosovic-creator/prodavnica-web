import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          if (!user) throw new Error("Korisnik sa ovom email adresom ne postoji");
          if (!user.emailVerified) throw new Error("Email adresa nije verifikovana.");
          if (await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? undefined, // Ensure name is string | undefined
              role: user.role
            };
          } else {
            throw new Error("Neispravna lozinka");
          }
        } catch (error) {
          throw error;
        }
      }
    })
  ],
  session: { strategy: "jwt" as 'jwt' },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) token.role = user.role;
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};

export { authOptions };