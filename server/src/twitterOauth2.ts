import axios from "axios";
import { Request, Response } from "express";
import { URLSearchParams } from "url";
import { addCookieToRes, CLIENT_URL, getBasicAuth, ME_URLS, TOKEN_URLS, TWITTER_CLIENT_ID, upsertUser } from "./config";
import { OauthUser } from "./interfaces";


export const twitterOauthTokenParams = {
    client_id: TWITTER_CLIENT_ID!,
    code_verifier: '8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA',
    redirect_uri: 'http://www.localhost:3001/oauth/twitter',
    grant_type: 'authorization_code',
};

type TwitterTokenResponse = {
    token_type  : 'bearer';
    expires_in  : 7200;
    access_token: string;
    scope       : string;
}

export async function getTwitterOauthToken(code: string) {
    try {
        const res = await axios.post<TwitterTokenResponse>(
            TOKEN_URLS.twitter,
            new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-urlencoded',
                    Authorization: `Basic ${ getBasicAuth('twitter') }`
                }
            }
        );

        return res.data;
    } catch(err) {
        return null;
    }
}

export async function getTwitterUser(accessToken: string): Promise<OauthUser | null> {
    try {
        const res = await axios.get<{ data: OauthUser }>(ME_URLS.twitter, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ accessToken }`
            }
        });

        return res.data.data ?? null;
    } catch (err) {
        return null;
    }
}

export async function twitterOauth(req: Request<any, any, any, { code: string }>, res: Response) {
    const code = req.query.code;

    const twitterOauthToken = await getTwitterOauthToken(code);
    console.log('token', twitterOauthToken);

    if (!twitterOauthToken) {
        return res.redirect(CLIENT_URL!);
    }

    const twitterUser = await getTwitterUser(twitterOauthToken.access_token);
    console.log('user', twitterUser);

    if (!twitterUser) {
        return res.redirect(CLIENT_URL!);
    }

    const user = await upsertUser(twitterUser, 'twitter');

    addCookieToRes(res, user, twitterOauthToken.access_token);

    return res.redirect(CLIENT_URL!);
}
