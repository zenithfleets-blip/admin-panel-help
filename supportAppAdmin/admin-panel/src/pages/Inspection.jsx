import { useEffect, useState } from "react";

export default function Inspection() {

  const [inspections, setInspections] = useState([]);
  const [preview, setPreview] = useState(null);

  const INSPECTION_API =
    "https://inspectionapi-b3okypgrgq-uc.a.run.app";

  const SUPPORT_API =
    "https://us-central1-phoneloginapp-7e9e0.cloudfunctions.net/supportApi/api";

  async function getInspectionData() {
    const res = await fetch(`${INSPECTION_API}/inspection`);
    return res.json();
  }

  async function getSupportStaff() {
    const res = await fetch(`${INSPECTION_API}/support`);
    return res.json();
  }

  async function getTaskDetail(taskId) {
    const res = await fetch(`${SUPPORT_API}/tasks/${taskId}`);
    return res.json();
  }

  useEffect(() => {

    const loadData = async () => {

      try {

        const [inspectionData, supportStaff] = await Promise.all([
          getInspectionData(),
          getSupportStaff()
        ]);

        const merged = await Promise.all(
          (inspectionData || []).map(async (item) => {

            try {

              const detail = await getTaskDetail(item.taskId);
              console.log(item)

              // Find delivery person by phone
              const deliveryPerson = supportStaff.find(
                s => s.phone === item.supportPhone
              );

              return {
                ...item,
                task: detail.task || {},
                user: detail.user || {},
                vehicle: detail.vehicle || {},
                deliveryPerson: deliveryPerson || {}
              };

            } catch (err) {

              return {
                ...item,
                task: {},
                user: {},
                vehicle: {},
                deliveryPerson: {}
              };

            }

          })
        );

        setInspections(merged);

      } catch (err) {
        console.error(err);
      }

    };

    loadData();

  }, []);

  return (

    <div className="inspection-page">
      <style>{css}</style>

      <h2>Inspection List</h2>

      {inspections.map((item) => (

        <div key={item._id} className="inspection-card">

          <h3>Task ID: {item.taskId}</h3>

          <div className="details-wrapper">

            {/* USER SECTION */}
            <div className="user-section">

              <h4 className="section-title">User</h4>

              <div className="user-box">

                <img
                  src={item.user?.photo_url || "/avatar.png"}
                  className="user-photo"
                  alt="user"
                  onClick={() =>
                    item.user?.photo_url &&
                    setPreview(item.user.photo_url)
                  }
                />

                <div>
                  <p><b>Name:</b> {item.user?.name || "N/A"}</p>
                  <p><b>Phone:</b> {item.user?.phone || "N/A"}</p>
                  <p><b>Location:</b> {item.task?.location?.address || "N/A"}</p>
                </div>

              </div>

            </div>

            {/* DELIVERY PERSON SECTION */}
            <div className="delivery-section">

              <h4 className="section-title">Delivery Person</h4>

              <div className="user-box">

                <img
                  src={item.deliveryPerson?.imageUrl || "/avatar.png"}
                  className="user-photo"
                  alt="support"
                  onClick={() =>
                    item.deliveryPerson?.imageUrl &&
                    setPreview(item.deliveryPerson.imageUrl)
                  }
                />

                <div>
                  <p><b>Name:</b> {item.deliveryPerson?.supportName || "N/A"}</p>
                  <p><b>Phone:</b> {item.deliveryPerson?.phone || "N/A"}</p>
                  <p><b>Status:</b> {item.task?.status || "N/A"}</p>
                  <p><b>Vehicle:</b> {item.vehicle?.registrationNumber || "N/A"}</p>
                </div>

              </div>

            </div>

          </div>

          {/* PHOTOS */}
          <div className="photo-grid">

            {item.photos &&
              Object.entries(item.photos).map(([key, url]) => (

                <div
                  key={key}
                  className="photo-box"
                  onClick={() => setPreview(url)}
                >
                  <img src={url} alt={key} />
                  <span className="photo-label">{key}</span>
                </div>

              ))}

          </div>

          {/* COMMENTS SECTION */}
          {item.comment && item.comment.trim() && (
            <div className="comments-section">
              <h4 className="section-title">Comments</h4>
              <div className="comment-box">
                <p>{item.comment}</p>
              </div>
            </div>
          )}

        </div>

      ))}

      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <img src={preview} alt="preview" />
        </div>
      )}

    </div>
  );
}

