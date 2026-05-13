import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultCardProps {
  isValid: boolean;
  message: string;
}

export default function ResultCard({ isValid, message }: ResultCardProps) {
  const Icon = isValid ? CheckCircle2 : XCircle;

  return (
    <div className={`mt-4 rounded-2xl border p-5 ${
      isValid 
        ? 'border-black bg-black text-white' 
        : 'border-[#e2e2e2] bg-[#efefef] text-black'
    }`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="mb-1 text-base font-bold">
            {isValid ? 'Signature valid' : 'Signature invalid'}
          </h3>
          <p className={`text-sm ${isValid ? 'text-[#efefef]' : 'text-[#5e5e5e]'}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
