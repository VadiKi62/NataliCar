import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hashSync } from "bcrypt";
import { COMPANY_ID } from "@config/company";
import { ROLE, ROLE_NAME } from "@models/user";

// Pre-hash the password synchronously
const hashedPassword = hashSync("11111111", 10);
const hashedPasswordSuperadmin = hashSync("1111111111", 10);

const adminUsers = [{
  id: "admin",
  name: "Admin",
  email: "admin@gmail.com",
  password: hashedPassword,
  isAdmin: true,
  companyId: COMPANY_ID,
  role: ROLE.ADMIN,
},{
  id: "superadmin",
  name: "Superadmin",
  email: "cars-admin@bbqr.site",
  password: hashedPasswordSuperadmin,
  isAdmin: true,
  companyId: COMPANY_ID,
  role: ROLE.SUPERADMIN,
}]

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
        console.log("🔐 Authorize called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ No credentials provided");
          return null;
        }

        // 1️⃣ ищем пользователя по email
        const adminUser = adminUsers.find(
          (user) => user.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!adminUser) {
          console.log("❌ No admin user found for email:", credentials.email);
          return null;
        }

        console.log("✅ Admin user found:", adminUser.name);

        // 2️⃣ проверяем пароль
        try {
          // ВАЖНО: compare принимает (plainPassword, hashedPassword)
          const isValid = await compare(
            credentials.password,
            adminUser.password
          );

          if (!isValid) {
            console.log("❌ Invalid password for user:", adminUser.email);
            return null;
          }

          console.log("✅ Password valid, returning user:", adminUser.email);

          return {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            isAdmin: true,

            // 🔥 ВАЖНО: role должен быть числом (0 или 1) для новой архитектуры
            role: adminUser.role,                 // 0 (ADMIN) или 1 (SUPERADMIN)
            roleId: adminUser.role,               // для обратной совместимости

            companyId: adminUser.companyId,
          };
        } catch (error) {
          console.error("❌ bcrypt compare error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;

        // role должен быть числом (0 или 1) для новой архитектуры
        token.role = user.role;       // 0 (ADMIN) или 1 (SUPERADMIN)
        token.roleId = user.roleId;  // для обратной совместимости

        token.companyId = user.companyId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;

        // role должен быть числом (0 или 1) для новой архитектуры
        session.user.role = token.role;       // 0 (ADMIN) или 1 (SUPERADMIN)
        session.user.roleId = token.roleId;   // для обратной совместимости

        session.user.companyId = token.companyId;
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
