interface ProcessLogsProps {
  logs: string[];
  isComplete: boolean;
}

export default function ProcessLogs({ logs, isComplete }: ProcessLogsProps) {
  if (logs.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 mt-6">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">System Output</h4>
        {!isComplete && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
      </div>
      <ul className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const showCursor = isLast && !isComplete;
          
          return (
            <li key={index} className="flex items-start gap-2 text-xs font-mono text-slate-300">
              <span className="text-slate-600 select-none">{'>'}</span>
              <span className="leading-relaxed">
                {log}
                {showCursor && <span className="inline-block w-1.5 h-3 ml-1 bg-indigo-400 animate-pulse align-middle" />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
