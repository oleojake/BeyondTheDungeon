import { FileText } from "lucide-react";

// ─── Notes section ────────────────────────────────────────────────────────────

export function NotesSection({
  value,
  onChange,
  placeholder = "Añade notas sobre tu personaje, equipo o campañas...",
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <FileText className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-amber-300">Notas</h3>
      </div>
      <div className="rounded-lg border border-amber-800/50 bg-[#1a0e06]/60 p-3 hover:border-amber-600/50 transition-colors">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full h-32 bg-transparent text-amber-100 placeholder:text-amber-700/50 text-sm resize-none focus:outline-none border-0 p-0"
        />
      </div>
    </div>
  );
}
