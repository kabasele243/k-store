import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/users"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Users</h2>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </Link>

          <Link
            href="/business-types"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Business Types</h2>
            <p className="text-gray-600">Create and manage business types</p>
          </Link>

          <Link
            href="/categories"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Categories</h2>
            <p className="text-gray-600">Manage product categories</p>
          </Link>

          <Link
            href="/products"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-600">Create and manage products</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