const css = `
* { box-sizing: border-box; }

.inspection-page { 
 padding: 40px;
 background: #f8fafc;
 min-height: 100vh;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.inspection-page h2 {
 margin: 0 0 32px 0;
 background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 font-size: 28px;
 font-weight: 800;
}

.inspection-card {
 background: white;
 padding: 24px;
 margin-bottom: 20px;
 border-radius: 16px;
 box-shadow: 0 8px 32px rgba(0,0,0,0.08);
 border-left: 5px solid #10b981;
 transition: all 0.3s ease;
}

.inspection-card:hover {
 box-shadow: 0 12px 40px rgba(0,0,0,0.12);
 transform: translateY(-2px);
}

.inspection-card h3 {
 margin: 0 0 20px 0;
 color: #1f2937;
 font-size: 16px;
 font-weight: 700;
}

.details-wrapper {
 display: flex;
 gap: 20px;
 flex-wrap: wrap;
 margin-bottom: 20px;
}

.user-section,
.delivery-section {
 background: linear-gradient(135deg, #f8fafc, #f1f5f9);
 padding: 18px;
 border-radius: 12px;
 min-width: 280px;
 flex: 1;
 border-left: 4px solid #6366f1;
}

.section-title {
 margin-bottom: 12px;
 font-weight: 700;
 font-size: 12px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 color: #6b7280;
}

.user-box {
 display: flex;
 gap: 12px;
 align-items: center;
}

.user-photo {
 width: 60px;
 height: 60px;
 border-radius: 50%;
 object-fit: cover;
 cursor: pointer;
 border: 3px solid #e5e7eb;
 transition: all 0.2s ease;
}

.user-photo:hover {
 border-color: #6366f1;
 box-shadow: 0 4px 12px rgba(99,102,241,0.2);
}

.user-box p {
 margin: 6px 0;
 font-size: 13px;
 color: #1f2937;
}

.user-box b {
 color: #374151;
}

.photo-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
 gap: 12px;
 margin-top: 18px;
}

.photo-box {
 position: relative;
 overflow: hidden;
 border-radius: 12px;
 cursor: pointer;
 box-shadow: 0 4px 12px rgba(0,0,0,0.08);
 transition: all 0.3s ease;
}

.photo-box:hover {
 box-shadow: 0 8px 24px rgba(0,0,0,0.15);
 transform: translateY(-4px);
}

.photo-box img {
 width: 100%;
 height: 160px;
 object-fit: cover;
 transition: transform 0.3s ease;
}

.photo-box:hover img {
 transform: scale(1.05);
}

.photo-label {
 position: absolute;
 bottom: 8px;
 left: 8px;
 background: rgba(0,0,0,0.7);
 color: white;
 padding: 6px 10px;
 border-radius: 6px;
 font-size: 12px;
 font-weight: 600;
 backdrop-filter: blur(4px);
}

.modal {
 position: fixed;
 inset: 0;
 background: rgba(0,0,0,0.9);
 display: flex;
 align-items: center;
 justify-content: center;
 backdrop-filter: blur(4px);
 z-index: 1000;
 animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
 from { opacity: 0; }
 to { opacity: 1; }
}

.modal img {
 max-width: 90%;
 max-height: 90%;
 border-radius: 12px;
 box-shadow: 0 20px 60px rgba(0,0,0,0.5);
 animation: slideUp 0.3s ease;
}

@keyframes slideUp {
 from { transform: translateY(20px); opacity: 0; }
 to { transform: translateY(0); opacity: 1; }
}

.comments-section {
 margin-top: 24px;
 padding: 16px;
 background: white;
 border-radius: 12px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.comment-box {
 background: #f9fafb;
 border-left: 4px solid #f32f08;
 padding: 16px;
 border-radius: 8px;
 font-size: 14px;
 line-height: 1.6;
 color: #475569;
 white-space: pre-wrap;
 word-break: break-word;
}
`;
