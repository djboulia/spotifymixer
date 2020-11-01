import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import { LinearProgress } from '@material-ui/core';
import SpotifyApi from './SpotifyApi'

class PostLogin extends Component {

  constructor() {
    super();

    this.state = {
      loggedIn: false,
      redirectTo: undefined
    }
  }

  componentDidMount() {
    console.log("in componentDidMount");
    this.isLoggedIn();
  }

  isLoggedIn() {
    SpotifyApi.authenticated()
      .then( (result) => {
        console.log("isLoggedIn " + result);
        if (result) {
          this.setState({loggedIn : true, redirectTo : "/main"});
        } else {
          this.setState({loggedIn : true, redirectTo : "/login"});
        }
      })
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

    const redirectTo = this.state.redirectTo;

    if (redirectTo) {
      console.log("Redirecting to " + redirectTo );
      return <Redirect to={redirectTo}/>
    }

    return (
      <LinearProgress></LinearProgress>
    )
  }
}

export default PostLogin;
