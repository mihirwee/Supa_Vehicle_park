import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Car } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, Vehicle } from "../lib/supabase";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

type FormData = {
  make: string;
  model: string;
  year: number;
  type: string;
};

const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Coupe",
  "Convertible",
  "Hatchback",
  "Wagon",
  "Motorcycle",
  "Other",
];

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (id) {
      fetchVehicle(id);
    }
  }, [id]);

  const fetchVehicle = async (vehicleId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setVehicle(data);
        setValue("make", data.make);
        setValue("model", data.model);
        setValue("year", data.year);
        setValue("type", data.type);
      }
    } catch (error: any) {
      toast.error(`Error fetching vehicle: ${error.message}`);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      if (id && vehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from("vehicles")
          .update({
            make: data.make,
            model: data.model,
            year: data.year,
            type: data.type,
          })
          .eq("id", id);

        if (error) throw error;

        const { error: loggingError } = await supabase
          .from("activity_logs")
          .insert([
            {
              action: "UPDATE",
              timestamp: new Date().toISOString(),
              details: {
                entity: "Vehicle",
                id,
                make: data.make,
                model: data.model,
              },
              user_id: user.id, // The ID of the logged-in user performing the action
            },
          ]);

        if (loggingError) {
          console.error("Error logging update activity:", loggingError);
        }

        toast.success("Vehicle updated successfully");
      } else {
        // Create new vehicle
        const { data: newVehicle, error } = await supabase
          .from("vehicles")
          .insert({
            make: data.make,
            model: data.model,
            year: data.year,
            type: data.type,
            user_id: user.id,
          });
        console.log("new vehicle", newVehicle);
        if (error) throw error;

        const { error: loggingError } = await supabase
          .from("activity_logs")
          .insert([
            {
              action: "ADD",
              timestamp: new Date().toISOString(),
              details: {
                entity: "Vehicle",
                make: data.make,
                model: data.model,
              },
              user_id: user.id, // The ID of the logged-in user performing the action
            },
          ]);

        if (loggingError) {
          console.error("Error logging add activity:", loggingError);
        }
        toast.success("Vehicle added successfully");
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        `Error ${id ? "updating" : "adding"} vehicle: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">
                {id ? "Edit Vehicle" : "Add New Vehicle"}
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="make"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Make
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="make"
                          {...register("make", {
                            required: "Make is required",
                          })}
                          className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.make ? "border-red-300" : ""
                          }`}
                        />
                        {errors.make && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.make.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="model"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Model
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="model"
                          {...register("model", {
                            required: "Model is required",
                          })}
                          className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.model ? "border-red-300" : ""
                          }`}
                        />
                        {errors.model && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.model.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="year"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Year
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="year"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          {...register("year", {
                            required: "Year is required",
                            min: {
                              value: 1900,
                              message: "Year must be 1900 or later",
                            },
                            max: {
                              value: new Date().getFullYear() + 1,
                              message: `Year cannot be later than ${
                                new Date().getFullYear() + 1
                              }`,
                            },
                          })}
                          className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.year ? "border-red-300" : ""
                          }`}
                        />
                        {errors.year && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.year.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Type
                      </label>
                      <div className="mt-1">
                        <select
                          id="type"
                          {...register("type", {
                            required: "Vehicle type is required",
                          })}
                          className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.type ? "border-red-300" : ""
                          }`}
                        >
                          <option value="">Select a type</option>
                          {vehicleTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.type.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <LoadingSpinner />
                          <span className="ml-2">
                            {id ? "Updating..." : "Saving..."}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Car className="h-4 w-4 mr-2" />
                          {id ? "Update Vehicle" : "Add Vehicle"}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
