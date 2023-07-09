import { Request, Response } from 'express';
import { google } from 'googleapis';
import { addCookieToRes, CALLBACKS, CLIENT_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, upsertUser } from './config';

const googleOauthClient = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    CALLBACKS.google,
);

export const googleLoginRedirectUrl = googleOauthClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile'],
});

let auth = false;

export async function getGoogleToken(code: string) {
    try {
        const { tokens } = await googleOauthClient.getToken(code);
        googleOauthClient.setCredentials(tokens);
        auth = true;
        return tokens;
    } catch (err) {
        return null;
    }
}

export async function getGoogleUser() {
    const googleOauth2 = google.oauth2({ version: 'v2', auth: googleOauthClient });

    return await googleOauth2.userinfo.v2.me.get();
}

export async function googleOauth(req: Request<any, any, any, { code: string }>, res: Response) {
    const code = req.query.code;

    const googleOauthToken = await getGoogleToken(code);
    console.log('google token', googleOauthToken);

    if (!googleOauthToken) {
        return res.redirect(CLIENT_URL!);
    }

    const googleOauth2 = google.oauth2({ version: 'v2', auth: googleOauthClient });

    const googleOauthUser = await googleOauth2.userinfo.v2.me.get();
    console.log('google user', googleOauthUser);

    if (!googleOauthUser) {
        return res.redirect(CLIENT_URL!);
    }

    const user = await upsertUser({
        id: googleOauthUser.data.id as string,
        name: googleOauthUser.data.name as string,
        username: googleOauthUser.data.email as string,
    }, 'google');

    addCookieToRes(res, user, googleOauthToken?.access_token!);

    return res.redirect(CLIENT_URL!);
}
