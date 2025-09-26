export default function LoadingList() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
      ))}
    </div>
  );
}
