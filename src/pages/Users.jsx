
import { useState } from "react";
import { apiPost } from "../api/api";

export default function Users() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo_url, setPhotoUrl] = useState("");

  const submit = async () => {
    if (!id || !name || !phone || !photo_url) {
      alert("All fields required");
      return;
    }

    await apiPost("/users", {
      id,
      name,
      phone,
      role: "customer",
      isActive: true,
      photo_url,
      createdAt: new Date(),
    });

    alert("✅ User created");

    setId("");
    setName("");
    setPhone("");
    setPhotoUrl("");
  };

  return (
    <div className="users-page">
      <style>{css}</style>

      <div className="users-card">
        <h2>Add User</h2>

        <input
          placeholder="User ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Photo"
          value={photo_url}
          onChange={(e) => setPhotoUrl(e.target.value)}
        />

        <button className="save-btn" onClick={submit}>
          Save User
        </button>
      </div>
    </div>
  );
}

const css = `
* { box-sizing: border-box; }

.users-page {
 padding: 40px;
 background: #f8fafc;
 min-height: 100vh;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.users-card {
 background: white;
 padding: 40px;
 border-radius: 16px;
 max-width: 600px;
 margin: 0 auto;
 box-shadow: 0 4px 20px rgba(0,0,0,0.08);
 border-top: 4px solid linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 transition: all 0.3s ease;
}

.users-card:hover {
 box-shadow: 0 12px 40px rgba(0,0,0,0.12);
 transform: translateY(-4px);
}

.users-card h2 {
 margin: 0 0 32px 0;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 font-size: 26px;
 font-weight: 800;
}

.users-card input {
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

.users-card input::placeholder {
 color: #94a3b8;
}

.users-card input:focus {
 outline: none;
 border-color: #667eea;
 box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
 background: white;
}

.save-btn {
 width: 100%;
 margin-top: 28px;
 background: linear-gradient(135deg, #667eea, #764ba2);
 color: white;
 padding: 14px 24px;
 border: none;
 border-radius: 10px;
 cursor: pointer;
 font-weight: 700;
 font-size: 15px;
 transition: all 0.3s ease;
 box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.save-btn:active {
 transform: translateY(0);
}  
`;
