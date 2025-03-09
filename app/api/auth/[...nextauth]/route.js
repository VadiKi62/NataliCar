import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
// Pre-hash the password
const hashedPassword = await hash("11111111", 10);

const adminUser = {
  id: "admin",
  name: "Admin",
  email: "admin@gmail.com",
  password: hashedPassword,
  isAdmin: true,
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        if (credentials.email === adminUser.email) {
          try {
            console.log(
              "from route auth is email right",
              credentials.email === adminUser.email
            );
            console.log("adminUser.password", adminUser.password);
            console.log("credentials.password", credentials.password);
            const isValid = await compare(
              credentials.password,
              adminUser.password
            );
            console.log("isValid", isValid);
            if (isValid) {
              return {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
              };
            }
          } catch (error) {
            console.error("bcrypt compare error:", error);
            return null;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
