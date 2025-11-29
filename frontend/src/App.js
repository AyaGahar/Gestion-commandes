import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import Products from "./pages/Products";
import Navbar from "./components/Navbar";
import AddProduct from "./pages/AddProduct";
import OrderDetails from "./pages/OrderDetails";
import OrdersList from "./pages/OrdersList";
import CreateOrder from "./pages/CreateOrder";
import ProductDetails from "./pages/ProductDetails";
import AdminUsers from "./pages/AdminUsers";
export default function App() {
  return (
    <BrowserRouter>
     {/* Navbar visible sur toutes les pages sauf Login/Register */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/products" element={<Products />} />
         <Route path="/products/add" element={<AddProduct />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/add" element={<CreateOrder />} />
         <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/users"    element={<AdminUsers/>}                                />
      </Routes>
    </BrowserRouter>
  );
}
