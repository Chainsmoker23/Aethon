import { MessagingInterface } from "@/components/family/MessagingInterface";

export default function MessagesPage() {
  return (
    <div className="flex flex-col h-full -mt-[2px]">
      <main className="flex-1 overflow-hidden relative">
        <MessagingInterface />
      </main>
    </div>
  );
}
