import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Car, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, Vehicle, Profile } from "../lib/supabase";
import Navbar from "../components/Navbar";
import VehicleCard from "../components/VehicleCard";
import UserCard from "../components/UserCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EditUserProfile from "../components/EditUserForm"; // Add this import

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"vehicles" | "users">("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setVehicles(data || []);
    } catch (error: any) {
      toast.error(`Error fetching vehicles: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Vehicle deleted successfully");
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
    } catch (error: any) {
      toast.error(`Error deleting vehicle: ${error.message}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      // Delete user from profiles table
      const { error } = await supabase.from("profiles").delete().eq("id", id);

      if (error) {
        throw error;
      }

      // Note: vehicles will be cascade deleted due to foreign key constraint

      toast.success("User deleted successfully");
      setUsers(users.filter((user) => user.id !== id));

      // Refresh vehicles list to reflect deleted user's vehicles
      fetchVehicles();
    } catch (error: any) {
      toast.error(`Error deleting user: ${error.message}`);
    }
  };

  const handleEdit = (profile: Profile) => {
    console.log("button is clicking", profile);
    setEditingUser(profile);
    setShowEditModal(true);
  };
  const handleSave = async (updatedData: { name: string; email: string }) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: updatedData.name,
          email: updatedData.email,
        })
        .eq("id", editingUser?.id)
        .select();

      if (error) throw error;

      toast.success("User updated successfully!");

      // Update local user list state (assuming 'users' contains all users)
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser?.id ? { ...user, ...data[0] } : user
        )
      );

      setShowEditModal(false);
      setEditingUser(null);
    } catch (error: any) {
      toast.error("Failed to update user: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        {isAdmin && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "vehicles"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } mr-8`}
                >
                  <Car className="inline-block h-5 w-5 mr-2" />
                  Vehicles
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "users"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Users className="inline-block h-5 w-5 mr-2" />
                  Users
                </button>
              </nav>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeTab === "vehicles" && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Vehicle List
                </h2>
                {vehicles.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No vehicles
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new vehicle.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onDelete={handleDeleteVehicle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "users" && isAdmin && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  User List
                </h2>
                {users.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No users
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No users registered yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        profile={user}
                        onDelete={handleDeleteUser}
                        onEdit={handleEdit}
                      />
                    ))}
                    {/* TEMP modal test */}
                    {showEditModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg">
                          <h2>Edit User: {editingUser?.name}</h2>
                          <button onClick={() => setShowEditModal(false)}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {editingUser && showEditModal && (
        <EditUserProfile
          user={editingUser}
          isOpen={showEditModal}
          onClose={() => {
            setEditingUser(null);
            setShowEditModal(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
