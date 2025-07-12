import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';
import User from '@/models/User';

/**
 * Search questions using regex pattern matching with prioritization
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Scored and prioritized search results
 */
export async function searchQuestions(query, limit = 5) {
  if (!query || !query.trim()) {
    return [];
  }
  
  await connectToDatabase();
  
  const searchRegex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  
  const questions = await Question.find({
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } },
    ],
  })
  .populate('author', 'name')
  .sort({ createdAt: -1 })
  .limit(limit);
  
  const scoredQuestions = questions.map(question => {
    let score = 0;
    const titleMatch = searchRegex.test(question.title);
    const descMatch = searchRegex.test(question.description);
    const tagMatch = question.tags.some(tag => searchRegex.test(tag));
    
    // Prioritize based on where the match is found
    if (titleMatch) score += 3;
    if (descMatch) score += 2;
    if (tagMatch) score += 1;
    
    // Extract a relevant snippet from the description
    let snippet = '';
    if (descMatch) {
      // Get a context snippet around the matched term
      const match = question.description.match(searchRegex);
      if (match) {
        const matchIndex = match.index;
        const startPos = Math.max(0, matchIndex - 40);
        const endPos = Math.min(question.description.length, matchIndex + 60);
        snippet = (startPos > 0 ? '...' : '') + 
                 question.description.substring(startPos, endPos) + 
                 (endPos < question.description.length ? '...' : '');
      }
    } else {
      snippet = question.description.substring(0, 100) + 
               (question.description.length > 100 ? '...' : '');
    }
    
    return {
      _id: question._id,
      title: question.title,
      snippet,
      author: question.author ? question.author.name : 'Anonymous',
      tags: question.tags,
      createdAt: question.createdAt,
      votes: question.votes,
      answers: question.answers?.length || 0,
      score,
      matchType: titleMatch ? 'title' : (descMatch ? 'description' : 'tag')
    };
  });
  
  // Sort by score (descending)
  return scoredQuestions.sort((a, b) => b.score - a.score);
}

/**
 * Search tags for autocomplete
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Tag suggestions
 */
export async function searchTags(query, limit = 5) {
  if (!query || !query.trim()) {
    return [];
  }
  
  await connectToDatabase();
  
  const searchRegex = new RegExp('^' + query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  
  // Find distinct tags that match the query
  const questions = await Question.aggregate([
    { $unwind: '$tags' },
    { $match: { tags: searchRegex } },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  
  return questions.map(item => ({
    tag: item._id,
    count: item.count
  }));
}