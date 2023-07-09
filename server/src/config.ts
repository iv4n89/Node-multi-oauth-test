import { PrismaClient, User } from "@prisma/client";
import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import { OauthUser } from "./interfaces";

// export const CLIENT_URL = process.env.CLIENT_URL!;
// export const SERVER_PORT = process.env.SERVER_PORT!;
// export const JWT_SECRET = process.env.JWT_SECRET!;
// export const COOKIE_NAME = process.env.COOKIE_NAME!;
// export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
// export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;

export const {
  CLIENT_URL,
  SERVER_PORT,
  JWT_SECRET,
  COOKIE_NAME,
  TWITTER_CLIENT_ID,
  TWITTER_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} = process.env;

export const TOKEN_URLS = {
    twitter: 'https://api.twitter.com/2/oauth2/token',
    google: '',
    microsoft: '',
    facebook: '',
};

export const ME_URLS = {
    twitter: 'https://api.twitter.com/2/users/me',
    google: '',
    microsoft: '',
    facebook: ''
};

export const prisma = new PrismaClient();

type OauthTypeUser = "twitter" | "google" | "microsoft" | "facebook" | "local";

export function upsertUser(user: OauthUser, type: OauthTypeUser = "local") {
  return prisma.user.upsert({
    create: {
      username: user.username,
      id: user.id,
      name: user.name,
      type,
    },
    update: {
      id: user.id,
    },
    where: {
      id: user.id,
    },
  });
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export function addCookieToRes(
  res: Response,
  { id, type }: User,
  accessToken: string
) {
  const token = jwt.sign(
    {
      id,
      accessToken,
      type,
    },
    JWT_SECRET!
  );

  res.cookie(COOKIE_NAME!, token, {
    ...cookieOptions,
    expires: new Date(Date.now() + 7200 * 1000),
  });
}

export function getBasicAuth(type: OauthTypeUser) {
    let authString = '';
    switch (type) {
        case 'twitter':
            authString = `${ TWITTER_CLIENT_ID! }:${ TWITTER_CLIENT_SECRET! }`;
            break;
        case 'google':
            authString = `${ GOOGLE_CLIENT_ID! }:${ GOOGLE_CLIENT_SECRET! }`;
            break;
        case 'microsoft':
            authString = `${ MICROSOFT_CLIENT_ID! }:${ MICROSOFT_CLIENT_SECRET! }`;
            break;
        case 'facebook':
            authString = `${ FACEBOOK_CLIENT_ID! }:${ FACEBOOK_CLIENT_SECRET! }`;
            break;
        default:
            break;
    }

    return Buffer.from(authString, 'utf-8').toString('base64');
}
