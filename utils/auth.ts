import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import connectDB from "./db";
import UserModel from "@/models/User";

export const AuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password");
          }
          const user = await UserModel.findOne({
            email: credentials.email,
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error(
              "This account uses social login. Please sign in with a OAuth provider",
            );
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user?._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "azure-ad") {
        try {
          await connectDB();
          const email =
            user.email ||
            (profile as any)?.email ||
            (profile as any)?.preferred_username;

          let avatarURL: string | null = null;
          if (account.provider === "azure-ad") {
            if (account.access_token) {
              // Try multiple endpoints — personal accounts (outlook.com/live.com)
              // return 404 on the base endpoint if no photo is set.
              const photoEndpoints = [
                "https://graph.microsoft.com/v1.0/me/photo/$value",
                "https://graph.microsoft.com/v1.0/me/photos/96x96/$value",
                "https://graph.microsoft.com/v1.0/me/photos/48x48/$value",
              ];

              let successRes: Response | null = null;
              for (const endpoint of photoEndpoints) {
                try {
                  const res = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${account.access_token}` },
                  });
                  if (res.ok) {
                    successRes = res;
                    break;
                  }
                } catch (fetchErr) {
                  console.warn(`Photo fetch failed for ${endpoint}:`, fetchErr);
                }
              }

              if (successRes) {
                const buffer = await successRes.arrayBuffer();
                const base64 = Buffer.from(buffer).toString("base64");
                const mimeType = successRes.headers.get("content-type") || "image/jpeg";
                avatarURL = `data:${mimeType};base64,${base64}`;
              } else {
                // Fallback: NextAuth may populate user.image from the token's picture claim
                avatarURL = user.image ?? null;
              }
            }
          } else {
            avatarURL = user.image ?? null;
          }

          // Upsert: create new user or update avatar for existing users
          await UserModel.findOneAndUpdate(
            { email: email },
            {
              $setOnInsert: {
                name: user.name || profile?.name || email?.split("@")[0],
                email: email,
              },
              ...(avatarURL ? { $set: { avatar: avatarURL } } : {}),
            },
            { upsert: true, new: true },
          );
        } catch (error) {
          console.error("OAuth user creation error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // console.log("Token in Auth:",token)
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      // console.log("session in Auth:",session)
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/error",
  },
};
