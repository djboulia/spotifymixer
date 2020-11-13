import React from 'react';
import { Redirect } from 'react-router-dom'
import SpotifyApi from './SpotifyApi'

export default function Logout(props) {
  // the constructor attempts the logout, so we just redirect back
  // to the main login page in the render function
  const loginPage = "/login";

  React.useEffect(() => {
    SpotifyApi.logout();
  }, []);

  console.log("Redirecting to : " + loginPage);
  return <Redirect to={loginPage} />
}
