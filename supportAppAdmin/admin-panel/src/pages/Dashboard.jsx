import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../api/api";
import { apiGet as insApi } from "../api/api2";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [supports, setSupports] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ======================
  // LOAD DATA
  // ======================

  const loadData = async () => {
    const baseTasks = await apiGet("/tasks");

    const enriched = await Promise.all(
      (baseTasks || []).map(async (t) => {
        try {
          const detail = await apiGet(`/tasks/${t._id}`);

          return {
            ...t,
            ...(detail.task || {}), // ⭐ CRITICAL FIX
            user: detail.user || t.user || {},
            vehicle: {
              ...t.vehicle,
              ...detail.vehicle,
            },
          };
        } catch {
          return t;
        }
      }),
    );

    setTasks(enriched);

    const s = await insApi("/support");
    setSupports(s || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======================
  // ESC KEY CLOSE MODAL
  // ======================

  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setShowSupportModal(false);
        setShowUserModal(false);
        setShowVehicleModal(false);
        setShowStatusModal(false);
        setSelectedTask(null);
        setSelectedUser(null);
        setSelectedVehicle(null);
        setSelectedStatus(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  // ======================
  // SEARCH + SORT
  // ======================

  const q = search.toLowerCase().trim();

  const statusPriority = {
    pending: 1,
    assigned: 2,
    completed: 3,
    accepted: 4,
  };

  const filteredTasks = tasks
    .filter((t) => {
      // SEARCH FILTER (unchanged logic)
      if (q) {
        const user = t.user || {};
        const vehicle = t.vehicle || {};

        const match =
          user.name?.toLowerCase().includes(q) ||
          user.phone?.toLowerCase().includes(q) ||
          t.taskType?.toLowerCase().includes(q) ||
          vehicle.registrationNumber?.toLowerCase().includes(q) ||
          vehicle.brand?.toLowerCase().includes(q);

        if (!match) return false;
      }

      // STATUS FILTER (NEW)
      if (statusFilter !== "all") {
        return t.status === statusFilter;
      }

      return true;
    })
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  // ======================
  // PAGINATION
  // ======================

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);

  // ======================
  // ======================
  // RELOAD DATA
  // ======================

  const reloadData = async () => {
    try {
      const baseTasks = await apiGet("/tasks");
      const enriched = await Promise.all(
        (baseTasks || []).map(async (t) => {
          try {
            const detail = await apiGet(`/tasks/${t._id}`);
            return {
              ...t,
              ...detail, // ⭐ important for persistence
              user: detail.user || t.user || {},
              vehicle: {
                ...t.vehicle,
                ...detail.vehicle,
              },
            };
          } catch {
            return t;
          }
        }),
      );
      setTasks(enriched);
    } catch (err) {
      console.error("Error reloading data:", err);
    }
  };

  // ======================
  // ASSIGN SUPPORT
  // ======================

  const assignSupport = async (support) => {
    try {
      const taskId = selectedTask._id;

      // 1️⃣ Update task status in backend
      await apiPatch(`/tasks/${taskId}`, {
        status: "assigned",
        assignedTo: support.phone,
      });

      // 2️⃣ Send push via your Cloud Function
      const expoToken = support?.device?.expoPushToken;

      if (expoToken) {
        const response = await fetch(
          "https://expo-notification-api-951619846156.asia-south1.run.app/send-notification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY":
                "5a5fcfe2c214e1d9d12357db61b3563612b77e743716ebc4de4ed556b9566253",
            },
            body: JSON.stringify({
              to: expoToken,
              title: "New Task Assigned",
              body: "You received a new support task 🚀",
              data: {
                screen: "TaskList",
                taskId: taskId.registrationNumber,
              },
            }),
          },
        );

        const result = await response.json();
        console.log("Push result:", result);
      } else {
        console.log("No expo token found for this support");
      }

      // 3️⃣ Reload UI
      await loadData();

      setShowSupportModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Assign support error:", error);
    }
  };

  // ======================
  // TASK STATISTICS
  // ======================

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const assignedTasks = tasks.filter((t) => t.status === "assigned").length;
  // console.log(tasks)
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const acceptedTasks = tasks.filter((t) => t.status === "accepted").length;

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  return (
    <div className="dashboard">
      <style>{css}</style>

      {/* SEARCH */}
      <div className="topbar">
        <input
          placeholder="Search user, task, vehicle..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button
          className="refreshBtn"
          onClick={reloadData}
          title="Refresh data"
        >
          🔄
        </button>
      </div>
      {/* STATUS FILTER BUTTONS */}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className={`filterBtn ${statusFilter === "all" ? "activeFilter" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>

        <button
          className={`filterBtn ${statusFilter === "assigned" ? "activeFilter" : ""}`}
          onClick={() => setStatusFilter("assigned")}
        >
          Assigned
        </button>

        <button
          className={`filterBtn ${statusFilter === "completed" ? "activeFilter" : ""}`}
          onClick={() => setStatusFilter("completed")}
        >
          Completed
        </button>

        <button
          className={`filterBtn ${statusFilter === "accepted" ? "activeFilter" : ""}`}
          onClick={() => setStatusFilter("accepted")}
        >
          Accepted
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="statsContainer">
        <div className="statCard">
          <div className="statIcon">📊</div>
          <div className="statLabel">Total Tasks</div>
          <div className="statValue">{totalTasks}</div>
        </div>

        <div
          className="statCard"
          onClick={() => {
            setSelectedStatus("pending");
            setShowStatusModal(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">⏳</div>
          <div className="statLabel">Pending Tasks</div>
          <div className="statValue" style={{ color: "#f59e0b" }}>
            {pendingTasks}
          </div>
        </div>

        <div
          className="statCard"
          onClick={() => {
            setSelectedStatus("assigned");
            setShowStatusModal(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">👤</div>
          <div className="statLabel">Assigned Tasks</div>
          <div className="statValue" style={{ color: "#3b82f6" }}>
            {assignedTasks}
          </div>
        </div>

        <div
          className="statCard"
          onClick={() => {
            setSelectedStatus("completed");
            setShowStatusModal(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">✅</div>
          <div className="statLabel">Completed Tasks</div>
          <div className="statValue" style={{ color: "#10b981" }}>
            {completedTasks}
          </div>
        </div>

        <div
          className="statCard"
          onClick={() => {
            setSelectedStatus("accepted");
            setShowStatusModal(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="statIcon">🎯</div>
          <div className="statLabel">Accepted Tasks</div>
          <div className="statValue" style={{ color: "#8b5cf6" }}>
            {acceptedTasks}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <h3>System Overview</h3>

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Task</th>
              <th>Vehicle</th>
              <th>Location</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>

          <tbody>
            {currentTasks.map((t) => {
              const user = t.user;
              const vehicle = t.vehicle;

              return (
                <tr key={t._id}>
                  <td>
                    <div
                      className="row clickableRow"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <img src={user?.photo_url || "/avatar.png"} />
                      <div>
                        <b>{user?.name}</b>
                        <div className="muted">{user?.phone}</div>
                      </div>
                    </div>
                  </td>

                  <td>{t.taskType}</td>

                  <td>
                    <div
                      className="row clickableRow"
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowVehicleModal(true);
                      }}
                    >
                      <img src={vehicle?.imageUrl || "/vehicle.png"} />
                      <div>
                        <b>{vehicle?.registrationNumber}</b>
                        <div className="muted">
                          {vehicle?.brand} {vehicle?.carName}
                        </div>
                        {t.assignedTo && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#3b82f6",
                              fontWeight: 600,
                              marginTop: 4,
                            }}
                          >
                            →{" "}
                            {supports.find((s) => s.phone === t.assignedTo)
                              ?.supportName || "Assigned"}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>{t.location?.address}</td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span className={`badge ${t.status}`}>{t.status}</span>

                      {t.status === "pending" && (
                        <button
                          className="assignBtn"
                          onClick={() => {
                            setSelectedTask(t);
                            setShowSupportModal(true);
                          }}
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </td>

                  <td>
                    {t.assignedTo ? (
                      <div className="row">
                        <div>
                          {supports.find((s) => s.phone === t.assignedTo) && (
                            <>
                              <img
                                src={
                                  supports.find((s) => s.phone === t.assignedTo)
                                    ?.imageUrl || "/avatar.png"
                                }
                              />
                            </>
                          )}
                        </div>
                        <div>
                          <b>
                            {supports.find((s) => s.phone === t.assignedTo)
                              ?.supportName || "Unknown"}
                          </b>
                          <div className="muted">{t.assignedTo}</div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#d1d5db" }}>Not assigned</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SUPPORT SELECT MODAL */}

      {showSupportModal && (
        <div
          className="modal"
          onClick={() => {
            setShowSupportModal(false);
            setSelectedTask(null);
          }}
        >
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <h3>Select Support</h3>

            {supports.map((s) => (
              <div
                key={s._id}
                className="supportItem"
                onClick={() => assignSupport(s)}
              >
                <img src={s.imageUrl} width="40" />

                <div>
                  <b>{s.supportName}</b>
                  <div>{s.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}

      {showUserModal && selectedUser && (
        <div
          className="modal"
          onClick={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        >
          <div
            className="modalBox detailsModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detailsHeader">
              <img
                src={selectedUser?.photo_url || "/avatar.png"}
                className="detailsAvatar"
              />
              <h3>{selectedUser?.name}</h3>
            </div>

            <div className="detailsContent">
              <div className="detailRow">
                <span className="detailLabel">Phone:</span>
                <span className="detailValue">{selectedUser?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE DETAILS MODAL */}

      {showVehicleModal && selectedVehicle && (
        <div
          className="modal"
          onClick={() => {
            setShowVehicleModal(false);
            setSelectedVehicle(null);
          }}
        >
          <div
            className="modalBox detailsModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detailsHeader">
              <img
                src={selectedVehicle?.imageUrl || "/vehicle.png"}
                className="detailsImage"
              />
              <h3>{selectedVehicle?.registrationNumber}</h3>
            </div>

            <div className="detailsContent">
              <div className="detailRow">
                <span className="detailLabel">Brand:</span>
                <span className="detailValue">{selectedVehicle?.brand}</span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Model:</span>
                <span className="detailValue">{selectedVehicle?.carName}</span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Type:</span>
                <span className="detailValue">
                  {selectedVehicle?.carType || "N/A"}
                </span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Year:</span>
                <span className="detailValue">
                  {selectedVehicle?.year || "N/A"}
                </span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Color:</span>
                <span className="detailValue">
                  {selectedVehicle?.color || "N/A"}
                </span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">VIN:</span>
                <span className="detailValue">
                  {selectedVehicle?.vin || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS DETAILS MODAL */}

      {showStatusModal && selectedStatus && (
        <div
          className="modal"
          onClick={() => {
            setShowStatusModal(false);
            setSelectedStatus(null);
          }}
        >
          <div
            className="modalBox statusModal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}{" "}
              Tasks
            </h3>

            <div className="statusTasksList">
              {tasks
                .filter((t) => t.status === selectedStatus)
                .map((t) => (
                  <div key={t._id} className="statusTaskCard">
                    <div className="taskCardHeader">
                      <div className="userInfo">
                        <img src={t.user?.photo_url || "/avatar.png"} />
                        <div>
                          <b>{t.user?.name}</b>
                          <div className="muted">{t.user?.phone}</div>
                        </div>
                      </div>
                      <span className={`badge ${t.status}`}>{t.status}</span>
                    </div>

                    <div className="taskCardBody">
                      <div className="taskInfo">
                        <span className="taskLabel">Task:</span>
                        <span className="taskValue">{t.taskType}</span>
                      </div>
                      <div className="taskInfo">
                        <span className="taskLabel">Vehicle:</span>
                        <span className="taskValue">
                          {t.vehicle?.registrationNumber} - {t.vehicle?.brand}
                        </span>
                      </div>
                      <div className="taskInfo">
                        <span className="taskLabel">Location:</span>
                        <span className="taskValue">{t.location?.address}</span>
                      </div>
                      {t.assignedTo && (
                        <div className="taskInfo">
                          <span className="taskLabel">Assigned To:</span>
                          <span className="taskValue">
                            {supports.find((s) => s.phone === t.assignedTo)
                              ?.supportName || "Unknown"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {tasks.filter((t) => t.status === selectedStatus).length ===
                0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "20px",
                  }}
                >
                  No {selectedStatus} tasks found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "activePage" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
* { box-sizing: border-box; }

.dashboard { 
 padding: 40px; 
 background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
 min-height: 100vh;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.topbar { 
 margin-bottom: 32px;
 position: relative;
 display: flex;
 gap: 12px;
 align-items: center;
}

.topbar input {
 flex: 1;
 padding: 14px 16px 14px 44px;
 border: 2px solid transparent;
 border-radius: 12px;
 font-size: 15px;
 background: white;
 box-shadow: 0 4px 16px rgba(0,0,0,0.08);
 transition: all 0.3s ease;
}

.topbar input::placeholder {
 color: #9ca3af;
}

.topbar input:focus {
 outline: none;
 border-color: #6366f1;
 box-shadow: 0 8px 24px rgba(99,102,241,0.2);
}

.refreshBtn {
 width: 44px;
 height: 44px;
 border-radius: 12px;
 background: white;
 border: 2px solid transparent;
 cursor: pointer;
 font-size: 20px;
 transition: all 0.3s ease;
 box-shadow: 0 4px 16px rgba(0,0,0,0.08);
 display: flex;
 align-items: center;
 justify-content: center;
}

.refreshBtn:hover {
 border-color: #6366f1;
 box-shadow: 0 8px 24px rgba(99,102,241,0.2);
 animation: spin 0.6s ease-in-out;
}

@keyframes spin {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
}

.statsContainer {
 display: grid;
 grid-template-columns: repeat(5, 1fr);
 gap: 16px;
 margin-bottom: 32px;
}

.statCard {
 background: white;
 padding: 20px 16px;
 border-radius: 16px;
 box-shadow: 0 4px 16px rgba(0,0,0,0.08);
 border: none;
 position: relative;
 overflow: hidden;
 transition: all 0.3s ease;
 cursor: pointer;
}

.statCard::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 height: 4px;
 background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.statCard:nth-child(2)::before {
 background: linear-gradient(90deg, #f59e0b, #f97316);
}

.statCard:nth-child(3)::before {
 background: linear-gradient(90deg, #3b82f6, #0ea5e9);
}

.statCard:nth-child(4)::before {
 background: linear-gradient(90deg, #10b981, #14b8a6);
}

.statCard:nth-child(5)::before {
 background: linear-gradient(90deg, #8b5cf6, #a855f7);
}

.statCard:hover {
 transform: translateY(-6px);
 box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.statLabel {
 font-size: 12px;
 color: #6b7280;
 font-weight: 600;
 margin-bottom: 8px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.statIcon {
 font-size: 32px;
 margin-bottom: 12px;
 line-height: 1;
 animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(-8px); }
}

.statValue {
 font-size: 28px;
 font-weight: 800;
 color: #1f2937;
 background: linear-gradient(135deg, #6366f1, #8b5cf6);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.statCard:nth-child(2) .statValue {
 background: linear-gradient(135deg, #f59e0b, #f97316);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.statCard:nth-child(3) .statValue {
 background: linear-gradient(135deg, #3b82f6, #0ea5e9);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.statCard:nth-child(4) .statValue {
 background: linear-gradient(135deg, #10b981, #14b8a6);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.statCard:nth-child(5) .statValue {
 background: linear-gradient(135deg, #8b5cf6, #a855f7);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.card {
 background: white;
 padding: 28px;
 border-radius: 18px;
 box-shadow: 0 4px 20px rgba(0,0,0,0.08);
 margin-bottom: 32px;
}

.card h3 {
 margin: 0 0 24px 0;
 color: #1f2937;
 font-size: 20px;
 font-weight: 700;
}

table { 
 width: 100%; 
 border-collapse: collapse;
}

th { 
 text-align: left; 
 padding: 16px;
 background: linear-gradient(135deg, #f8fafc, #f1f5f9);
 color: #374151;
 font-weight: 700;
 font-size: 14px;
 border-bottom: 2px solid #e5e7eb;
}

td { 
 padding: 16px;
 border-bottom: 1px solid #f3f4f6;
 color: #1f2937;
}

tbody tr {
 transition: all 0.2s ease;
}

tbody tr:hover {
 background: #f9fafb;
 box-shadow: inset 0 0 8px rgba(99,102,241,0.05);
}

.row { 
 display: flex; 
 gap: 12px; 
 align-items: center;
}

.clickableRow {
 cursor: pointer;
 transition: all 0.2s ease;
 padding: 8px;
 border-radius: 8px;
}

.clickableRow:hover {
 background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
 transform: translateX(2px);
}

.row img {
 width: 44px;
 height: 44px;
 border-radius: 50%;
 object-fit: cover;
 border: 2px solid #e5e7eb;
}

.muted { 
 color: #6b7280; 
 font-size: 13px;
 font-weight: 500;
}

.badge {
 padding: 6px 14px;
 border-radius: 20px;
 font-size: 12px;
 font-weight: 700;
 display: inline-block;
 text-transform: capitalize;
}

.badge.pending {
 background: linear-gradient(135deg, #fef3c7, #fcd34d);
 color: #92400e;
}

.badge.assigned {
 background: linear-gradient(135deg, #dbeafe, #bfdbfe);
 color: #1e40af;
}

.badge.completed {
 background: linear-gradient(135deg, #dcfce7, #bbf7d0);
 color: #166534;
}

.assignBtn {
 background: linear-gradient(135deg, #6366f1, #8b5cf6);
 color: white;
 border: none;
 padding: 8px 16px;
 border-radius: 8px;
 cursor: pointer;
 font-weight: 600;
 font-size: 13px;
 transition: all 0.3s ease;
 box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}

.assignBtn:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 20px rgba(99,102,241,0.4);
}

.assignBtn:active {
 transform: translateY(0);
}

.modal {
 position: fixed;
 inset: 0;
 background: rgba(0, 0, 0, 0.5);
 display: flex;
 align-items: center;
 justify-content: center;
 backdrop-filter: blur(4px);
 animation: fadeIn 0.2s ease;
 overflow-y: auto;
padding: 20px;
}

@keyframes fadeIn {
 from { opacity: 0; }
 to { opacity: 1; }
}

.modalBox {
 background: white;
 padding: 28px;
 border-radius: 20px;
 width: 420px;
 max-height: 80vh;
 overflow-y: auto;   /* ⭐ SCROLL ENABLED */
 box-shadow: 0 20px 60px rgba(0,0,0,0.3);
 animation: slideUp 0.3s ease;
}


@keyframes slideUp {
 from { transform: translateY(20px); opacity: 0; }
 to { transform: translateY(0); opacity: 1; }
}

.modalBox h3 {
 margin: 0 0 20px 0;
 color: #1f2937;
 font-size: 18px;
 font-weight: 700;
}

.detailsModal {
 width: 500px;
}

.detailsHeader {
 text-align: center;
 margin-bottom: 24px;
 padding-bottom: 20px;
 border-bottom: 2px solid #f3f4f6;
}

.detailsAvatar {
 width: 80px;
 height: 80px;
 border-radius: 50%;
 object-fit: cover;
 border: 3px solid #6366f1;
 margin-bottom: 12px;
 display: block;
 margin-left: auto;
 margin-right: auto;
}

.detailsImage {
 width: 100%;
 max-width: 200px;
 height: 120px;
 object-fit: cover;
 border-radius: 12px;
 border: 2px solid #e5e7eb;
 margin-bottom: 16px;
 display: block;
 margin-left: auto;
 margin-right: auto;
}

.detailsContent {
 display: flex;
 flex-direction: column;
 gap: 16px;
}

.detailRow {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 12px;
 background: #f8fafc;
 border-radius: 10px;
 border-left: 3px solid #6366f1;
}

.detailLabel {
 font-weight: 600;
 color: #6b7280;
 font-size: 13px;
}

.detailValue {
 color: #1f2937;
 font-weight: 500;
 text-align: right;
}

.statusModal {
 width: 700px;
 max-height: 85vh;
 display: flex;
 flex-direction: column;
 overflow: hidden;
}

.statusModal h3 {
 margin: 0 0 16px 0;
 padding: 0;
 flex-shrink: 0;
}

.statusTasksList {
 display: flex;
 flex-direction: column;
 gap: 12px;
 flex: 1;
 overflow-y: auto;
 padding-right: 8px;
 scroll-behavior: smooth;
 min-height: 0;
}

.statusTasksList::-webkit-scrollbar {
 width: 8px;
}

.statusTasksList::-webkit-scrollbar-track {
 background: #f1f5f9;
 border-radius: 10px;
}

.statusTasksList::-webkit-scrollbar-thumb {
 background: linear-gradient(180deg, #6366f1, #8b5cf6);
 border-radius: 10px;
 box-shadow: 0 0 6px rgba(99,102,241,0.3);
}

.statusTasksList::-webkit-scrollbar-thumb:hover {
 background: linear-gradient(180deg, #4f46e5, #7c3aed);
 box-shadow: 0 0 10px rgba(99,102,241,0.5);
}

.statusTaskCard {
 background: #ffffff;
 border-radius: 12px;
 border-left: 4px solid #6366f1;
 overflow: visible;
 transition: all 0.2s ease;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.statusTaskCard:hover {
 box-shadow: 0 4px 12px rgba(99,102,241,0.15);
 transform: translateX(4px);
}

.taskCardHeader {
 display: flex;
 justify-content: space-between;
 align-items: flex-start;
 padding: 12px;
 background: white;
 border-bottom: 1px solid #e5e7eb;
}

.userInfo {
 display: flex;
 gap: 10px;
 align-items: center;
}

.userInfo img {
 width: 36px;
 height: 36px;
 border-radius: 50%;
 object-fit: cover;
}

.taskCardBody {
 padding: 12px;
 display: flex;
 flex-direction: column;
 gap: 8px;
}

.taskLabel {
 font-weight: 600;
 color: #475569;
 font-size: 12px;
}

.taskValue {
 color: #1f2937;
 word-break: break-word;
 word-wrap: break-word;
 white-space: normal;
 font-weight: 500;
}

.supportItem {
 display: flex;
 gap: 14px;
 align-items: center;
 padding: 14px;
 cursor: pointer;
 border-radius: 12px;
 transition: all 0.2s ease;
 margin-bottom: 8px;
}

.supportItem:hover {
 background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
 transform: translateX(4px);
}

.supportItem img {
 width: 44px;
 height: 44px;
 border-radius: 50%;
 object-fit: cover;
 border: 2px solid #e5e7eb;
}

.pagination {
 display: flex;
 gap: 8px;
 margin-top: 28px;
 justify-content: flex-end;
 align-items: center;
}

.pagination button {
 border: 2px solid #e5e7eb;
 padding: 8px 14px;
 border-radius: 8px;
 background: white;
 cursor: pointer;
 font-weight: 600;
 color: #6b7280;
 transition: all 0.2s ease;
 font-size: 13px;
}

.pagination button:hover:not(:disabled) {
 border-color: #6366f1;
 background: #f0f4f8;
 color: #6366f1;
}

.pagination button:disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.activePage {
 background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
 color: white !important;
 border-color: transparent !important;
 box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}
 .filterBtn {
 padding: 8px 16px;
 border-radius: 8px;
 border: 2px solid #e5e7eb;
 background: white;
 cursor: pointer;
 font-weight: 600;
 transition: all 0.2s ease;
}

.filterBtn:hover {
 border-color: #6366f1;
 color: #6366f1;
}

.activeFilter {
 background: linear-gradient(135deg, #6366f1, #8b5cf6);
 color: white;
 border-color: transparent;
}


`;
