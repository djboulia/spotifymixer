import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import SpotifyApi from './SpotifyApi';

let statusMsg = (msg) => {
    const result = <p className="msg">{msg}</p>
    return result;
}
  
class Login extends Component {

  constructor() {
    super();

    this.state = {
      redirectToReferrer: false,
      msg: statusMsg("Please log in to Spotify."),
      loggedIn: false
    }
  }

  render() {

    console.log("this.props ", this.props);
    let from = {
        from: {
            pathname: '/'
          }
    }

    if (this.props && this.props.location && this.props.location.state) {
        from = this.props.location.state       
    }

    const redirectToReferrer = this.state.redirectToReferrer;

    if (redirectToReferrer === true) {
      console.log("Redirecting to : " + from.pathname);
      return <Redirect to={from}/>
    }

    const self = this;
    const link = SpotifyApi.getLoginUrl();

    return (
      <div>
      <h1>Login</h1>

      <p>Please <a href={link}>login to Spotify</a></p>
    </div>
    )
  }
}

export default Login;
