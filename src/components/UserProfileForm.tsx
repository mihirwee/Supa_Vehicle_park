import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import LoadingSpinner from "./LoadingSpinner";

type FormData = {
  name: string;
  email: string;
};

type UserProfileFormProps = {
  userId: string;
  initialName: string;
  initialEmail: string;
  onClose: () => void;
  onUpdate: () => void;
};

const UserProfileForm = ({
  userId,
  initialName,
  initialEmail,
  onClose,
  onUpdate,
}: UserProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: initialName,
      email: initialEmail,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          email: data.email,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User updated successfully");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Edit User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
