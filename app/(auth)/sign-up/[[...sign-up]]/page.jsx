import { SignUp } from '@clerk/nextjs';

import '../../../auth-template.css';

export default function Page() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img className="auth-logo" src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp" alt="logo" />
        <div className="auth-title">Join SpeakSmart AI</div>
        <div className="auth-desc">Start your journey to confident communication today</div>
        <div className="auth-form">
          <SignUp />
        </div>
        <div className="auth-bottom">
          <span>Already using SpeakSmart AI?</span>
          <a href="/sign-in" className="auth-create-btn">LOG IN</a>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-right-title">Your AI Communication Coach</div>
        <div className="auth-right-desc">
          SpeakSmart AI helps you improve your speaking skills using advanced AI. 
          Get real-time feedback on your voice, confidence, fluency, and clarity. 
          Perfect for students, professionals, and interview preparation.
        </div>
      </div>
    </div>
  );
}