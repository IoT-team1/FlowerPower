const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg px-10 py-12 flex flex-col items-center gap-6 w-80">
        <div className="flex  items-center justify-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 22V12M12 12C12 12 7 8.5 5 4c3.5 0 6.5 2.5 7 8zM12 12C12 12 17 8.5 19 4c-3.5 0-6.5 2.5-7 8z"
                    stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12C12 12 9 15 9 18c0 1.66 1.34 3 3 3s3-1.34 3-3c0-3-3-6-3-6z"
                    stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-2xl font-semibold text-gray-900">
            Flower<span className="text-green-700">Power</span>
          </span>
        </div>
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
