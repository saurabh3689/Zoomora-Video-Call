import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

export default function LandingPage() {
  const router = useNavigate();

  const handleJoinAsGuest = () => {
    // Generate a random 8-character meeting room ID
    const randomCode = Math.random().toString(36).substring(2, 10);
    router(`/${randomCode}`);
  };

  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h1>Zoomora</h1>
        </div>

        <div className='navlist'>
          <p onClick={handleJoinAsGuest}>Join as Guest</p>
          <p onClick={() => router('/auth')}>Register</p>
          <div onClick={() => router('/auth')} role='button'>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className='landingMainContainer'>
        <div>
          <h1>
            <span style={{ color: '#FF9839' }}>Connect</span> with your loved Ones
          </h1>
          <p>Cover the distance with Zoomora Video Call</p>
          <div role='button'>
            <Link to={'/auth'}>Get Started</Link>
          </div>
        </div>

        <div>
          <img src='/meet-image.jpg' alt='Zoomora Meeting' />
        </div>
      </div>
    </div>
  );
}
