interface ResultCardProps {
  isValid: boolean;
  message: string;
}

export default function ResultCard({ isValid, message }: ResultCardProps) {
  return (
    <div className={`mt-4 p-4 border ${
      isValid 
        ? 'bg-emerald-50/50 border-emerald-200' 
        : 'bg-rose-50/50 border-rose-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div>
          <h3 className={`text-xs font-mono uppercase tracking-wider font-semibold mb-1 ${isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isValid ? 'VALID_SIGNATURE' : 'INVALID_SIGNATURE'}
          </h3>
          <p className="text-slate-700 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
