export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {children}
    </div>
  );
}