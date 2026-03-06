import { useEffect, useState } from "react";
import { apiGet } from "../api/api2";

export default function SupportStaff() {

  const [staff, setStaff] = useState([]);

  useEffect(() => {
    apiGet("/support")
      .then(setStaff)
      .catch(console.error);
  }, []);

  /* ================= PLATFORM DETECTOR ================= */

  function getPlatform(device) {
    if (!device) return "Unknown";

    const str =
      typeof device === "string"
        ? device.toLowerCase()
        : JSON.stringify(device).toLowerCase();

    if (str.includes("android")) return "Android";
    if (str.includes("ios") || str.includes("iphone")) return "iOS";

    return "Unknown";
  }

  return (
    <div className="overview-page">
      <style>{css}</style>

      <h2>Support Staff Overview</h2>

      {/* HEADER */}
      <div className="table-header">
        <div>Support</div>
        <div>Phone</div>
        <div>Platform</div>
        <div>Device</div>
      </div>

      {/* ROWS */}
      {staff.map((item) => {

        const platform = getPlatform(item.device);

        return (
          <div className="table-row" key={item._id}>

            {/* USER */}
            <div className="user-cell">
              <img src={item.imageUrl} className="avatar" />
              <div className="name">{item.supportName}</div>
            </div>

            {/* PHONE */}
            <div>{item.phone}</div>

            {/* PLATFORM BADGE */}
            <div>
              <span className="badge">
                {platform}
              </span>
            </div>

            {/* DEVICE (NO FULL MODEL NAME) */}
            <div>
              {platform === "Android" ? "Android Device" :
               platform === "iOS" ? "iPhone" :
               "Unknown"}
            </div>

          </div>
        );
      })}
    </div>
  );
}

const css = `
* { box-sizing: border-box; }

.overview-page {
 padding: 40px;
 background: #f8fafc;
 min-height: 100vh;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.overview-page h2 {
 margin: 0 0 32px 0;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 font-size: 28px;
 font-weight: 800;
}

.table-header {
 display: grid;
 grid-template-columns: 2fr 2fr 1fr 2fr;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 padding: 16px 20px;
 border-radius: 12px;
 font-weight: 700;
 color: white;
 font-size: 13px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 margin-bottom: 12px;
 box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.table-row {
 display: grid;
 grid-template-columns: 2fr 2fr 1fr 2fr;
 align-items: center;
 padding: 16px 20px;
 background: white;
 border-radius: 10px;
 margin-bottom: 8px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.04);
 border-left: 4px solid linear-gradient(180deg, #667eea, #764ba2);
 transition: all 0.2s ease;
}

.table-row:hover {
 background: #f8fafc;
 box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
 transform: translateX(4px);
}

.user-cell {
 display: flex;
 align-items: center;
 gap: 12px;
}

.avatar {
 width: 44px;
 height: 44px;
 border-radius: 50%;
 object-fit: cover;
 border: 2px solid #e5e7eb;
}

.name {
 font-weight: 700;
 color: #1f2937;
 font-size: 14px;
}

.badge {
 background: linear-gradient(135deg, #dbeafe, #bfdbfe);
 color: #1e40af;
 padding: 6px 14px;
 border-radius: 20px;
 font-size: 12px;
 font-weight: 700;
 display: inline-block;
}
`;
