import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import About from './About';
import Playlists from './Playlists';
import MultiplePlaylists from './MultiplePlaylists';
import Login from './Login';
import PostLogin from './PostLogin';
import Logout from './Logout';
import SpotifyApi from './SpotifyApi';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      SpotifyApi.isLoggedIn() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: {
              from: props.location,
            },
          }}
        />
      )
    }
  />
);

export default function App() {
  return (
    <Router>
      {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/postLogin" component={PostLogin} />
        <PrivateRoute exact path="/logout" component={Logout} />
        <PrivateRoute exact path="/main" component={Playlists} />
        <PrivateRoute exact path="/multiple" component={MultiplePlaylists} />
        <PrivateRoute exact path="/about" component={About} />
        <Route exact path="/" component={Login} />
      </Switch>
    </Router>
  );
}
