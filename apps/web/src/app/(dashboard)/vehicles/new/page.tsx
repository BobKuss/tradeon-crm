'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiCreateVehicle } from '@/lib/api';
import type { CreateVehiclePayload } from '@/lib/types';
import { VehicleForm } from '../_components/VehicleForm';

export default function NewVehiclePage() {
  const router = useRouter();

  async function handleSubmit(payload: CreateVehiclePayload) {
    const created = await apiCreateVehicle(payload);
    router.push(`/vehicles/${created.id}`);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/vehicles" className="hover:text-brand-red">Vehicles</Link>
        <span>/</span>
        <span className="text-gray-600">New vehicle</span>
      </nav>

      <div>
        <h1 className="text-xl font-semibold text-brand-dark">Add vehicle</h1>
        <p className="text-sm text-gray-400">Create a new stock record.</p>
      </div>

      <VehicleForm onSubmit={handleSubmit} submitLabel="Create vehicle" />
    </div>
  );
}
