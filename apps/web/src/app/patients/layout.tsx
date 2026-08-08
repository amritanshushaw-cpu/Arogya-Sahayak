import ProtectedRoute from "@/components/ProtectedRoute";

export default function PatientsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
