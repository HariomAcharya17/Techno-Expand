import { useState } from "react";

export default function Predict() {
  const [form, setForm] = useState({
    metric1: "",
    metric2: "",
    metric3: "",
    metric4: "",
    metric5: "",
    metric6: "",
    metric7: "",
    metric8: "",
    metric9: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend not running!");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Machine Failure Prediction</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(form).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="font-semibold mb-1">{key}</label>
            <input
              name={key}
              type="number"
              value={form[key]}
              onChange={handleChange}
              className="border p-2 rounded-md bg-white text-black"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handlePredict}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition"
      >
        Predict
      </button>

      {result && (
        <div className="mt-6 p-6 rounded-xl bg-white text-black shadow-lg">
          <h2 className="text-2xl font-bold">Prediction Result</h2>
          <p className="text-lg mt-3">Class: {result.class}</p>

          <p
            className={`text-2xl font-bold mt-2 ${
              result.condition === "Healthy"
                ? "text-green-600"
                : result.condition === "Medium"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            Condition: {result.condition}
          </p>
        </div>
      )}
    </div>
  );
}