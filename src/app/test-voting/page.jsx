"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "react-hot-toast"

export default function TestVotingPage() {
  const { data: session } = useSession()
  const [votes, setVotes] = useState(0)
  const [userVote, setUserVote] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to vote")
      return
    }

    console.log('Test vote handler called:', { value, userId: session.user.id })
    
    setLoading(true)
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "question", 
          itemId: "test-question-id", 
          userId: session.user.id, 
          value 
        }),
      })
      const data = await res.json()
      console.log('Test vote API response:', data)

      if (!res.ok) throw new Error(data.error || "Vote failed")

      setVotes(data.totalVotes)
      setUserVote(data.userVote)
      toast.success("Vote recorded!")
    } catch (e) {
      console.error('Test vote error:', e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Voting Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Test Question</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote(1)}
              className={userVote === 1 ? "bg-green-100 text-green-600" : ""}
              disabled={loading}
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
            
            <span className="text-xl font-medium my-2">{votes}</span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote(-1)}
              className={userVote === -1 ? "bg-red-100 text-red-600" : ""}
              disabled={loading}
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
          </div>
          
          <div>
            <p className="text-gray-700">This is a test question to verify voting functionality.</p>
            <p className="text-sm text-gray-500 mt-2">
              Current user vote: {userVote === 1 ? "Upvoted" : userVote === -1 ? "Downvoted" : "No vote"}
            </p>
          </div>
        </div>
        
        {!session && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">Please sign in to test voting functionality.</p>
          </div>
        )}
      </div>
    </div>
  )
} 