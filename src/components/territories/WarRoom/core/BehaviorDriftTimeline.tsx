import React from 'react';

export interface BehaviorTimelineEvent {
  type: 'signature' | 'opening' | 'click' | 'email_sent' | 'silence';
  date: string;
  label: string;
}

export function BehaviorDriftTimeline({ events }: { events: BehaviorTimelineEvent[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        {/* Ligne centrale */}
        <div className="absolute left-[3px] top-4 bottom-4 w-px bg-white/10" />
        
        <div className="space-y-8">
          {events.map((event, i) => (
            <div key={`${event.type}-${i}`} className="flex gap-6 items-start relative">
              <div className={`w-2 h-2 rounded-full mt-2 z-10 ${
                event.type === 'signature' ? 'bg-emerald-400' :
                event.type === 'opening' ? 'bg-sky-400' :
                event.type === 'click' ? 'bg-indigo-400' :
                event.type === 'email_sent' ? 'bg-slate-400' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              }`} />
              
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                     event.type === 'silence' ? 'text-red-400' : 'text-white/40'
                  }`}>
                    {event.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-white/20">{event.date}</span>
                </div>
                <p className={`text-sm font-bold ${event.type === 'silence' ? 'text-red-200' : 'text-white/80'}`}>
                  {event.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {events.length === 0 && (
        <div className="py-8 text-center text-[10px] font-black text-white/10 uppercase tracking-widest">
           Aucun historique comportemental détecté
        </div>
      )}
    </div>
  );
}
