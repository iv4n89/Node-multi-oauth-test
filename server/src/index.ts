import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { CLIENT_URL, COOKIE_NAME, JWT_SECRET, prisma, SERVER_PORT } from './config';
import cors from 'cors';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getTwitterUser, twitterOauth } from './twitterOauth2';

const app = express();

const origin = [CLIENT_URL!];

app.use(cookieParser());
app.use(cors({
    origin,
    credentials: true,
}));

app.get('/ping', (_, res) => res.json('pong'));

type UserJWTPayload = Pick<User, 'id' | 'type'> & { accessToken: string };

app.get('/me', async (req, res) => {
    try {
        const token = req.cookies[COOKIE_NAME!];
        if (!token) {
            throw new Error('Not authenticated');
        }

        const payload = jwt.verify(token, JWT_SECRET!) as UserJWTPayload;
        const userFromDb = await prisma.user.findUnique({
            where: { id: payload?.id }
        });

        if (!userFromDb) {
            throw new Error('Not authenticated');
        }
        if (userFromDb.type === 'twitter') {
            if (!payload.accessToken) {
                throw new Error('Not authenticated');
            }

            const twUser = await getTwitterUser(payload.accessToken);
            if (twUser?.id !== userFromDb.id) {
                throw new Error('Not authenticated');
            }
        }

        res.json(userFromDb);
    } catch (err) {
        res.status(401).json('Not authenticated');
    }
});

app.get('/oauth/twitter', twitterOauth);

app.listen(SERVER_PORT!, () => console.log(`Server listening on port ${ SERVER_PORT! }`));
