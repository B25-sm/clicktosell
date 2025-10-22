import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Page - OLX Classifieds',
  description: 'Test page for OLX Classifieds application',
};

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[color:var(--bg,theme(colors.brand.gray))]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[color:theme(colors.brand.midnight)]">OLX Classifieds</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-[color:theme(colors.brand.midnight)]">Home</a>
              <a href="#" className="text-gray-700 hover:text-[color:theme(colors.brand.midnight)]">Browse</a>
              <a href="#" className="text-gray-700 hover:text-[color:theme(colors.brand.midnight)]">Sell</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Test Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[color:theme(colors.brand.midnight)] mb-6">
            Test Page
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This is a test page to verify that routing works correctly on Vercel.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-[color:theme(colors.brand.midnight)]">
              Route Test Successful! ✅
            </h2>
            <p className="text-gray-600 mb-6">
              If you can see this page, it means your Next.js App Router is working correctly on Vercel.
            </p>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ What's Working:</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Next.js App Router routing</li>
                  <li>• Vercel deployment</li>
                  <li>• Dynamic route handling</li>
                  <li>• Page refresh functionality</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 Technical Details:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Route: /test</li>
                  <li>• Framework: Next.js 14</li>
                  <li>• App Router: Enabled</li>
                  <li>• Deployment: Vercel</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-[color:theme(colors.brand.midnight)] text-white rounded-lg hover:opacity-90 transition"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
