// Login.tsx
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TOKEN_TTL_MS } from '@consts';

export default function Login() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-dvrpc-blue-3 text-lg font-medium">
        Sign in to continue
      </p>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          setToken(credentialResponse.credential!, Date.now() + TOKEN_TTL_MS);
          navigate(from, { replace: true });
        }}
        onError={() => console.error('Login failed')}
      />
    </div>
  );
}
