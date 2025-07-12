"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import parse from "html-react-parser"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ContentFilter from "@/components/ui/ContentFilter"
import ThreadedComment from "@/components/ui/ThreadedComment"
import Reply from "@/components/ui/Reply"
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Clock,
  Tag,
  ThumbsUp,
  AlertCircle,
  Check,
  Send,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "react-hot-toast"

export default function QuestionDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()

  // Question state
  const [question, setQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Answers state
  const [answers, setAnswers] = useState([])
  const [answersLoading, setAnswersLoading] = useState(false)
  const [answerFilter, setAnswerFilter] = useState("newest")

  // Comments state
  const [questionComments, setQuestionComments] = useState([])
  const [questionCommentsLoading, setQuestionCommentsLoading] = useState(false)
  const [questionCommentFilter, setQuestionCommentFilter] = useState("newest")

  // Form states
  const [answerContent, setAnswerContent] = useState("")
  const [questionComment, setQuestionComment] = useState("")

  // Loading states
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  // Voting states
  const [questionUserVote, setQuestionUserVote] = useState(0)
  const [answerUserVotes, setAnswerUserVotes] = useState({})
  const [voteLoading, setVoteLoading] = useState({})

  // Reply states
  const [showReplyForm, setShowReplyForm] = useState({})
  const [replyContent, setReplyContent] = useState({})
  const [submittingReply, setSubmittingReply] = useState({})

  // Fetch question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/questions/${id}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch question")
        }

        const data = await response.json()
        setQuestion(data)
      } catch (err) {
        console.error("Error fetching question:", err)
        setError(err.message || "An error occurred while fetching the question")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchQuestion()
    }
  }, [id])

  // Fetch answers
  const fetchAnswers = async (filter = answerFilter) => {
    try {
      setAnswersLoading(true)
      const params = new URLSearchParams({
        filter,
        ...(session?.user?.id && { userId: session.user.id }),
      })

      const response = await fetch(`/api/questions/${id}/answers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnswers(data.answers)
      }
    } catch (error) {
      console.error("Error fetching answers:", error)
    } finally {
      setAnswersLoading(false)
    }
  }

  // Fetch question comments
  const fetchQuestionComments = async (filter = questionCommentFilter) => {
    try {
      setQuestionCommentsLoading(true)
      const params = new URLSearchParams({
        filter,
        ...(session?.user?.id && { userId: session.user.id }),
      })

      const response = await fetch(`/api/questions/${id}/comments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestionComments(data.comments)
      }
    } catch (error) {
      console.error("Error fetching question comments:", error)
    } finally {
      setQuestionCommentsLoading(false)
    }
  }

  // Load answers and comments when question loads
  useEffect(() => {
    if (question) {
      fetchAnswers()
      fetchQuestionComments()
    }
  }, [question])

  // Refetch answers when filter changes
  useEffect(() => {
    if (question) {
      fetchAnswers(answerFilter)
    }
  }, [answerFilter])

  // Refetch question comments when filter changes
  useEffect(() => {
    if (question) {
      fetchQuestionComments(questionCommentFilter)
    }
  }, [questionCommentFilter])

  // Handle answer submission
  const handleAnswerSubmit = async (e) => {
    e.preventDefault()
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    try {
      setSubmittingAnswer(true)
      const response = await fetch(`/api/questions/${id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: answerContent,
          authorId: session.user.id,
        }),
      })

      if (response.ok) {
        setAnswerContent("")
        fetchAnswers()
        toast.success("Answer posted successfully!")
      } else {
        toast.error("Failed to post answer")
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast.error("Error submitting answer")
    } finally {
      setSubmittingAnswer(false)
    }
  }

  // Handle question comment submission
  const handleQuestionCommentSubmit = async (e) => {
    e.preventDefault()
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    try {
      setSubmittingComment(true)
      const response = await fetch(`/api/questions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: questionComment,
          authorId: session.user.id,
        }),
      })

      if (response.ok) {
        setQuestionComment("")
        fetchQuestionComments()
        toast.success("Comment posted successfully!")
      } else {
        toast.error("Failed to post comment")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast.error("Error submitting comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Handle question comment replies
  const handleQuestionCommentReply = async (parentCommentId, content) => {
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch(`/api/questions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorId: session.user.id,
          parentCommentId,
        }),
      })

      if (response.ok) {
        fetchQuestionComments()
        toast.success("Reply posted successfully!")
      } else {
        toast.error("Failed to post reply")
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast.error("Error submitting reply")
    }
  }

  // Handle answer comment replies
  const handleAnswerCommentReply = async (answerId, parentCommentId, content) => {
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorId: session.user.id,
          parentCommentId,
        }),
      })

      if (response.ok) {
        fetchAnswers() // Refresh answers to get updated comments
        toast.success("Reply posted successfully!")
      } else {
        toast.error("Failed to post reply")
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast.error("Error submitting reply")
    }
  }

  // Fetch user vote for question
  useEffect(() => {
    if (session?.user?.id && question?._id) {
      fetch(`/api/votes?type=question&itemId=${question._id}&userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setQuestionUserVote(data.userVote || 0))
        .catch((err) => console.error("Error fetching user vote:", err))
    }
  }, [session?.user?.id, question?._id])

  // Fetch user votes for answers
  useEffect(() => {
    if (session?.user?.id && answers.length > 0) {
      Promise.all(
        answers.map((a) =>
          fetch(`/api/votes?type=answer&itemId=${a._id}&userId=${session.user.id}`)
            .then((res) => res.json())
            .then((data) => [a._id, data.userVote || 0]),
        ),
      )
        .then((results) => {
          setAnswerUserVotes(Object.fromEntries(results))
        })
        .catch((err) => console.error("Error fetching user votes:", err))
    }
  }, [session?.user?.id, answers])

  // Voting handler
  const handleVote = async (type, itemId, value) => {
    console.log('Vote handler called:', { type, itemId, value, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    setVoteLoading((v) => ({ ...v, [itemId]: true }))
    try {
      console.log('Sending vote request to API...');
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, itemId, userId: session.user.id, value }),
      })
      const data = await res.json()
      console.log('Vote API response:', data);

      if (!res.ok) throw new Error(data.error || "Vote failed")

      if (type === "question") {
        setQuestion((prev) => ({ ...prev, votes: data.totalVotes }))
        setQuestionUserVote(data.userVote)
      } else {
        setAnswers((prev) => prev.map((a) => (a._id === itemId ? { ...a, votes: data.totalVotes } : a)))
        setAnswerUserVotes((prev) => ({ ...prev, [itemId]: data.userVote }))
      }

      toast.success("Vote recorded!")
    } catch (e) {
      console.error('Vote error:', e);
      toast.error(e.message)
    } finally {
      setVoteLoading((v) => ({ ...v, [itemId]: false }))
    }
  }

  // Handle answer acceptance
  const handleAcceptAnswer = async (answerId) => {
    if (!session?.user?.id || question.author._id !== session.user.id) {
      return
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setAnswers((prev) =>
          prev.map((answer) => ({
            ...answer,
            isAccepted: answer._id === answerId,
          })),
        )
        toast.success("Answer accepted!")
      } else {
        toast.error("Failed to accept answer")
      }
    } catch (error) {
      console.error("Error accepting answer:", error)
      toast.error("Error accepting answer")
    }
  }

  // Handle reply submission
  const handleReplySubmit = async (answerId) => {
    if (!session?.user?.id) {
      router.push("/auth/signin")
      return
    }

    const content = replyContent[answerId]
    if (!content?.trim()) return

    setSubmittingReply((prev) => ({ ...prev, [answerId]: true }))
    try {
      const response = await fetch(`/api/answers/${answerId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorId: session.user.id,
        }),
      })

      if (response.ok) {
        setReplyContent((prev) => ({ ...prev, [answerId]: "" }))
        setShowReplyForm((prev) => ({ ...prev, [answerId]: false }))
        fetchAnswers() // Refresh to get updated replies
        toast.success("Reply posted successfully!")
      } else {
        toast.error("Failed to post reply")
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast.error("Error submitting reply")
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [answerId]: false }))
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading question...</span>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Question</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!question) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Question Not Found</h2>
          <p className="mt-2 text-gray-500">The question you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-6 bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/questions")}>
            Browse All Questions
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-500">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-purple-600">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a href="/questions" className="hover:text-purple-600">
                Questions
              </a>
            </li>
            <li>/</li>
            <li className="truncate max-w-[200px] sm:max-w-xs">{question.title}</li>
          </ol>
        </nav>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Question header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{question.title}</h1>

            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {question.createdAt
                    ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })
                    : "Unknown date"}
                </span>
              </div>

              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{answers.length} answers</span>
              </div>

              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{question.votes || 0} votes</span>
              </div>
            </div>
          </div>

          {/* Question body */}
          <div className="flex flex-col md:flex-row p-6">
            {/* Vote controls */}
            <div className="flex md:flex-col items-center md:mr-6 mb-4 md:mb-0 justify-center md:justify-start">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log('Question upvote clicked');
                  handleVote("question", question._id, 1);
                }}
                className={questionUserVote === 1 ? "bg-purple-100 text-purple-700" : ""}
                disabled={!!voteLoading[question._id]}
              >
                <ArrowUp className="h-6 w-6 text-gray-500" />
              </Button>

              <span className="text-xl font-medium mx-4 md:my-2 md:mx-0 text-gray-700">{question.votes || 0}</span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log('Question downvote clicked');
                  handleVote("question", question._id, -1);
                }}
                className={questionUserVote === -1 ? "bg-purple-100 text-purple-700" : ""}
                disabled={!!voteLoading[question._id]}
              >
                <ArrowDown className="h-6 w-6 text-gray-500" />
              </Button>
            </div>

            {/* Question content */}
            <div className="flex-grow">
              <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">{parse(question.description)}</div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {question.tags?.map((tag) => (
                  <Badge key={tag} className="bg-purple-100 text-purple-800">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Author info */}
              <div className="mt-8 flex items-start justify-end">
                <div className="bg-blue-50 rounded-lg p-4 max-w-xs">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 border border-blue-200">
                      <AvatarFallback className="bg-blue-200 text-blue-700">
                        {question.author?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{question.author?.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">
                        Asked{" "}
                        {question.createdAt
                          ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })
                          : "some time ago"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Comments Section */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <ContentFilter
                currentFilter={questionCommentFilter}
                onFilterChange={setQuestionCommentFilter}
                filters={["newest", "oldest", "mine"]}
                loading={questionCommentsLoading}
              />
            </div>

            {/* Comment form */}
            {session && (
              <form onSubmit={handleQuestionCommentSubmit} className="mb-6">
                <Textarea
                  value={questionComment}
                  onChange={(e) => setQuestionComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[100px] mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!questionComment.trim() || submittingComment}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </form>
            )}

            {/* Comments list */}
            {questionCommentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : questionComments.length > 0 ? (
              <div className="space-y-4">
                {questionComments.map((comment) => (
                  <ThreadedComment
                    key={comment._id}
                    comment={comment}
                    onSubmitReply={handleQuestionCommentReply}
                    currentUserId={session?.user?.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </article>

        {/* Answers Section */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h2>
            <ContentFilter
              currentFilter={answerFilter}
              onFilterChange={setAnswerFilter}
              filters={["newest", "oldest", "top-voted", "mine"]}
              loading={answersLoading}
            />
          </div>

          {/* Answer form */}
          {session && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
              <form onSubmit={handleAnswerSubmit}>
                <Textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Write your answer here..."
                  className="min-h-[200px] mb-4"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!answerContent.trim() || submittingAnswer}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submittingAnswer ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post Answer
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Answers list */}
          {answersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : answers.length > 0 ? (
            <div className="space-y-6">
              {answers.map((answer) => (
                <div key={answer._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex">
                      {/* Vote controls */}
                      <div className="flex flex-col items-center mr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            console.log('Answer upvote clicked:', answer._id);
                            handleVote("answer", answer._id, 1);
                          }}
                          className={answerUserVotes[answer._id] === 1 ? "bg-purple-100 text-purple-700" : ""}
                          disabled={!!voteLoading[answer._id]}
                        >
                          <ArrowUp className="h-4 w-4 text-gray-500" />
                        </Button>

                        <span className="text-lg font-medium my-1 text-gray-700">{answer.votes || 0}</span>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            console.log('Answer downvote clicked:', answer._id);
                            handleVote("answer", answer._id, -1);
                          }}
                          className={answerUserVotes[answer._id] === -1 ? "bg-purple-100 text-purple-700" : ""}
                          disabled={!!voteLoading[answer._id]}
                        >
                          <ArrowDown className="h-4 w-4 text-gray-500" />
                        </Button>

                        {/* Accept answer button */}
                        {session?.user?.id === question.author._id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAcceptAnswer(answer._id)}
                            className={`h-8 w-8 rounded-full mt-2 ${
                              answer.isAccepted ? "bg-green-100 text-green-600" : "hover:bg-gray-100 text-gray-500"
                            }`}
                            title={answer.isAccepted ? "Answer accepted" : "Accept this answer"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Answer content */}
                      <div className="flex-grow">
                        <div className="prose max-w-none">{parse(answer.content)}</div>

                        {/* Answer metadata */}
                        <div className="mt-6 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                {answer.author?.username?.[0]?.toUpperCase() || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {answer.author?.username || answer.author?.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {answer.createdAt
                                  ? formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })
                                  : "some time ago"}
                              </p>
                            </div>
                          </div>

                          {answer.isAccepted && (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                          )}
                        </div>

                        {/* Answer Actions */}
                        <div className="mt-6 flex gap-4 text-sm">
                          {session && session.user.id !== answer.author._id && (
                            <button
                              onClick={() => setShowReplyForm(prev => ({ ...prev, [answer._id]: !prev[answer._id] }))}
                              className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                            >
                              {showReplyForm[answer._id] ? 'Cancel Reply' : 'Reply to Answer'}
                            </button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {showReplyForm[answer._id] && (
                          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <h4 className="text-md font-medium mb-3">Your Reply</h4>
                            <Textarea
                              value={replyContent[answer._id] || ''}
                              onChange={(e) => setReplyContent(prev => ({ ...prev, [answer._id]: e.target.value }))}
                              placeholder="Write your reply here..."
                              className="min-h-[100px] mb-3"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReplySubmit(answer._id)}
                                disabled={!replyContent[answer._id]?.trim() || submittingReply[answer._id]}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {submittingReply[answer._id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Send className="w-4 h-4 mr-2" />
                                )}
                                Post Reply
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowReplyForm(prev => ({ ...prev, [answer._id]: false }))}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies Section */}
                        {answer.replies && answer.replies.length > 0 && (
                          <div className="mt-6 border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Replies ({answer.replies.length})</h4>
                            <div className="space-y-3">
                              {answer.replies.map((reply) => (
                                <Reply key={reply._id} reply={reply} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Answer Comments */}
                        <div className="mt-6 border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Comments</h4>
                          </div>

                          {/* Comments list for answer */}
                          {answer.comments && answer.comments.length > 0 && (
                            <div className="space-y-3">
                              {answer.comments.map((comment) => (
                                <ThreadedComment
                                  key={comment._id}
                                  comment={comment}
                                  onSubmitReply={(parentCommentId, content) =>
                                    handleAnswerCommentReply(answer._id, parentCommentId, content)
                                  }
                                  currentUserId={session?.user?.id}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700">No answers yet</h3>
              <p className="mt-2 text-gray-500">Be the first to answer this question!</p>
              {!session && (
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/auth/signin")}>
                  Sign in to Answer
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
