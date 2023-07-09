'use client'

import { GoogleOauthButton } from '@/components/GoogleOauthButton';
import { TwitterOauthButton } from '@/components/TwitterOauthButton';
import { useMeQuery } from '@/hooks/useMeQuery';

export default function Home() {

  const { data } = useMeQuery();

  return (
    <div className='column-container'>
      <p>Hello!</p>
      {data ? (
        <p>{data.name}</p>
      ) : (
        <>
          <p>You are not logged in! Login with:</p>
          <TwitterOauthButton />
          <GoogleOauthButton />
        </>
      )}
    </div>
  )
}
