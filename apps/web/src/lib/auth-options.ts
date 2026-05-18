// ============================================
// KuliahOnlineIT - NextAuth Configuration
// ============================================
// Autentikasi menggunakan NextAuth + PocketBase

import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import PocketBase from "pocketbase";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

export const authOptions: AuthOptions = {
  providers: [
    // Login dengan email & password (via PocketBase)
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        try {
          const pb = new PocketBase(POCKETBASE_URL);

          // Authenticate ke PocketBase users collection
          const authData = await pb
            .collection("users")
            .authWithPassword(credentials.email, credentials.password);

          if (!authData?.record) {
            throw new Error("Email atau password salah");
          }

          const user = authData.record;

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email?.split("@")[0],
            image: user.avatar
              ? `${POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
              : null,
            pocketbaseToken: authData.token,
          } as {
            id: string;
            email: string;
            name: string;
            image: string | null;
            pocketbaseToken: string;
          };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Email atau password salah";
          console.error("Auth error:", message);
          throw new Error(message);
        }
      },
    }),

    // OAuth Google
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),

    // OAuth GitHub
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.pocketbaseToken = (user as any).pocketbaseToken;

        // Jika login via OAuth (Google/GitHub), daftarkan/sync ke PocketBase
        if (account.provider !== "credentials") {
          try {
            const pb = new PocketBase(POCKETBASE_URL);
              // Cek apakah user sudah ada di PocketBase
            const existingUsers = await pb
              .collection("users")
              .getList(1, 1, {
                filter: `email = "${user.email}"`,
              });

            if (existingUsers.items.length === 0) {
              // Buat user baru di PocketBase
              const newUser = await pb.collection("users").create({
                email: user.email,
                name: user.name,
                avatar: user.image,
                emailVisibility: true,
                verified: true,
              });
              token.pocketbaseId = newUser.id;
            } else {
              token.pocketbaseId = existingUsers.items[0].id;
            }
          } catch (error) {
            console.error("Failed to sync OAuth user to PocketBase:", error);
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const user = session.user as Record<string, unknown>;
        user.id = token.id || token.sub;
        user.pocketbaseToken = token.pocketbaseToken;
        user.pocketbaseId = token.pocketbaseId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  secret: process.env.AUTH_SECRET,
};
