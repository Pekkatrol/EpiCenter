import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/msalConfig';
import { LogIn } from 'lucide-react';

function Login() {
  const { instance } = useMsal();

  const handleMicrosoftLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-slate-200">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Connexion
          </h1>

          <p className="text-slate-600 mt-2">
            Accédez à votre espace
          </p>
        </div>

        <button
          onClick={handleMicrosoftLogin}
          className="
            w-full flex items-center justify-center gap-2
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            px-4 py-3 rounded-xl
            transition shadow-sm
          "
        >
          <LogIn size={18} />
          Se connecter avec Microsoft
        </button>

        <p className="text-xs text-slate-500 text-center mt-6">
          Authentification sécurisée via Microsoft Azure AD
        </p>

      </div>
    </div>
  );
}

export default Login;