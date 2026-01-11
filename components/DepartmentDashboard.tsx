
import React, { useState } from 'react';
import { Task, Complaint, TaskStatus } from '../types';

interface Props {
  tasks: Task[];
  complaints: Complaint[];
  onUpdateTask: (id: string, status: TaskStatus, reason?: string) => void;
}

const DepartmentDashboard: React.FC<Props> = ({ tasks, complaints, onUpdateTask }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const getSLAIndicator = (deadline: number) => {
    const hoursRemaining = (deadline - Date.now()) / (1000 * 60 * 60);
    if (hoursRemaining < 0) return <span className="flex items-center gap-2 text-red-600 font-bold"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> OVERDUE</span>;
    if (hoursRemaining < 12) return <span className="flex items-center gap-2 text-amber-600 font-bold"><span className="w-2 h-2 rounded-full bg-amber-600"></span> CRITICAL</span>;
    return <span className="flex items-center gap-2 text-emerald-600 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> ON TRACK</span>;
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">Total Active Tasks</p>
          <h4 className="text-3xl font-bold">{tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">SLA At Risk</p>
          <h4 className="text-3xl font-bold text-amber-600">{tasks.filter(t => (t.slaDeadline - Date.now()) < 12 * 3600000 && t.status !== TaskStatus.COMPLETED).length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">Completed (24h)</p>
          <h4 className="text-3xl font-bold text-emerald-600">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</h4>
        </div>
      </div>

      {/* Task Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h4 className="font-bold text-lg">Work Priority Queue</h4>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-gray-100 text-xs font-bold rounded-lg text-gray-600">All</button>
            <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-500">Urgent</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
              <tr>
                <th className="px-6 py-4">Complaint / Location</th>
                <th className="px-6 py-4">SLA Health</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                   <td colSpan={4} className="p-12 text-center text-gray-400">No tasks assigned to your department.</td>
                </tr>
              ) : tasks.sort((a,b) => a.slaDeadline - b.slaDeadline).map(t => {
                const complaint = complaints.find(c => c.id === t.complaintId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{complaint?.title || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{complaint?.location}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getSLAIndicator(t.slaDeadline)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                        t.status === TaskStatus.BLOCKED ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       {t.status === TaskStatus.ASSIGNED && (
                         <button onClick={() => onUpdateTask(t.id, TaskStatus.STARTED)} className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg">Start</button>
                       )}
                       {t.status === TaskStatus.STARTED && (
                         <>
                           <button onClick={() => onUpdateTask(t.id, TaskStatus.COMPLETED)} className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg">Complete</button>
                           <button onClick={() => setSelectedTask(t.id)} className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg">Block</button>
                         </>
                       )}
                       {t.status === TaskStatus.COMPLETED && (
                         <span className="text-gray-400 italic text-xs">Closed</span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Reason Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
            <h4 className="text-xl font-bold mb-4">Why is this task blocked?</h4>
            <select 
              className="w-full p-3 bg-gray-50 border rounded-xl mb-4"
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
            >
              <option value="">Select Reason...</option>
              <option value="Missing Parts">Missing Parts / Materials</option>
              <option value="Requires Police Coordination">Requires Police Coordination</option>
              <option value="Severe Weather">Severe Weather</option>
              <option value="Under Review">Under Review</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setSelectedTask(null)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl">Cancel</button>
              <button 
                disabled={!blockReason}
                onClick={() => {
                  onUpdateTask(selectedTask, TaskStatus.BLOCKED, blockReason);
                  setSelectedTask(null);
                  setBlockReason("");
                }} 
                className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl"
              >
                Mark Blocked
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDashboard;
