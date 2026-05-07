export function Silhouette() {
  return (
    <svg
      viewBox="0 0 100 230"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="3.5"
      strokeLinecap="round"
      style={{ opacity: 0.08 }}
    >
      {/* Cabeza */}
      <circle cx="50" cy="22" r="13" />
      {/* Cuello */}
      <line x1="50" y1="35" x2="50" y2="45" />
      {/* Torso */}
      <line x1="50" y1="45" x2="50" y2="115" />
      {/* Hombros */}
      <line x1="20" y1="52" x2="80" y2="52" />
      {/* Brazo izquierdo */}
      <line x1="20" y1="52" x2="16" y2="95" />
      {/* Brazo derecho */}
      <line x1="80" y1="52" x2="84" y2="95" />
      {/* Manos */}
      <circle cx="16" cy="98" r="3" />
      <circle cx="84" cy="98" r="3" />
      {/* Cadera */}
      <line x1="34" y1="115" x2="66" y2="115" />
      {/* Pierna izquierda */}
      <line x1="38" y1="115" x2="32" y2="175" />
      {/* Pierna derecha */}
      <line x1="62" y1="115" x2="68" y2="175" />
      {/* Pies */}
      <line x1="32" y1="175" x2="22" y2="181" />
      <line x1="68" y1="175" x2="78" y2="181" />
    </svg>
  );
}
