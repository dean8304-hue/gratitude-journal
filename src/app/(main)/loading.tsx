export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-amber-500 text-sm">불러오는 중...</p>
      </div>
    </div>
  );
}
