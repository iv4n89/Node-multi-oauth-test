import Image from "next/image";
import twitterIcon from '../public/twitter.svg';


const TWITTER_CLIENT_ID = 'al9oamFqdldzRjFrTXRrak56dm06MTpjaQ';

function getTwitterOauthUrl() {
    const rootUrl = 'https://twitter.com/i/oauth2/authorize';
    const options = {
        redirect_uri: 'http://www.localhost:3001/oauth/twitter',
        client_id: TWITTER_CLIENT_ID,
        state: 'state',
        response_type: 'code',
        code_challenge: 'y_SfRG4BmOES02uqWeIkIgLQAlTBggyf_G7uKT51ku8',
        code_challenge_method: 'S256',
        scope: ['users.read', 'tweet.read', 'follows.read', 'follows.write'].join(' '),
    };
    const qs = new URLSearchParams(options).toString();
    return `${ rootUrl }?${ qs }`;
}

export function TwitterOauthButton() {
    return (
        <a className="a-button row-container" href={ getTwitterOauthUrl() }>
            <Image src={ twitterIcon } alt='Twitter icon' />
            <p>{' Twitter '}</p>
        </a>
    )
}