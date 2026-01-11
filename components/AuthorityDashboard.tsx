
import React from 'react';
import { Escalation, Complaint, Task, TaskStatus } from '../types';

interface Props {
  escalations: Escalation[];
  complaints: Complaint[];
  tasks: Task[];
}

const AuthorityDashboard: React.FC<Props> = ({ escalations, complaints, tasks }) => {
  const activeEscalations = escalations.filter(e => !e.resolved);

  return (
    <div className="space-y-8">
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border-l-4 border-rose-500 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">Active Escalations</p>
          <h4 className="text-3xl font-bold text-rose-600">{activeEscalations.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">Blocked Tasks</p>
          <h4 className="text-3xl font-bold text-amber-600">{tasks.filter(t => t.status === TaskStatus.BLOCKED).length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">Success Rate (Avg)</p>
          <h4 className="text-3xl font-bold text-blue-600">84.2%</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm">
          <p className="text-gray-500 text-sm font-semibold mb-1">Citizen Feedback</p>
          <h4 className="text-3xl font-bold text-emerald-600">4.8/5</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Escalation Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h4 className="font-bold text-lg">System Escalations (AI Flagged)</h4>
            <span className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded font-bold uppercase">Immediate Action Required</span>
          </div>
          <div className="divide-y divide-gray-100">
            {activeEscalations.length === 0 ? (
              <div className="p-12 text-center text-gray-400">All departments are within SLA limits.</div>
            ) : activeEscalations.map(e => {
              const task = tasks.find(t => t.id === e.taskId);
              const complaint = complaints.find(c => c.id === e.complaintId);
              return (
                <div key={e.id} className="p-6 flex gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-bold text-gray-800 truncate">{complaint?.title}</h5>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">{task?.department}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Issue: {e.reason}</p>
                    <div className="flex items-center gap-3">
                      <button className="text-xs font-bold text-blue-600">Reassign</button>
                      <button className="text-xs font-bold text-gray-400">Call HOD</button>
                      <button className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">View History</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delay Heatmap Mock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b">
            <h4 className="font-bold text-lg">Department Bottlenecks</h4>
          </div>
          <div className="p-6 space-y-4">
            {['Water', 'Roads', 'Electricity', 'Sanitation'].map(dept => {
              const deptTasks = tasks.filter(t => t.department === dept);
              const total = deptTasks.length;
              const overdue = deptTasks.filter(t => t.slaDeadline < Date.now() && t.status !== TaskStatus.COMPLETED).length;
              const percent = total > 0 ? (overdue / total) * 100 : 0;
              
              return (
                <div key={dept} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">{dept}</span>
                    <span className="text-gray-400">{overdue} breaches / {total} total</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${percent > 50 ? 'bg-rose-500' : percent > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.max(5, percent)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 p-6 rounded-b-2xl border-t text-sm text-gray-500">
            <p><i className="fa-solid fa-circle-info mr-2"></i>AI Predicts a 15% increase in "Roads" complaints due to upcoming monsoon season.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
