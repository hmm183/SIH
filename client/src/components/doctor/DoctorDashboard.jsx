// components/doctor/DoctorDashboard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, CalendarCheck2, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Patients Cured",
      value: 124,
      color: "from-green-500 to-green-700",
      icon: <UserCheck size={42} />,
    },
    {
      title: "Appointments Today",
      value: 18,
      color: "from-indigo-500 to-indigo-700",
      icon: <CalendarCheck2 size={42} />,
    },
    {
      title: "Remaining Patients",
      value: 6,
      color: "from-rose-500 to-rose-700",
      icon: <Users size={42} />,
    },
  ];

  // Dummy patients (replace with API later)
  const patients = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Michael Johnson" },
    { id: 4, name: "Emily Davis" },
    { id: 5, name: "Chris Brown" },
  ];

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setFiltered([]);
    } else {
      const results = patients.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(results);
    }
  };

  const handleSelect = (patient) => {
    setSearch(patient.name);
    setFiltered([]);
    navigate(`/patient/${patient.id}`);
  };

  return (
    <div className="pt-20 p-6">
      {/* 🔍 Search Bar */}
      <div className="relative max-w-md mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <Search className="ml-3 text-gray-500 " size={20} />
          <input
            type="text"
            placeholder="Search patient..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 outline-none dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Suggestions Dropdown */}
        {filtered.length > 0 && (
          <ul className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
            {filtered.map((patient) => (
              <li
                key={patient.id}
                onClick={() => handleSelect(patient)}
                className="px-4 py-2 cursor-pointer text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {patient.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl shadow-lg p-6
                       flex items-center justify-between transition-all duration-300`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.07, boxShadow: "0 0 25px rgba(0,0,0,0.3)" }}
          >
            <div>
              <h3 className="text-lg font-semibold">{stat.title}</h3>
              <p className="text-4xl font-extrabold mt-2">{stat.value}</p>
            </div>
            <div className="opacity-90">{stat.icon}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
