export const summary = {
  totalBlogs: 1248,
  totalBloggers: 342,
  totalViews: 1234567,
  viewsToday: 3452,
  viewsWeek: 24987,
  pendingApprovals: 12,
}

export const topBlogs = [
  { id: 1, title: 'How to write better headlines', views: 12453 },
  { id: 2, title: '10 tips for remote writers', views: 9842 },
  { id: 3, title: 'Monetizing your blog', views: 8541 },
  { id: 4, title: 'SEO basics for beginners', views: 7120 },
  { id: 5, title: 'Writing consistently', views: 6902 },
]

// Sample current user for admin dashboard previews
export const currentUser = {
  id: 1,
  firstName: 'Admin',
  lastName: 'User',
  // Using a placeholder avatar service; replace with your user image URL when available
  avatar: 'https://i.pravatar.cc/150?u=admin@example.com',
}

export const topBloggers = [
  { id: 1, name: 'Alice Johnson', views: 48231 },
  { id: 2, name: 'Michael Tan', views: 39120 },
  { id: 3, name: 'Sofia Reyes', views: 32210 },
  { id: 4, name: 'Liam Wong', views: 29840 },
  { id: 5, name: 'Priya Singh', views: 27500 },
]

export const recentBlogs = [
  { id: 1, title: 'Quick CSS tricks', author: 'Alice Johnson', created: '2025-11-20' },
  { id: 2, title: 'Deploying with Vite', author: 'Michael Tan', created: '2025-11-22' },
  { id: 3, title: 'How to write reviews', author: 'Sofia Reyes', created: '2025-11-23' },
  { id: 4, title: 'Understanding web performance', author: 'Liam Wong', created: '2025-11-24' },
  { id: 5, title: 'Designing for readability', author: 'Priya Singh', created: '2025-11-25' },
]

// Time series sample for Traffic Over Time (daily data for a recent range)
export const trafficOverTime = [
  { date: '2025-11-16', views: 2400 },
  { date: '2025-11-17', views: 3200 },
  { date: '2025-11-18', views: 2800 },
  { date: '2025-11-19', views: 3600 },
  { date: '2025-11-20', views: 3900 },
  { date: '2025-11-21', views: 4200 },
  { date: '2025-11-22', views: 4800 },
  { date: '2025-11-23', views: 5200 },
  { date: '2025-11-24', views: 6100 },
  { date: '2025-11-25', views: 7450 },
]

// Monthly sample for New Blogs Per Month
export const blogsPerMonth = [
  { month: 'Jan', newBlogs: 32 },
  { month: 'Feb', newBlogs: 28 },
  { month: 'Mar', newBlogs: 45 },
  { month: 'Apr', newBlogs: 38 },
  { month: 'May', newBlogs: 52 },
  { month: 'Jun', newBlogs: 60 },
  { month: 'Jul', newBlogs: 55 },
  { month: 'Aug', newBlogs: 48 },
  { month: 'Sep', newBlogs: 67 },
  { month: 'Oct', newBlogs: 72 },
  { month: 'Nov', newBlogs: 81 },
]
