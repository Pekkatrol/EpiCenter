import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/msalConfig';

function Login() {
  const { instance } = useMsal();

  const handleMicrosoftLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="p-4 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <button onClick={handleMicrosoftLogin} className="bg-blue-700 text-white px-4 py-2 rounded w-full">
        Se connecter avec Microsoft
      </button>
    </div>
  );
}

export default Login;