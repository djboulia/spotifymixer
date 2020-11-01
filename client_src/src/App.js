import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Dashboard from './Dashboard';
import Login from './Login';
import PostLogin from './PostLogin';
import Logout from './Logout';
import SpotifyApi from './SpotifyApi';

const PrivateRoute = ({
  component: Component,
  ...rest
}) => (

  <Route
    {...rest}
    render={(props) => (SpotifyApi.isLoggedIn()
    ? <Component {...props}/>
    : <Redirect
      to={{
      pathname: '/login',
      state: {
        from: props.location
      }
    }}/>)}/>

)



export default function App() {
    return (
      <Router>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/postLogin" component={PostLogin} />
            <PrivateRoute exact path="/logout" component={Logout} />
            <PrivateRoute exact path="/main" component={Dashboard} />
            <Route exact path="/" component={Login} />
          </Switch>
      </Router>
    );
}
