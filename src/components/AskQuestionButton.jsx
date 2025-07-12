import Link from 'next/link';

export default function AskQuestionButton({ className = '' }) {
  return (
    <Link href="/ask-question">
      <button className={`px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all ${className}`}>
        Ask Question
      </button>
    </Link>
  );
}