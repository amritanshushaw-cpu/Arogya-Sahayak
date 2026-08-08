"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PhcMap = dynamic(() => import("@/components/PhcMap"), { ssr: false });

const diseaseData = [
  { name: "Jan", diabetes: 40, hypertension: 24 },
  { name: "Feb", diabetes: 45, hypertension: 28 },
  { name: "Mar", diabetes: 55, hypertension: 32 },
  { name: "Apr", diabetes: 50, hypertension: 38 },
  { name: "May", diabetes: 65, hypertension: 42 },
  { name: "Jun", diabetes: 70, hypertension: 50 },
];

const alertsData = [
  { id: 1, name: "Ramesh Kumar", village: "Danapur", risk: "RED" },
  { id: 2, name: "Sunita Devi", village: "Phulwari", risk: "RED" },
  { id: 3, name: "Anil Sharma", village: "Bihta", risk: "YELLOW" },
  { id: 4, name: "Priya Singh", village: "Maner", risk: "YELLOW" },
];

export default function PhcDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">PHC District Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Screenings</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-500 uppercase">Active RED Alerts</p>
          <p className="text-4xl font-bold text-red-600 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-500 uppercase">Active YELLOW Alerts</p>
          <p className="text-4xl font-bold text-yellow-500 mt-2">34</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Disease Trends (Last 6 Months)</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="diabetes" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} name="Diabetes" />
                <Line type="monotone" dataKey="hypertension" stroke="#3b82f6" strokeWidth={2} name="Hypertension" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">High-Risk Geographic Distribution</h2>
          <PhcMap />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Patient Alerts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                <th className="p-4 font-medium">Patient Name</th>
                <th className="p-4 font-medium">Village</th>
                <th className="p-4 font-medium">Risk Level</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {alertsData.map((alert) => (
                <tr key={alert.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{alert.name}</td>
                  <td className="p-4 text-gray-600">{alert.village}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        alert.risk === "RED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {alert.risk}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Details
                    </button>
                    <Link href="/teleconsult" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                      Teleconsult
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
