import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/api";

export default function Tasks() {

  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignedList, setAssignedList] = useState([]); // ⭐ NEW

  const [task, setTask] = useState({
    bookingId: "",
    taskType: "pickup",
    userId: "",
    vehicleId: "",
    executionTime: "",
    assignedTo: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  useEffect(() => {

    apiGet("/users").then(setUsers);
    apiGet("/vehicles").then(setVehicles);

    // ⭐ GET EXISTING TASKS TO EXTRACT assignedTo
    apiGet("/tasks").then((tasks) => {

      // remove duplicates
      const uniqueAssigned = [
        ...new Set(tasks.map(t => t.assignedTo).filter(Boolean))
      ];

      setAssignedList(uniqueAssigned);
    });

  }, []);

  const submit = async () => {

    await apiPost("/tasks", {
      bookingId: task.bookingId,
      taskType: task.taskType,
      userId: task.userId,
      vehicleId: task.vehicleId,
      assignedTo: task.assignedTo,
      executionTime: new Date(task.executionTime),
      location: {
        latitude: Number(task.latitude),
        longitude: Number(task.longitude)
        ,
        address: task.address,
      },
    });

    alert("✅ Task created");
  };

  return (
    <div className="task-page">
      <style>{css}</style>

      <div className="task-card">
        <h2>Create Task</h2>

        <input
          placeholder="Booking ID"
          onChange={e => setTask({ ...task, bookingId: e.target.value })}
        />

        <select onChange={e => setTask({ ...task, userId: e.target.value })}>
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.id} ({u.phone})
            </option>
          ))}
        </select>

        <select onChange={e => setTask({ ...task, vehicleId: e.target.value })}>
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v._id} value={v._id}>
              {v.registrationNumber}
            </option>
          ))}
        </select>

        {/* ⭐ ASSIGNED TO DROPDOWN FROM TASKS */}
        <select
          value={task.assignedTo}
          onChange={e =>
            setTask({ ...task, assignedTo: e.target.value })
          }
        >
          <option value="">Select Assigned To</option>

          {assignedList.map((agent, index) => (
            <option key={index} value={agent}>
              {agent}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          onChange={e => setTask({ ...task, executionTime: e.target.value })}
        />

        <input
          placeholder="Latitude"
          onChange={e => setTask({ ...task, latitude: e.target.value })}
        />

        <input
          placeholder="Longitude"
          onChange={e => setTask({ ...task, longitude: e.target.value })}
        />

        <input
          placeholder="Address"
          onChange={e => setTask({ ...task, address: e.target.value })}
        />

        <button className="save-btn" onClick={submit}>
          Create Task
        </button>

      </div>
    </div>
  );
}

const css = `
* { box-sizing: border-box; }

.task-page {
 padding: 40px;
 background: #f8fafc;
 min-height: 100vh;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.task-card {
 background: white;
 padding: 40px;
 border-radius: 16px;
 max-width: 700px;
 margin: 0 auto;
 box-shadow: 0 4px 20px rgba(0,0,0,0.08);
 border-top: 4px solid #f59e0b;
 transition: all 0.3s ease;
}

.task-card:hover {
 box-shadow: 0 12px 40px rgba(0,0,0,0.12);
 transform: translateY(-4px);
}

.task-card h2 {
 margin: 0 0 32px 0;
 background: linear-gradient(135deg, #f59e0b, #d97706);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 font-size: 26px;
 font-weight: 800;
}

.task-card input,
.task-card select {
 width: 100%;
 padding: 14px 16px;
 margin-bottom: 18px;
 border-radius: 10px;
 border: 1px solid #e2e8f0;
 font-size: 14px;
 transition: all 0.3s ease;
 color: #1e293b;
 background: #f8fafc;
}

.task-card input::placeholder {
 color: #94a3b8;
}

.task-card input:focus,
.task-card select:focus {
 outline: none;
 border-color: #f59e0b;
 box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
 background: white;
}

.save-btn {
 width: 100%;
 margin-top: 28px;
 background: linear-gradient(135deg, #f59e0b, #d97706);
 color: white;
 padding: 14px 24px;
 border: none;
 border-radius: 10px;
 cursor: pointer;
 font-weight: 700;
 font-size: 15px;
 transition: all 0.3s ease;
 box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.save-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.save-btn:active {
 transform: translateY(0);
}
`;
