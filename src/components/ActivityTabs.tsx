import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
interface ActivityTabProps {
  role: "admin" | "user"; // Define the expected values for the 'role' prop
}

const ActivityTab: React.FC<ActivityTabProps> = ({ role }) => {
  interface Log {
    id: any;
    action: any;
    timestamp: any;
    details: any;
    profiles: { name: any; email: any }[];
  }

  const [logs, setLogs] = useState<Log[]>([]);
  const [activeTab, setActiveTab] = useState(
    role === "admin" ? "admin" : "user"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5; // Number of logs per page

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!userId) return;

      const isAdmin = role === "admin";
      const start = (currentPage - 1) * logsPerPage;
      const end = start + logsPerPage - 1;

      let query = supabase
        .from("activity_logs")
        .select(
          `
        id,
        action,
        timestamp,
        details,
        profiles ( name, email )
      `
        )
        .order("timestamp", { ascending: false })
        .range(start, end);

      if (isAdmin && activeTab === "user") {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      console.log("Fetched Logs:", data);
      if (error) console.error(error);
      else setLogs(data);
      setIsLoading(false);
    };

    fetchLogs();
  }, [activeTab, role, userId, currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No activity found.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map(
            (log: any) => (
              console.log("Logsss:", log),
              console.log("Logsss profiless:", log.profiles),
              (
                <li
                  key={log.id}
                  className="bg-white shadow rounded p-4 border border-gray-200"
                >
                  <p className="text-sm text-gray-600">
                    <strong>{log.action.toUpperCase()}</strong> —{" "}
                    {log.details?.entity || "Unknown entity"} <br />
                    <span className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </p>
                </li>
              )
            )
          )}
        </ul>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
        >
          Next
        </button>
      </div>
    </div>
  );
};
export default ActivityTab;
