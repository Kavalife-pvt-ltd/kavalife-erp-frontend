import { useEffect, useState } from 'react';
import { VIRFormModal } from '@/components/forms/VIRFormModal';
import { VIRCard } from '@/components/ui/VIRCard';
import { fetchAllVIRs } from '@/api/vir';
import { VIR } from '@/types/vir';

// Define the shape of your VIR items (for dummy data)
interface VirItem {
  id: number;
  vendorId: string;
  productId: string;
  status: 'pending verification' | 'verified';
  remarks: string;
  doneBy?: string;
  imageUrl?: string;
  checklist?: Record<string, 'yes' | 'no' | 'na'>;
  createdBy?: string;
  createdAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export const VehicleInspection = () => {
  // undefined = modal closed; null = create mode; VirItem = verify mode
  const [selectedVir, setSelectedVir] = useState<VirItem | null | undefined>(undefined);
  const [virList, setVirList] = useState<VIR[]>([]);

  useEffect(() => {
    const fetchVIRs = async () => {
      const response = await fetchAllVIRs();
      console.log(response);
      setVirList(response);
    };
    fetchVIRs();
    console.log('Vehicle Inspection page mounted');
  }, []);

  const dummyVirList: VirItem[] = [
    {
      id: 1,
      createdAt: '2024-05-01',
      vendorId: 'ABC Ltd.',
      productId: 'Chilli Powder',
      status: 'pending verification',
      remarks: 'Inspection required before approval',
      createdBy: 'Jane Smith',
      checklist: {},
      imageUrl: 'https://kavalife.in/wp-content/uploads/2024/07/Capsicum-Oleoresin-1.png.png',
    },
    {
      id: 2,
      createdAt: '2024-05-04',
      vendorId: 'XYZ Enterprises',
      productId: 'Wheat Flour',
      status: 'verified',
      remarks: 'All good here',
      verifiedBy: 'John Doe',
      createdBy: 'Jane Smith',
      verifiedAt: '2024-05-05',
      checklist: {},
      imageUrl: 'https://kavalife.in/wp-content/uploads/2024/05/img03.png',
    },
  ];

  console.log(virList, dummyVirList);

  return (
    <section className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Inspection Reports</h1>
        <button
          onClick={() => setSelectedVir(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new VIR
        </button>
      </div>

      {selectedVir !== undefined && (
        <VIRFormModal
          onClose={() => setSelectedVir(undefined)}
          virData={selectedVir || undefined}
        />
      )}

      <div className="space-y-4">
        {virList.map((vir) => (
          <div key={vir.id} className="cursor-pointer" onClick={() => setSelectedVir(vir)}>
            <VIRCard {...vir} />
          </div>
        ))}
      </div>
    </section>
  );
};
