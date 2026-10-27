export default function Loading() {
  return (
    <div aria-busy aria-label="در حال بارگذاری" className="animate-pulse">
      <div className="mb-6 h-9 w-56 rounded-md bg-green-900/6" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-box bg-white shadow-card" />
        ))}
      </div>
      <div className="mt-4 h-96 rounded-box bg-white shadow-card" />
    </div>
  );
}
