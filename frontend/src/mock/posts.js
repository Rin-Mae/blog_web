import rabbitImg from '../assets/images/rabbit placeholder.png'

const mockPosts = [
  {
    id: 1,
    title: 'How to write clean code',
    subheader: 'Practical tips for maintainable code',
    thumbnail: rabbitImg,
    author: { id: 1, name: 'Admin' },
    status: 'published',
    published_at: '2025-11-28T12:34:00Z',
    views: 123456,
    excerpt: 'A short intro to writing clean code...'
  },
  {
    id: 2,
    title: 'Design systems 101',
    subheader: 'Building consistent UI',
    thumbnail: rabbitImg,
    author: { id: 2, name: 'Editor' },
    status: 'draft',
    published_at: '2025-11-22T09:02:00Z',
    views: 9876,
    excerpt: 'Design systems help scale product design...'
  },
  {
    id: 3,
    title: 'Performance tuning in React',
    subheader: 'Small changes, big impact',
    thumbnail: rabbitImg,
    author: { id: 3, name: 'Dev' },
    status: 'published',
    published_at: '2025-11-15T08:15:00Z',
    views: 54321,
    excerpt: 'React performance tips and tools...'
  }
]

export default mockPosts
