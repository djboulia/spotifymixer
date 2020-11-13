import React from 'react';
import Dashboard from './Dashboard';
import Title from './Title';
import SpotifyApi from './SpotifyApi';

export default function Login(props) {
  const link = SpotifyApi.getLoginUrl();

  return (
    <Dashboard>
      <Title>Login</Title>

      <p>Please <a href={link}>login to Spotify</a></p>
    </Dashboard>
  )
}
