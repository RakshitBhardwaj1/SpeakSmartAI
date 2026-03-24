

import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img className="auth-logo" src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp" alt="logo" />
        <div className="auth-title">Welcome to SpeakSmart AI</div>
        <div className="auth-desc">Enhance your communication skills with AI-powered speech analysis</div>
        <div className="auth-form">
          <SignIn />
        </div>
        <div className="auth-bottom">
          <span>Don't have an account?</span>
          <a href="/sign-up" className="auth-create-btn">CREATE NEW</a>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-right-title">Speak Better. Communicate Smarter.</div>
        <div className="auth-right-desc">
          SpeakSmart AI helps you improve your speaking skills using advanced AI. 
          Get real-time feedback on your voice, confidence, fluency, and clarity. 
          Perfect for students, professionals, and interview preparation.
        </div>
      </div>
    </div>
  );
}