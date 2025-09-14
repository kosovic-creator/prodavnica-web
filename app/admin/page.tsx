"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { PAGE_SIZE } from "@/lib/constants";


interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image?: string;
    };
  }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"users" | "products" | "orders">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User form state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    image: "",
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // PAGINATION STATE
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      setLoadingUsers(true);
      setLoadingProducts(true);
      fetchUsers(userPage);
      fetchProducts(productPage);
      fetchOrders();
    }
  }, [status, userPage, productPage]);

  const fetchUsers = async (pageNum = 1) => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`/api/users?page=${pageNum}&pageSize=${PAGE_SIZE}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items);
        setUserTotalPages(data.totalPages || 1);
      } else {
        setError("Greška pri učitavanju korisnika");
      }
    } catch {
      setError("Greška pri učitavanju korisnika");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProducts = async (pageNum = 1) => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/products?page=${pageNum}&pageSize=${PAGE_SIZE}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items);
        setProductTotalPages(data.totalPages || 1);
      } else {
        setError("Greška pri učitavanju proizvoda");
      }
    } catch {
      setError("Greška pri učitavanju proizvoda");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders?admin=true");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError("Greška pri učitavanju porudžbina");
      }
    } catch {
      setError("Greška pri učitavanju porudžbina");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingUser ? `/api/users/${editingUser}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setUserForm({ name: "", email: "", password: "", role: "user" });
        setEditingUser(null);
        fetchUsers(userPage);
      } else {
        const data = await response.json();
        setError(data.error || "Greška pri čuvanju korisnika");
      }
    } catch {
      setError("Greška pri čuvanju korisnika");
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let imageUrl = productForm.image;

      // Upload image if a file is selected
      if (selectedFile) {
        const uploadedImageUrl = await uploadImage(selectedFile);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          return; // Upload failed, don't proceed
        }
      }

      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        image: imageUrl,
      };

      const url = editingProduct ? `/api/products/${editingProduct}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setProductForm({ name: "", price: "", image: "" });
        setEditingProduct(null);
        setSelectedFile(null);
        fetchProducts(productPage);
      } else {
        const data = await response.json();
        setError(data.error || "Greška pri čuvanju proizvoda");
      }
    } catch {
      setError("Greška pri čuvanju proizvoda");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovog korisnika?")) return;

    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchUsers(userPage);
      } else {
        setError("Greška pri brisanju korisnika");
      }
    } catch {
      setError("Greška pri brisanju korisnika");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchProducts(productPage);
      } else {
        setError("Greška pri brisanju proizvoda");
      }
    } catch {
      setError("Greška pri brisanju proizvoda");
    }
  };

  const editUser = (user: User) => {
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingUser(user.id);
  };

  const editProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image || "",
    });
    setEditingProduct(product.id);
  };

  const cancelEdit = () => {
    setUserForm({ name: "", email: "", password: "", role: "user" });
    setProductForm({ name: "", price: "", image: "" });
    setEditingUser(null);
    setEditingProduct(null);
    setSelectedFile(null);
  };

  // Upload image function
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        setError(`Greška pri uploadu slike: ${errorData.error}`);
        return null;
      }
    } catch {
      setError("Greška pri uploadu slike");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Učitavam...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Neautorizovan pristup</h1>
            <p className="mt-2">Morate biti prijavljeni da pristupite ovoj stranici.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Korisnici
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "products"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Proizvodi
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "orders"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Porudžbine
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingUser ? "Uredi korisnika" : "Dodaj novog korisnika"}
              </h2>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ime"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder={editingUser ? "Nova lozinka (ostaviti prazno ako se ne menja)" : "Lozinka"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={!editingUser}
                  />
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="user">Korisnik</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {editingUser ? "Ažuriraj" : "Dodaj"}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Otkaži
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-xl font-semibold p-6 border-b">Lista korisnika</h2>
              {loadingUsers ? (
                <div className="p-6">Učitavam korisnike...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slika
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ime
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uloga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kreiran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcije
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => editUser(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Uredi
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Obriši
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    {/* PAGINATION */}
                    {userTotalPages > 1 && (
                      <div className="flex justify-center mt-4 space-x-2">
                        <button
                          onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                          disabled={userPage === 1}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Prethodna
                        </button>
                        <span className="px-3 py-1">Strana {userPage} / {userTotalPages}</span>
                        <button
                          onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                          disabled={userPage === userTotalPages}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Sledeća
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? "Uredi proizvod" : "Dodaj novi proizvod"}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Naziv proizvoda"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cena"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slika proizvoda
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {selectedFile && (
                        <p className="text-sm text-gray-600">
                          Izabran fajl: {selectedFile.name}
                        </p>
                      )}
                      {uploadingImage && (
                        <p className="text-sm text-blue-600">
                          Upload u toku...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-gray-500">ili</div>

                  <input
                    type="url"
                    placeholder="URL slike (alternativno)"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {productForm.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Pregled slike:</p>
                      <Image
                        src={productForm.image}
                        alt="Preview"
                        width={200}
                        height={150}
                        className="object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className={`px-4 py-2 rounded-md text-white ${
                      uploadingImage
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {uploadingImage
                      ? "Upload u toku..."
                      : editingProduct
                        ? "Ažuriraj"
                        : "Dodaj"
                    }
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={uploadingImage}
                      className={`px-4 py-2 rounded-md text-white ${
                        uploadingImage
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                    >
                      Otkaži
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-xl font-semibold p-6 border-b">Lista proizvoda</h2>
              {loadingProducts ? (
                <div className="p-6">Učitavam proizvode...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slika
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Naziv
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cena
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kreiran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcije
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4h12v12H4V4zm2 2v8h8V6H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.price.toFixed(2)} EUR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => editProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Uredi
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Obriši
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                    {/* PAGINATION */}
                    {productTotalPages > 1 && (
                      <div className="flex justify-center mt-4 space-x-2">
                        <button
                          onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                          disabled={productPage === 1}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Prethodna
                        </button>
                        <span className="px-3 py-1">Strana {productPage} / {productTotalPages}</span>
                        <button
                          onClick={() => setProductPage((p) => Math.min(productTotalPages, p + 1))}
                          disabled={productPage === productTotalPages}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                          Sledeća
                      </button>
                    </div>
                    )}
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Lista porudžbina</h2>
              {loading ? (
                <div className="p-6">Učitavam porudžbine...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Korisnik
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ukupno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kreirano
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akcije
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.user.name} ({order.user.email})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.total.toFixed(2)} EUR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {}}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Prikaži
                            </button>
                            <button
                              onClick={() => {}}
                              className="text-red-600 hover:text-red-900"
                            >
                              Obriši
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
