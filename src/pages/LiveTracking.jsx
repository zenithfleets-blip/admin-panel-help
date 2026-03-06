import { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

import { apiGet, gMapApi } from "../api/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

export default function MapScreen() {
  const [drivers, setDrivers] = useState([]);
  const [directions, setDirections] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const center = { lat: 20.4169, lng: 72.8742 };
  
  const pageStyles = `
.deliveryModal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modalContent {
  background: white;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modalHeader h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.closeBtn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.closeBtn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modalBody {
  padding: 24px;
}

.detailItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.detailItem .label {
  font-weight: 600;
  color: #475569;
  font-size: 13px;
}

.detailItem .value {
  color: #1e293b;
  font-weight: 600;
  text-align: right;
  flex: 1;
  margin-left: 12px;
}

.closeModalBtn {
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.closeModalBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}
`;

  // ✅ Load accepted drivers
  useEffect(() => {
    async function loadDrivers() {
      const data = await apiGet("/tasks");
      console.log(data)

      const acceptedDrivers = data
        .filter(
          (t) =>
            t.status === "accepted" &&
            t.deliveryBoyLocation?.lat != null &&
            t.deliveryBoyLocation?.lng != null &&
            t.location?.latitude != null &&
            t.location?.longitude != null,
        )
        .map((t) => ({
          id: t._id,
          driverLat: Number(t.deliveryBoyLocation.lat),
          driverLng: Number(t.deliveryBoyLocation.lng),
          destLat: Number(t.location.latitude),
          destLng: Number(t.location.longitude),

          deliveryPersonName: t.deliveryPersonName || "Unknown",
          vehicleNumber: t.vehicle?.registrationNumber || "N/A",
          assignedTo: t.assignedTo || "N/A",
        }));

      setDrivers(acceptedDrivers);
    }

    loadDrivers();
  }, []);

  // ✅ Draw route when clicking delivery boy
  function drawRoute(driver) {
    setSelectedDriver(driver);
    setShowModal(true); // ⭐ OPEN MODAL

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: {
          lat: driver.driverLat,
          lng: driver.driverLng,
        },
        destination: {
          lat: driver.destLat,
          lng: driver.destLng,
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      },
    );
  }

  return (
    <>
      <style>{pageStyles}</style>
      <LoadScript googleMapsApiKey={gMapApi}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
          {drivers.map((driver) => (
            <Marker
              key={driver.id}
              position={{
                lat: driver.driverLat,
                lng: driver.driverLng,
              }}
              onClick={() => drawRoute(driver)}
              icon={{
                url: "https://maps.google.com/mapfiles/kml/shapes/motorcycling.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}

          {selectedDriver && (
            <Marker
              position={{
                lat: selectedDriver.destLat,
                lng: selectedDriver.destLng,
              }}
            />
          )}

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
              }}
            />
          )}
          
          {showModal && selectedDriver && (
            <div className="deliveryModal">
              <div className="modalContent">
                <div className="modalHeader">
                  <h3>📍 Delivery Details</h3>
                  <button className="closeBtn" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <div className="modalBody">
                  <div className="detailItem">
                    <span className="label">👤 Name:</span>
                    <span className="value">{selectedDriver.deliveryPersonName}</span>
                  </div>

                  <div className="detailItem">
                    <span className="label">🚗 Vehicle:</span>
                    <span className="value">{selectedDriver.vehicleNumber}</span>
                  </div>

                  <div className="detailItem">
                    <span className="label">👨‍💼 Assigned To:</span>
                    <span className="value">{selectedDriver.assignedTo}</span>
                  </div>

                  <div className="detailItem">
                    <span className="label">📱 Mobile:</span>
                    <span className="value">{selectedDriver.assignedTo}</span>
                  </div>
                </div>

                <button className="closeModalBtn" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          )}
        </GoogleMap>
      </LoadScript>
    </>
  );
}
