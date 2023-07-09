import Image from "next/image";

const GOOGLE_BUTTON_URL = 'http://localhost:3001/oauth/google/login/redirect';

export function GoogleOauthButton() {
    return (
        <a href={ GOOGLE_BUTTON_URL }>
            <Image src='' alt="Google Icon" />
            <p> {' Google '} </p>
        </a>
    )
}