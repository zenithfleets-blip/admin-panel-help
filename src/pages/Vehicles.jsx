import { useState } from "react";
import { apiPost } from "../api/api";

export default function Vehicles() {

  const [v, setV] = useState({
    carName: "",
    brand: "",
    model: "",
    registrationNumber: "",
    transmissionType: "Manual",
    fuelType: "Petrol",
    seatingCapacity: 5,
    pricePerHour: 0,
    pricePerDay: 0,
    currentCity: "",
    status: "available",
    isActive: true,
    image_url: "",
  });

  const submit = async () => {

    await apiPost("/vehicles", v);

    alert("✅ Vehicle created");

    setV({
      carName: "",
      brand: "",
      model: "",
      registrationNumber: "",
      transmissionType: "Manual",
      fuelType: "Petrol",
      seatingCapacity: 5,
      pricePerHour: 0,
      pricePerDay: 0,
      currentCity: "",
      status: "available",
      isActive: true,
      image_url: "",
    });
  };

  return (
    <div className="vehicle-page">
      <style>{css}</style>

      <div className="vehicle-card">
        <h2>Add Vehicle</h2>

        <input placeholder="Car Name" value={v.carName} onChange={e => setV({ ...v, carName: e.target.value })} />
        <input placeholder="Brand" value={v.brand} onChange={e => setV({ ...v, brand: e.target.value })} />
        <input placeholder="Model" value={v.model} onChange={e => setV({ ...v, model: e.target.value })} />
        <input placeholder="Registration Number" value={v.registrationNumber} onChange={e => setV({ ...v, registrationNumber: e.target.value })} />

        <select value={v.transmissionType} onChange={e => setV({ ...v, transmissionType: e.target.value })}>
          <option>Manual</option>
          <option>Automatic</option>
        </select>

        <select value={v.fuelType} onChange={e => setV({ ...v, fuelType: e.target.value })}>
          <option>Petrol</option>
          <option>Diesel</option>
          <option>EV</option>
        </select>

        <input type="number" placeholder="Seats" value={v.seatingCapacity} onChange={e => setV({ ...v, seatingCapacity: +e.target.value })} />
        <input type="number" placeholder="Price / Hour" value={v.pricePerHour} onChange={e => setV({ ...v, pricePerHour: +e.target.value })} />
        <input type="number" placeholder="Price / Day" value={v.pricePerDay} onChange={e => setV({ ...v, pricePerDay: +e.target.value })} />
        <input placeholder="Current City" value={v.currentCity} onChange={e => setV({ ...v, currentCity: e.target.value })} />
        <input placeholder="Image URL (Firebase Storage)" value={v.image_url} onChange={e => setV({ ...v, image_url: e.target.value })} />

        <select value={v.status} onChange={e => setV({ ...v, status: e.target.value })}>
          <option>available</option>
          <option>unavailable</option>
        </select>

        <button className="save-btn" onClick={submit}>
          Save Vehicle
        </button>

      </div>
    </div>
  );
}


const css = `
* { box-sizing: border-box; }

.vehicle-page {
 padding: 40px;
 background: #f8fafc;
 min-height: 100vh;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.vehicle-card {
 background: white;
 padding: 40px;
 border-radius: 16px;
 max-width: 700px;
 margin: 0 auto;
 box-shadow: 0 4px 20px rgba(0,0,0,0.08);
 border-top: 4px solid #0ea5e9;
 transition: all 0.3s ease;
}

.vehicle-card:hover {
 box-shadow: 0 12px 40px rgba(0,0,0,0.12);
 transform: translateY(-4px);
}

.vehicle-card h2 {
 margin: 0 0 32px 0;
 background: linear-gradient(135deg, #0ea5e9, #06b6d4);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 font-size: 26px;
 font-weight: 800;
}

.vehicle-card input,
.vehicle-card select {
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

.vehicle-card input::placeholder {
 color: #94a3b8;
}

.vehicle-card input:focus,
.vehicle-card select:focus {
 outline: none;
 border-color: #0ea5e9;
 box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
 background: white;
}

.save-btn {
 width: 100%;
 margin-top: 28px;
 background: linear-gradient(135deg, #0ea5e9, #06b6d4);
 color: white;
 padding: 14px 24px;
 border: none;
 border-radius: 10px;
 cursor: pointer;
 font-weight: 700;
 font-size: 15px;
 transition: all 0.3s ease;
 box-shadow: 0 4px 15px rgba(14,165,233,0.3);
}

.save-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(14,165,233,0.4);
}

.save-btn:active {
 transform: translateY(0);
}
`;
