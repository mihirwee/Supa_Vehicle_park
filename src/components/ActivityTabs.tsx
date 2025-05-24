// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";

// const ActivityTab = ({ role }) => {
//   const [logs, setLogs] = useState([]);
//   const [activeTab, setActiveTab] = useState(
//     role === "admin" ? "admin" : "user"
//   );
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const getUser = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       setUserId(session?.user?.id || null);
//     };
//     getUser();
//   }, []);

//   useEffect(() => {
//     const fetchLogs = async () => {
//       if (!userId) return;

//       const isAdmin = role === "admin";

//       const { data, error } = await supabase
//         .from("vehicle_logs")
//         .select(
//           `
//           id,
//           action,
//           timestamp,
//           details,
//           profiles ( name, email )
//         `
//         )
//         .order("timestamp", { ascending: false })
//         .eq(isAdmin && activeTab === "user" ? "user_id" : "", userId);

//       if (error) console.error(error);
//       else setLogs(data);
//     };

//     fetchLogs();
//   }, [activeTab, role, userId]);

//   return (
//     <div>
//       <h2>Activity Logs</h2>

//       {role === "admin" && (
//         <div style={{ marginBottom: "1rem" }}>
//           <button onClick={() => setActiveTab("admin")}>Admin Activity</button>
//           <button onClick={() => setActiveTab("user")}>User Activity</button>
//         </div>
//       )}

//       {logs.length === 0 ? (
//         <p>No activity found.</p>
//       ) : (
//         <ul>
//           {logs.map((log: any) => (
//             <li key={log.id}>
//               <strong>{log.action.toUpperCase()}</strong> —{" "}
//               {log.details?.make || "Unknown vehicle"} on{" "}
//               {new Date(log.timestamp).toLocaleString()}
//               {role === "admin" && log.profiles && (
//                 <div style={{ fontSize: "0.8rem" }}>
//                   by {log.profiles.name} ({log.profiles.email})
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ActivityTab;
