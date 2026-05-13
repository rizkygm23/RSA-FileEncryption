export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="max-w-md w-full">
            <div className="space-y-3 rounded-2xl border border-[#e2e2e2] bg-white p-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RoomListSkeleton() {
  return (
    <div className="divide-y divide-[#efefef]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4">
          <div className="flex items-start gap-3">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatLoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col bg-[#f3f3f3]">
      <div className="flex-1 p-6 space-y-4">
        <MessageSkeleton />
      </div>
      <div className="border-t border-[#e2e2e2] bg-white p-4">
        <div className="skeleton h-10 w-full rounded-full" />
      </div>
    </div>
  );
}
