import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import { LinearProgress } from '@material-ui/core';
import SpotifyApi from './SpotifyApi'

export default function PostLogin(props) {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState(undefined);

  React.useEffect(() => {
    SpotifyApi.authenticated()
      .then((result) => {
        console.log("isLoggedIn " + result);
        if (result) {
          setLoggedIn(true);
          setRedirectTo("/main");
        } else {
          setLoggedIn(true);
          setRedirectTo("/login");
        }
      })
  }, []);

    console.log("props ", props);
    let from = {
      from: {
        pathname: '/'
      }
    }

    if (props && props.location && props.location.state) {
      from = props.location.state
    }

    if (redirectTo) {
      console.log("Redirecting to " + redirectTo);
      return <Redirect to={redirectTo} />
    }

    return (
      <LinearProgress></LinearProgress>
    )
}
