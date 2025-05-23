import { useState } from 'react';
import { User, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../lib/supabase';
import ConfirmDialog from './ConfirmDialog';

type UserCardProps = {
  profile: Profile;
  onDelete: (id: string) => void;
};

const UserCard = ({ profile, onDelete }: UserCardProps) => {
  const { profile: currentProfile } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Format the created_at date
  const formattedDate = new Date(profile.created_at).toLocaleDateString();
  
  // Current user shouldn't be able to delete themselves
  const canDelete = currentProfile?.id !== profile.id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="bg-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <User className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
        </div>
        {canDelete && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-700">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-gray-700 capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="text-gray-700">{formattedDate}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete User"
        message={`Are you sure you want to delete ${profile.name}? This will also delete all vehicles associated with this user. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          onDelete(profile.id);
          setShowDeleteDialog(false);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default UserCard;