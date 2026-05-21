'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGetVehicle, apiUpdateVehicle } from '@/lib/api';
import type { CreateVehiclePayload, Vehicle } from '@/lib/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { VehicleForm } from '../../_components/VehicleForm';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const [vehicle,   setVehicle]   = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    apiGetVehicle(id)
      .then(setVehicle)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load vehicle'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleSubmit(payload: CreateVehiclePayload) {
    await apiUpdateVehicle(id, payload);
    router.push(`/vehicles/${id}`);
  }

  if (isLoading) return <PageSpinner />;
  if (error)     return <ErrorState message={error} onRetry={() => router.refresh()} />;
  if (!vehicle)  return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/vehicles" className="hover:text-brand-red">Vehicles</Link>
        <span>/</span>
        <Link href={`/vehicles/${id}`} className="hover:text-brand-red">{vehicle.stockNumber}</Link>
        <span>/</span>
        <span className="text-gray-600">Edit</span>
      </nav>

      <div>
        <h1 className="text-xl font-semibold text-brand-dark">
          Edit — {vehicle.make} {vehicle.model}
        </h1>
        <p className="text-sm text-gray-400">{vehicle.stockNumber}</p>
      </div>

      <VehicleForm initial={vehicle} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}
