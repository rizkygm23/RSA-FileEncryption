import { Terminal } from 'lucide-react';

interface ProcessLogsProps {
  logs: string[];
  isComplete: boolean;
}

export default function ProcessLogs({ logs, isComplete }: ProcessLogsProps) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl bg-black p-4 text-white">
      <div className="mb-3 flex items-center justify-between border-b border-[#4b4b4b] pb-3">
        <h4 className="flex items-center gap-2 text-sm font-medium text-white">
          <Terminal className="h-4 w-4" />
          System output
        </h4>
        {!isComplete && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
      </div>
      <ul className="max-h-[220px] space-y-2 overflow-y-auto scrollbar-hide">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const showCursor = isLast && !isComplete;
          
          return (
            <li key={index} className="flex items-start gap-2 text-xs font-mono text-[#efefef]">
              <span className="select-none text-[#afafaf]">{'>'}</span>
              <span className="leading-relaxed">
                {log}
                {showCursor && <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-white align-middle" />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
