import React from 'react'

import useAuth from './useAuth'

export default function LoggedInScreen({ code, socket }) {
    const accessToken =  useAuth(code);

    return (
    <div>LoggedInScreen</div>
  )
}
