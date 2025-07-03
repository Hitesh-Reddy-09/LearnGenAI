const youtubeService = require('./src/services/youtubeService');

async function testYouTubeIntegration() {
  console.log('🎬 Testing YouTube API Integration...\n');

  try {
    // Test 1: Check API key configuration
    console.log('1️⃣ Checking API key configuration...');
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('❌ YOUTUBE_API_KEY not found in environment variables');
      console.log('💡 Set your YouTube API key: YOUTUBE_API_KEY=your_api_key_here');
      return;
    }
    console.log('✅ YouTube API key configured\n');

    // Test 2: Search for educational videos
    console.log('2️⃣ Testing video search...');
    const searchQuery = 'JavaScript tutorial for beginners';
    console.log(`🔍 Searching for: "${searchQuery}"`);
    
    const videos = await youtubeService.searchVideos(searchQuery, 3, { educationalOnly: true });
    
    if (videos.length > 0) {
      console.log(`✅ Found ${videos.length} videos:`);
      videos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title}`);
        console.log(`      📺 ${video.channelTitle} | ⏱️ ${video.durationFormatted} | 👁️ ${video.viewCount} views`);
        console.log(`      🔗 ${video.url}\n`);
      });
    } else {
      console.log('❌ No videos found');
    }

    // Test 3: Get video details
    if (videos.length > 0) {
      console.log('3️⃣ Testing video details...');
      const firstVideo = videos[0];
      console.log(`🔍 Getting details for: ${firstVideo.title}`);
      
      const videoDetails = await youtubeService.getVideoDetails(firstVideo.videoId);
      console.log(`✅ Video details retrieved:`);
      console.log(`   📝 Description: ${videoDetails.description.substring(0, 100)}...`);
      console.log(`   👍 Likes: ${videoDetails.likeCount}`);
      console.log(`   💬 Comments: ${videoDetails.commentCount}`);
      console.log(`   🏷️ Tags: ${videoDetails.tags.slice(0, 3).join(', ')}...\n`);
    }

    // Test 4: Bulk search for course
    console.log('4️⃣ Testing bulk search for course...');
    const lessonKeywords = [
      'JavaScript basics tutorial',
      'React hooks explained',
      'Node.js backend development'
    ];
    
    console.log(`🎓 Searching for ${lessonKeywords.length} lessons...`);
    const bulkResults = await youtubeService.bulkSearchForCourse(lessonKeywords);
    
    console.log('✅ Bulk search completed:');
    Object.keys(bulkResults).forEach(lessonKey => {
      const lesson = bulkResults[lessonKey];
      console.log(`   ${lessonKey}: ${lesson.videos.length} videos found`);
      if (lesson.primaryVideo) {
        console.log(`      Primary: ${lesson.primaryVideo.title}`);
      }
    });
    console.log();

    // Test 5: Cache statistics
    console.log('5️⃣ Testing cache functionality...');
    const cacheStats = youtubeService.getCacheStats();
    console.log('📊 Cache Statistics:');
    console.log(`   Video cache: ${cacheStats.videoCacheSize} items`);
    console.log(`   Search cache: ${cacheStats.searchCacheSize} items`);
    console.log(`   Cache duration: ${cacheStats.cacheDuration} hours\n`);

    // Test 6: URL validation
    console.log('6️⃣ Testing URL validation...');
    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://example.com/invalid'
    ];
    
    testUrls.forEach(url => {
      const videoId = youtubeService.extractVideoId(url);
      console.log(`   ${url} -> ${videoId || 'Invalid'}`);
    });
    console.log();

    // Test 7: Thumbnail generation
    console.log('7️⃣ Testing thumbnail generation...');
    if (videos.length > 0) {
      const videoId = videos[0].videoId;
      const thumbnailUrl = youtubeService.generateThumbnailUrl(videoId, 'high');
      console.log(`   Video ID: ${videoId}`);
      console.log(`   Thumbnail URL: ${thumbnailUrl}\n`);
    }

    console.log('🎉 All YouTube API tests completed successfully!');

  } catch (error) {
    console.error('❌ YouTube API test failed:', error.message);
    
    if (error.message.includes('quota exceeded')) {
      console.log('💡 YouTube API quota exceeded. Try again later or check your quota usage.');
    } else if (error.message.includes('API key')) {
      console.log('💡 Check your YouTube API key configuration.');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testYouTubeIntegration();
}

module.exports = testYouTubeIntegration; 