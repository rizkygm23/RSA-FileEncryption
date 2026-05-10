interface ResultCardProps {
  isValid: boolean;
  message: string;
}

export default function ResultCard({ isValid, message }: ResultCardProps) {
  return (
    <div className={`mt-6 p-6 rounded-lg border ${
      isValid 
        ? 'bg-zinc-900 border-zinc-700' 
        : 'bg-zinc-900 border-zinc-700'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-2 h-2 rounded-full mt-2 ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <h3 className={`text-lg font-semibold mb-2 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
            {isValid ? 'Signature Valid' : 'Signature Invalid'}
          </h3>
          <p className="text-zinc-400 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
