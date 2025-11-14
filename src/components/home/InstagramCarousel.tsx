import React, { useState, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstagramPost {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  like_count?: number;
  comments_count?: number;
  timestamp: string;
  permalink: string;
}

// Instagram Basic Display API configuration
const INSTAGRAM_ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID;

// Fallback mock data for development/demo
const fallbackPosts: InstagramPost[] = [
  {
    id: '1',
    media_url: '/src/assets/Slideshow/slide 1 .jpg',
    media_type: 'IMAGE',
    caption: 'Fresh card grading showcase! Professional grading services for your premium cards. 🔥 #CardGrading #PSA #NAZGrading',
    like_count: 247,
    comments_count: 23,
    timestamp: '2024-11-14T10:00:00Z',
    permalink: 'https://instagram.com/naztcg'
  },
  {
    id: '2',
    media_url: '/src/assets/Slideshow/slide 2 .jpg',
    media_type: 'IMAGE',
    caption: 'Behind the scenes at our grading facility. Each card receives premium treatment! ✨ #BehindTheScenes #Quality',
    like_count: 189,
    comments_count: 15,
    timestamp: '2024-11-13T15:30:00Z',
    permalink: 'https://instagram.com/naztcg'
  },
  {
    id: '3',
    media_url: '/src/assets/Slideshow/slide 3 .jpg',
    media_type: 'IMAGE',
    caption: 'Customer submission showcase! Amazing collection going through our Express service 🚀 #CustomerShowcase #Express',
    like_count: 312,
    comments_count: 41,
    timestamp: '2024-11-12T12:15:00Z',
    permalink: 'https://instagram.com/naztcg'
  },
  {
    id: '4',
    media_url: '/src/assets/Slideshow/slide 4 .jpg',
    media_type: 'IMAGE',
    caption: 'Perfect 10s all around! Our Diamond Sleeve protection ensures pristine condition 💎 #Perfect10 #DiamondSleeve',
    like_count: 425,
    comments_count: 67,
    timestamp: '2024-11-11T09:45:00Z',
    permalink: 'https://instagram.com/naztcg'
  },
  {
    id: '5',
    media_url: '/src/assets/Slideshow/slide 5 .jpg',
    media_type: 'IMAGE',
    caption: 'Vintage classics getting royal treatment! Standard service with premium care 👑 #VintageCards #Standards',
    like_count: 156,
    comments_count: 19,
    timestamp: '2024-11-10T14:20:00Z',
    permalink: 'https://instagram.com/naztcg'
  }
];

// Function to fetch real Instagram posts
const fetchInstagramPosts = async (): Promise<InstagramPost[]> => {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.warn('Instagram API credentials not found, using fallback data');
    return fallbackPosts;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_url,media_type,caption,like_count,comments_count,timestamp,permalink&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram posts');
    }
    
    const data = await response.json();
    return data.data || fallbackPosts;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return fallbackPosts;
  }
};

const InstagramCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const postsPerView = 5;
  const maxIndex = Math.max(0, instagramPosts.length - postsPerView);

  // Fetch Instagram posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      const posts = await fetchInstagramPosts();
      setInstagramPosts(posts);
      setIsLoading(false);
    };
    
    loadPosts();
  }, []);

  // Auto scroll effect
  useEffect(() => {
    if (isPaused || isLoading) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0; // Reset to beginning
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex, isLoading]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const openPost = (post: InstagramPost) => {
    console.log('Opening post:', post.id); // Debug log
    setSelectedPost(post);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePost();
    };
    if (selectedPost) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost]);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Follow Our Journey</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Stay updated with the latest card gradings and behind-the-scenes content
          </p>
          <Button 
            variant="outline" 
            className="gap-2 bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50 px-8 py-3 text-base font-semibold"
            onClick={() => window.open('https://instagram.com/naztcg', '_blank')}
          >
            <Instagram className="w-5 h-5" />
            @naztcg
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Loading Instagram posts...</span>
          </div>
        )}

        {/* Error/Empty State */}
        {!isLoading && instagramPosts.length === 0 && (
          <div className="text-center py-20">
            <Instagram className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No Instagram posts found. Visit our Instagram page!</p>
            <Button 
              className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              onClick={() => window.open('https://instagram.com/naztcg', '_blank')}
            >
              Visit @naztcg
            </Button>
          </div>
        )}

        {/* Instagram Carousel with Navigation */}
        {!isLoading && instagramPosts.length > 0 && (
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-12 h-12 -ml-6"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-12 h-12 -mr-6"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </Button>

            {/* Posts Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / postsPerView)}%)`
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  setIsPaused(false);
                  setHoveredPost(null);
                }}
              >
                {instagramPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="relative flex-shrink-0 p-2"
                    style={{ width: `${100 / postsPerView}%` }}
                  >
                    <div 
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 relative"
                      onClick={() => openPost(post)}
                      onMouseEnter={() => setHoveredPost(post.id)}
                      onMouseLeave={() => setHoveredPost(null)}
                    >
                      <img
                        src={post.media_url}
                        alt={post.caption ? post.caption.substring(0, 100) + '...' : 'Instagram post'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      
                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-black/70 transition-all duration-300 flex flex-col items-center justify-center text-white p-4 pointer-events-none ${
                        hoveredPost === post.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <Instagram className="w-8 h-8 mb-3" />
                        <p className="text-sm font-medium text-center mb-3 leading-tight">
                          {post.caption ? (post.caption.length > 60 ? post.caption.substring(0, 60) + '...' : post.caption) : 'View on Instagram'}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.like_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 hover:bg-gray-600 ${
                    index === currentIndex ? 'bg-gray-800 w-8' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Join our community and see the latest updates</p>
          <Button 
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.open('https://instagram.com/naztcg', '_blank')}
          >
            Follow @naztcg on Instagram
          </Button>
        </div>

      {/* Instagram-style Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closePost}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className="flex-1 bg-black flex items-center justify-center">
              <img
                src={selectedPost.media_url}
                alt={selectedPost.caption ? selectedPost.caption.substring(0, 100) + '...' : 'Instagram post'}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            {/* Content Section */}
            <div className="w-80 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">NAZ</span>
                  </div>
                  <span className="font-semibold text-gray-900">naztcg</span>
                </div>
                <button 
                  onClick={closePost}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>
              
              {/* Post Content */}
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">NAZ</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">naztcg</span>
                      <p className="text-gray-900 mt-1">{selectedPost.caption}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions Footer */}
              <div className="border-t p-4">
                <div className="flex items-center gap-4 mb-3">
                  <button className="hover:text-gray-600 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="hover:text-gray-600 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button 
                    className="hover:text-gray-600 transition-colors ml-auto"
                    onClick={() => window.open('https://instagram.com/naztcg', '_blank')}
                  >
                    <Instagram className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-1">{selectedPost.like_count?.toLocaleString() || 0} likes</p>
                  <p className="text-gray-500">{selectedPost.comments_count || 0} comments</p>
                </div>
                
                <button 
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  onClick={() => window.open('https://instagram.com/naztcg', '_blank')}
                >
                  View on Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
};

export default InstagramCarousel;