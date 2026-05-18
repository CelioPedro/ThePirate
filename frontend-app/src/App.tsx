import { Navigate, Route, Routes } from "react-router-dom";
import { StoreShell } from "./shared/layout/StoreShell";
import { AdminShell } from "./shared/layout/AdminShell";
import { CatalogPage } from "./pages/CatalogPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AccountPage } from "./pages/AccountPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CategoryPage } from "./pages/CategoryPage";
import { useSession } from "./shared/session/SessionContext";

export function App() {
  return (
    <Routes>
      <Route element={<StoreShell />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/produto/:slug" element={<ProductDetailPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/conta" element={<AccountPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/pedidos/:orderId" element={<OrderDetailPage />} />
      </Route>
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AdminRoute() {
  const { isReady, user } = useSession();

  if (!isReady) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <AdminShell />;
}
