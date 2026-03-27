interface WireframeCardProps {
  width?: string;
  height?: string;
  label?: string;
  children?: React.ReactNode;
}

export function WireframeCard({ width = "w-64", height = "h-48", label, children }: WireframeCardProps) {
  return (
    <div className={`${width} ${height} border-2 border-white/60 bg-black relative`}>
      {label && (
        <div className="absolute top-2 left-2 text-white/80 text-xs font-mono">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
