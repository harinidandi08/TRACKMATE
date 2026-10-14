import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function App() {
  const [labs, setLabs] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [envLogs, setEnvLogs] = useState([]);
  const [trend, setTrend] = useState(null);
  const [tab, setTab] = useState("labs");

  const [labForm, setLabForm] = useState({
    testName: "",
    value: "",
    unit: "",
    referenceMin: "",
    referenceMax: "",
    bloodGroup: "",
    reportDate: new Date().toISOString().slice(0,10),
    confirmed: false
  });

  const [medForm, setMedForm] = useState({
    name: "", batchNumber: "", expiryDate: "", quantity: 0, minimumStock: 10
  });

  const fetchAll = async () => {
    try {
      const [lRes, mRes, eRes] = await Promise.all([
        fetch(`${API}/labs?patientId=demo-patient`),
        fetch(`${API}/medicines`),
        fetch(`${API}/environment`)
      ]);
      if(lRes.ok) setLabs(await lRes.json());
      if(mRes.ok) setMedicines(await mRes.json());
      if(eRes.ok) setEnvLogs(await eRes.json());
    } catch(e) { console.log(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  const submitLab = async (e) => {
    e.preventDefault();
    if(!labForm.confirmed) return alert("Please tick confirm checkbox - only user-confirmed values are saved");
    const res = await fetch(`${API}/labs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "demo-patient",
        testName: labForm.testName,
        value: Number(labForm.value),
        unit: labForm.unit,
        referenceMin: labForm.referenceMin ? Number(labForm.referenceMin) : null,
        referenceMax: labForm.referenceMax ? Number(labForm.referenceMax) : null,
        bloodGroup: labForm.bloodGroup || null,
        reportDate: labForm.reportDate,
        confirmed: true
      })
    });
    const data = await res.json();
    if(!res.ok) return alert(data.error);
    setLabs([data, ...labs]);
    setLabForm({ ...labForm, testName: "", value: "", unit: "", confirmed: false });
  };

  const checkTrend = async (id) => {
    const res = await fetch(`${API}/labs/${id}/trend`);
    const data = await res.json();
    if(!res.ok) return alert(data.error);
    setTrend(data);
  };

  const submitMedicine = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medForm)
    });
    const data = await res.json();
    if(!res.ok) return alert(data.error);
    fetchAll();
    setMedForm({ name: "", batchNumber: "", expiryDate: "", quantity: 0, minimumStock: 10 });
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>TrackMate - HealthSphere 360</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["labs","medicines","environment"].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding: "8px 16px", background: tab===t ? "black" : "#eee", color: tab===t ? "white" : "black", border: 0, borderRadius: 6, cursor: "pointer" }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === "labs" && (
        <>
          <form onSubmit={submitLab} style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, display: "grid", gap: 8 }}>
            <h3>Add Lab Report (User Confirmed Only)</h3>
            <input placeholder="Test Name *" value={labForm.testName} onChange={e=>setLabForm({...labForm, testName: e.target.value})} required />
            <input placeholder="Value *" type="number" step="any" value={labForm.value} onChange={e=>setLabForm({...labForm, value: e.target.value})} required />
            <input placeholder="Unit * e.g. mg/dL" value={labForm.unit} onChange={e=>setLabForm({...labForm, unit: e.target.value})} required />
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Ref Min" type="number" step="any" value={labForm.referenceMin} onChange={e=>setLabForm({...labForm, referenceMin: e.target.value})} />
              <input placeholder="Ref Max" type="number" step="any" value={labForm.referenceMax} onChange={e=>setLabForm({...labForm, referenceMax: e.target.value})} />
            </div>
            <select value={labForm.bloodGroup} onChange={e=>setLabForm({...labForm, bloodGroup: e.target.value})}>
              <option value="">Blood Group (optional)</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g=><option key={g} value={g}>{g}</option>)}
            </select>
            <input type="date" value={labForm.reportDate} onChange={e=>setLabForm({...labForm, reportDate: e.target.value})} required />
            <label><input type="checkbox" checked={labForm.confirmed} onChange={e=>setLabForm({...labForm, confirmed: e.target.checked})} /> I confirm this value is correct</label>
            <button type="submit" style={{ background: "black", color: "white", padding: 10, borderRadius: 6 }}>Save Lab</button>
          </form>

          <div style={{ marginTop: 20 }}>
            {labs.map(l => (
              <div key={l.id} style={{ border: "1px solid #eee", padding: 10, marginBottom: 8, borderRadius: 6 }}>
                <b>{l.test_name}</b> : {l.value} {l.unit} on {l.report_date} {l.blood_group && `| ${l.blood_group}`}
                <button onClick={()=>checkTrend(l.id)} style={{ marginLeft: 10 }}>Trend</button>
              </div>
            ))}
          </div>

          {trend && (
            <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, marginTop: 10 }}>
              <h4>Trend for {trend.current.test_name}</h4>
              <p>Current: {trend.current.value} | Previous: {trend.previous?.value || "N/A"}</p>
              <p>Change: {trend.change} ({trend.percentChange?.toFixed(2)}%)</p>
              <p style={{ color: trend.outsideReferenceRange ? "red" : "green" }}>{trend.outsideReferenceRange ? "Outside Reference Range" : "Within Range"}</p>
              <p><i>{trend.explanation}</i></p>
              <small style={{ color: "#666" }}>{trend.disclaimer}</small>
              <br/><button onClick={()=>setTrend(null)}>Close</button>
            </div>
          )}
        </>
      )}

      {tab === "medicines" && (
        <>
          <form onSubmit={submitMedicine} style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, display: "grid", gap: 8 }}>
            <h3>Add Medicine</h3>
            <input placeholder="Name *" value={medForm.name} onChange={e=>setMedForm({...medForm, name: e.target.value})} required />
            <input placeholder="Batch Number *" value={medForm.batchNumber} onChange={e=>setMedForm({...medForm, batchNumber: e.target.value})} required />
            <input type="date" value={medForm.expiryDate} onChange={e=>setMedForm({...medForm, expiryDate: e.target.value})} required />
            <input type="number" placeholder="Quantity" value={medForm.quantity} onChange={e=>setMedForm({...medForm, quantity: Number(e.target.value)})} />
            <button type="submit" style={{ background: "black", color: "white", padding: 10, borderRadius: 6 }}>Add Medicine</button>
          </form>
          <div style={{ marginTop: 20 }}>
            {medicines.map(m => (
              <div key={m.id} style={{ borderLeft: `4px solid ${m.expired ? "red" : m.nearExpiry ? "orange" : m.lowStock ? "gold" : "green"}`, padding: 8, marginBottom: 6, background: "#fafafa" }}>
                {m.name} - Batch: {m.batch_number} - Qty: {m.quantity} - Exp: {m.expiry_date} {m.expired && " (EXPIRED)"} {m.lowStock && " (LOW STOCK)"}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "environment" && (
        <div>
          <h3>Environment Logs (Last 20)</h3>
          {envLogs.map(e => (
            <div key={e.id} style={{ borderBottom: "1px solid #eee", padding: 6 }}>{e.location} - {e.temperature}°C - AQI {e.aqi} - {e.recorded_at}</div>
          ))}
        </div>
      )}
    </div>
  );
}