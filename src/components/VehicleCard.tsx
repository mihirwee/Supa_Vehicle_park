import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Car } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Vehicle } from '../lib/supabase';
import ConfirmDialog from './ConfirmDialog';

type VehicleCardProps = {
  vehicle: Vehicle;
  onDelete: (id: string) => void;
};

const VehicleCard = ({ vehicle, onDelete }: VehicleCardProps) => {
  const { profile, isAdmin } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const canEdit = isAdmin || profile?.id === vehicle.id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="bg-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Car className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{vehicle.make} {vehicle.model}</h3>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <Link 
              to={`/edit-vehicle/${vehicle.id}`}
              className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Year</p>
            <p className="text-gray-700">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-gray-700">{vehicle.type}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Vehicle"
        message={`Are you sure you want to delete this ${vehicle.make} ${vehicle.model}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          onDelete(vehicle.id);
          setShowDeleteDialog(false);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default VehicleCard;