import React from 'react';

export type ActivityEvent = {
  id: string;
  type: 'email_sent' | 'war_room_entry' | 'war_room_exit' | 'decision' | 'interaction';
  label: string;
  time: string;
  detail: string;
};

export function SystemActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
      {events.map((event) => (
        <div key={event.id} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
          <div className="flex flex-col items-center gap-2">
             <div className={`w-2 h-2 rounded-full mt-1.5 ${
               event.type === 'email_sent' ? 'bg-sky-400' :
               event.type === 'war_room_entry' ? 'bg-red-500' :
               event.type === 'decision' ? 'bg-indigo-400' : 'bg-white/20'
             }`} />
             <div className="w-[1px] flex-1 bg-white/5 group-last:hidden" />
          </div>
          
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{event.time}</span>
               <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{event.type.replace('_', ' ')}</span>
            </div>
            <p className="text-sm font-bold text-white/80">{event.label}</p>
            <p className="text-[11px] text-white/30 italic font-medium">{event.detail}</p>
          </div>
        </div>
      ))}
      
      {events.length === 0 && (
        <div className="py-12 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">En attente de nouveaux signaux...</p>
        </div>
      )}
    </div>
  );
}
