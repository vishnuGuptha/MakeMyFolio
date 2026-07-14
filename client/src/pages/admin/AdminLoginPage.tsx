import { Navigate } from 'react-router-dom';

/** @deprecated — use /login */
export default function AdminLoginPage() {
  return <Navigate to="/login" replace />;
}
