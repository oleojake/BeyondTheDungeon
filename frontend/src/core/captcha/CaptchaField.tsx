interface CaptchaFieldProps {
  question: string;
  value: string;
  onChange: (v: string) => void;
  onRefresh: () => void;
  error?: string;
}

export function CaptchaField({ question, value, onChange, onRefresh, error }: CaptchaFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-300">
          {question}
        </label>
        <button
          type="button"
          onClick={() => {
            onRefresh();
            onChange("");
          }}
          className="text-gray-500 hover:text-primary transition-colors shrink-0"
          aria-label="Nueva pregunta"
          title="Nueva pregunta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tu respuesta"
          autoComplete="off"
          className={`w-full pl-12 pr-4 py-3 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${error ? "border-error focus:border-error" : "border-dark-border focus:border-primary"}`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
