export function TopicsSelection() {
  const dummyTrends = [
    {
      rank: 1,
      title: "Artificial Intelligence",
      searches: "2.4M",
      change: "+45%",
      icon: "🤖",
      description: "AI is revolutionizing industries from healthcare to finance. Machine learning algorithms are becoming increasingly sophisticated, enabling automation and predictive analytics at unprecedented scales.",
      readTime: "5 min read",
      category: "Technology",
      trending: "BREAKING"
    },
    {
      rank: 2,
      title: "Climate Change",
      searches: "1.8M",
      change: "+23%",
      icon: "🌍",
      description: "Global climate patterns are shifting rapidly. Scientists worldwide are documenting unprecedented changes in weather patterns, ice melt rates, and biodiversity loss across ecosystems.",
      readTime: "8 min read",
      category: "Environment",
      trending: "RISING"
    },
    {
      rank: 3,
      title: "Remote Work",
      searches: "1.2M",
      change: "+67%",
      icon: "💻",
      description: "The future of work has transformed permanently. Companies are embracing distributed teams, leveraging digital collaboration tools and flexible schedules to maintain productivity.",
      readTime: "6 min read",
      category: "Business",
      trending: "VIRAL"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">🔥 Trending Topics</h3>
        <p className="text-muted-foreground">Discover what's capturing global attention</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyTrends.map((trend) => (
          <div key={trend.rank} className="group relative bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary">#{trend.rank}</span>
                    <span className="text-3xl">{trend.icon}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trend.trending === 'BREAKING' ? 'bg-red-100 text-red-700' :
                    trend.trending === 'RISING' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {trend.trending}
                  </div>
                </div>
                <span className={`text-sm font-semibold ${trend.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.change}
                </span>
              </div>

              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {trend.title}
              </h4>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{trend.category}</span>
                <span>•</span>
                <span>{trend.searches} searches</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="px-6 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {trend.description}
              </p>
            </div>

            {/* Card Footer */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{trend.readTime}</span>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center space-x-1 group/btn">
                <span>Read More</span>
                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
