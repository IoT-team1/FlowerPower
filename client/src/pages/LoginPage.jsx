const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg px-10 py-12 flex flex-col items-center gap-6 w-80">
        <div className="text-2xl font-bold text-gray-900">🌿 FlowerPower</div>
        <p className="text-sm text-gray-500 text-center">Přihlaste se pro přístup k aplikaci.</p>
        <a
          href={`${API_URL}/auth/google`}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Přihlásit se přes Google
        </a>
      </div>
    </div>
  );
}
