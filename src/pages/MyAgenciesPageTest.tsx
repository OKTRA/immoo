import React from 'react';
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";

export default function MyAgenciesPageTest() {
  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-4">Test My Agencies Page</h1>
        <p>Cette page de test fonctionne !</p>
        <p>Route: /my-agencies</p>
      </div>
    </ResponsiveLayout>
  );
}
