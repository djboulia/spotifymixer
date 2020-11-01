import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import SpotifyApi from './SpotifyApi'


class Logout extends Component {

  constructor() {
    super();

    SpotifyApi.logout();
  }

  render() {
    // the constructor attempts the logout, so we just redirect back
    // to the main login page in the render function
    const loginPage = "/login";

    console.log("Redirecting to : " + loginPage);
    return <Redirect to={loginPage}/>
  }
}

export default Logout;
