// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { adminDb } from "./firebaseAdmin"; // تم تعديل المسار لأنه أصبح في نفس المجلد

// التأكد من وجود secret
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide NEXTAUTH_SECRET environment variable");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
        }

        try {
          const usersRef = adminDb.collection("users");
          const snapshot = await usersRef
            .where("email", "==", credentials.email)
            .limit(1)
            .get();

          if (snapshot.empty) {
            throw new Error("المستخدم غير موجود");
          }

          const userDoc = snapshot.docs[0];
          const userData = userDoc.data();

          // ✅ التحقق من وجود حقل كلمة المرور (لحل مشكلة الحسابات بدون كلمة مرور)
          if (!userData.password) {
            console.warn(`User ${credentials.email} has no password field`);
            throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            userData.password
          );
          if (!isValid) {
            throw new Error("كلمة المرور غير صحيحة");
          }

          if (!userData.emailVerified) {
            throw new Error("يرجى تفعيل حسابك عبر البريد الإلكتروني أولاً");
          }

          return {
            id: userDoc.id,
            email: userData.email,
            name: userData.name || "",
            role: userData.role || "client",
          };
        } catch (error: unknown) {
          console.error("Authorize error:", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          } else {
            throw new Error("حدث خطأ غير متوقع");
          }
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};