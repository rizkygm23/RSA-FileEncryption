interface ProcessLogsProps {
  logs: string[];
  isComplete: boolean;
}

export default function ProcessLogs({ logs, isComplete }: ProcessLogsProps) {
  if (logs.length === 0) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mt-6">
      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Process Log</h4>
      <ul className="space-y-2">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const showSpinner = isLast && !isComplete;
          
          return (
            <li key={index} className="flex items-start gap-3 text-sm text-zinc-400">
              <div className="mt-1">
                {showSpinner ? (
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                )}
              </div>
              <span className="font-mono text-xs leading-relaxed">{log}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
