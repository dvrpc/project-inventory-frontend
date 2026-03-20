import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';

const TOKEN_TTL_MS = 1000 * 60 * 60;

export default function Login() {
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
          const token = credentialResponse.credential!;
          localStorage.setItem('access_token', token);
          localStorage.setItem(
            'access_token_expiry',
            String(Date.now() + TOKEN_TTL_MS)
          );
          navigate(from, { replace: true });
        }}
        onError={() => console.error('Login failed')}
      />
    </div>
  );
}
