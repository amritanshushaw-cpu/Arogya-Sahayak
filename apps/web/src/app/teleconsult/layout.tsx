import ProtectedRoute from "@/components/ProtectedRoute";

export default function TeleconsultLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
