import { useEffect } from "react";
import { useForm } from "react-hook-form";

type UserEditModalProps = {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string }) => void;
};

const EditUserForm = ({
  user,
  isOpen,
  onClose,
  onSave,
}: UserEditModalProps) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: { name: string; email: string }) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">Edit User: {user?.name}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;
