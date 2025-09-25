import React, { useEffect, useState } from "react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL_E || "");

export default function PatientAppointmentsPage() {
  const [openAppointments, setOpenAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolvePatientId = () => {
    return localStorage.getItem("patientId") || localStorage.getItem("authToken") || null;
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const patientId = resolvePatientId();
        if (!patientId) {
          setError("No patientId found in localStorage. Please log in.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: token } : {};

        const res = await fetch(`${API_BASE}/appointments/patient/${patientId}`, { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch appointments");
        }

        // Controller returns { openAppointments, pastAppointments }
        setOpenAppointments(data.openAppointments || []);
        setPastAppointments(data.pastAppointments || []);
      } catch (err) {
        console.error("Fetch appointments error:", err);
        setError(err.message || "Error fetching appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-center mt-8">Loading appointments...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8 pt-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">My Appointments</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Upcoming Appointments</h2>
        {openAppointments.length ? (
          openAppointments.map((a) => (
            <div key={a._id} className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <p><strong>Doctor:</strong> {a.doctorId?.name ?? "—"}</p>
              <p><strong>Date:</strong> {new Date(a.appointmentDate).toLocaleString()}</p>
              <p><strong>Reason:</strong> {a.reason}</p>
              <p className="text-yellow-600"><strong>Status:</strong> {a.status}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No upcoming appointments.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Past Appointments</h2>
        {pastAppointments.length ? (
          pastAppointments.map((a) => (
            <div key={a._id} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
              <p><strong>Doctor:</strong> {a.doctorId?.name ?? "—"}</p>
              <p><strong>Date:</strong> {new Date(a.appointmentDate).toLocaleString()}</p>
              <p><strong>Reason:</strong> {a.reason}</p>
              <p className={a.status === "completed" ? "text-green-600" : "text-red-600"}><strong>Status:</strong> {a.status}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No past appointments.</p>
        )}
      </section>
    </div>
  );
}
