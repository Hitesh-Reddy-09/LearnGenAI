const axios = require('axios');

// YouTube Data API v3 configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Helper: Format duration from YouTube API format (PT4M13S) to readable format
 * @param {string} duration - ISO 8601 duration format
 * @returns {string} - Formatted duration (e.g., "4:13")
 */
function formatDuration(duration) {
  if (!duration) return '0:00';
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Helper: Format view count to readable format
 * @param {string} viewCount - Raw view count
 * @returns {string} - Formatted view count (e.g., "1.2M views")
 */
function formatViewCount(viewCount) {
  if (!viewCount) return '0 views';
  
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
}

/**
 * Search YouTube videos based on query and filters
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @param {number} options.maxResults - Maximum number of results (default: 10)
 * @param {string} options.order - Order of results (relevance, date, rating, viewCount, title)
 * @param {string} options.duration - Video duration (short, medium, long)
 * @param {string} options.type - Content type (video, channel, playlist)
 * @param {string} options.safeSearch - Safe search (moderate, none, strict)
 * @returns {Promise<object>} - Search results with video details
 */
async function searchVideos(query, options = {}) {
  try {
    const {
      maxResults = 10,
      order = 'relevance',
      duration = 'any',
      type = 'video',
      safeSearch = 'moderate'
    } = options;

    // First, search for videos
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: query,
        part: 'snippet',
        type: type,
        maxResults: maxResults,
        order: order,
        safeSearch: safeSearch,
        ...(duration !== 'any' && type === 'video' && { videoDuration: duration })
      }
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return {
        query: query,
        totalResults: 0,
        videos: []
      };
    }

    // Extract video IDs for additional details
    const videoIds = searchResponse.data.items
      .filter(item => item.id.kind === 'youtube#video')
      .map(item => item.id.videoId)
      .join(',');

    // Get detailed video information
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: videoIds,
        part: 'snippet,contentDetails,statistics'
      }
    });

    // Combine search results with detailed information
    const videos = videosResponse.data.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      duration: formatDuration(video.contentDetails.duration),
      rawDuration: video.contentDetails.duration,
      viewCount: formatViewCount(video.statistics.viewCount),
      rawViewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount || '0',
      commentCount: video.statistics.commentCount || '0',
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId
    }));

    return {
      query: query,
      totalResults: searchResponse.data.pageInfo.totalResults,
      videos: videos
    };

  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    return {
      query: query,
      totalResults: 0,
      videos: [],
      error: error.response?.data?.error?.message || 'Failed to search YouTube videos'
    };
  }
}

/**
 * Get videos for a specific lesson using AI-generated keywords
 * @param {object} lesson - Lesson object from your course generation
 * @param {object} options - Search options
 * @returns {Promise<object>} - Curated video results for the lesson
 */
async function getVideosForLesson(lesson, options = {}) {
  try {
    const { maxResults = 1, duration = 'medium' } = options;
    
    // Use lesson keywords or generate them from title and description
    const searchKeywords = lesson.searchKeywords || [];
    const searchQuery = searchKeywords.length > 0 
      ? searchKeywords.slice(0, 3).join(' ') 
      : `${lesson.title} tutorial`;

    console.log(`Searching YouTube for lesson: ${lesson.title} with query: ${searchQuery}`);

    const results = await searchVideos(searchQuery, {
      maxResults: 1,
      duration,
      order: 'relevance'
    });

    return {
      lessonTitle: lesson.title,
      searchQuery: searchQuery,
      recommendedVideos: results.videos,
      totalFound: results.totalResults
    };

  } catch (error) {
    console.error('Error getting videos for lesson:', error);
    return {
      lessonTitle: lesson.title,
      searchQuery: '',
      recommendedVideos: [],
      totalFound: 0,
      error: error.message
    };
  }
}

/**
 * Get comprehensive video resources for an entire course
 * @param {object} courseData - Course data from your generateCourse function
 * @param {object} options - Search options
 * @returns {Promise<object>} - Video resources for entire course
 */
async function getVideosForCourse(courseData, options = {}) {
  try {
    const { duration = 'medium' } = options;
    
    console.log(`Getting YouTube videos for course: ${courseData.title}`);

    // Get videos for each lesson
    const lessonVideos = await Promise.all(
      courseData.lessons.map(lesson => 
        getVideosForLesson(lesson, { 
          maxResults: 1, 
          duration 
        })
      )
    );

    // Also search for general course overview videos
    const overviewVideos = await searchVideos(`${courseData.title} course overview`, {
      maxResults: 3,
      duration: 'long',
      order: 'relevance'
    });

    return {
      courseTitle: courseData.title,
      overviewVideos: overviewVideos.videos,
      lessonVideos: lessonVideos,
      totalVideos: lessonVideos.reduce((sum, lesson) => sum + lesson.recommendedVideos.length, 0) + overviewVideos.videos.length
    };

  } catch (error) {
    console.error('Error getting videos for course:', error);
    return {
      courseTitle: courseData.title,
      overviewVideos: [],
      lessonVideos: [],
      totalVideos: 0,
      error: error.message
    };
  }
}

/**
 * Get video details by video ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<object>} - Detailed video information
 */
async function getVideoDetails(videoId) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: videoId,
        part: 'snippet,contentDetails,statistics'
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      duration: formatDuration(video.contentDetails.duration),
      rawDuration: video.contentDetails.duration,
      viewCount: formatViewCount(video.statistics.viewCount),
      rawViewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount || '0',
      commentCount: video.statistics.commentCount || '0',
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId
    };

  } catch (error) {
    console.error('Error getting video details:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to get video details');
  }
}

/**
 * Get channel information
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<object>} - Channel information
 */
async function getChannelInfo(channelId) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: channelId,
        part: 'snippet,statistics'
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = response.data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnails: channel.snippet.thumbnails,
      subscriberCount: formatViewCount(channel.statistics.subscriberCount),
      videoCount: channel.statistics.videoCount,
      viewCount: formatViewCount(channel.statistics.viewCount),
      url: `https://www.youtube.com/channel/${channel.id}`
    };

  } catch (error) {
    console.error('Error getting channel info:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to get channel info');
  }
}

/**
 * Integration function: Generate course with YouTube videos
 * This combines your existing generateCourse function with YouTube video recommendations
 * @param {string} prompt - Course topic prompt
 * @param {function} generateCourse - Your existing generateCourse function
 * @param {object} options - Options for video search
 * @returns {Promise<object>} - Complete course with YouTube videos
 */
async function generateCourseWithVideos(prompt, generateCourse, options = {}) {
  try {
    console.log(`Generating course with videos for: ${prompt}`);
    
    // Generate the course using your existing function
    const courseData = await generateCourse(prompt);
    
    if (!courseData || !courseData.lessons || courseData.lessons.length === 0) {
      throw new Error('Failed to generate course data');
    }

    // Get YouTube videos for the course
    const videoResources = await getVideosForCourse(courseData, options);

    // Combine course data with video resources
    return {
      ...courseData,
      videoResources: videoResources,
      enhancedLessons: courseData.lessons.map((lesson, index) => ({
        ...lesson,
        recommendedVideos: videoResources.lessonVideos[index]?.recommendedVideos || []
      }))
    };

  } catch (error) {
    console.error('Error generating course with videos:', error);
    throw error;
  }
}

module.exports = {
  searchVideos,
  getVideosForLesson,
  getVideosForCourse,
  getVideoDetails,
  getChannelInfo,
  generateCourseWithVideos,
  formatDuration,
  formatViewCount
}; 