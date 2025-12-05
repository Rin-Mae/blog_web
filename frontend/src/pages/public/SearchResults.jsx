import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/publicLayout/PublicHeader';
import Footer from '../../components/publicLayout/PublicFooter';
import SidebarFilter from '../../components/publicLayout/SidebarFilter';
import BlogCard from '../../components/BlogCard';
import mockPosts from '../../mock/posts';
import { FiSearch } from 'react-icons/fi';

function matchesQuery(post, q) {
  if (!q) return true;
  const t = q.toLowerCase();
  return (
    (post.title || '').toLowerCase().includes(t) ||
    (post.subheader || '').toLowerCase().includes(t) ||
    (post.excerpt || '').toLowerCase().includes(t)
  );
}

function filterByDate(posts, dateFilter) {
  if (!dateFilter || dateFilter === 'any') return posts;
  const now = new Date();
  return posts.filter((p) => {
    const d = new Date(p.published_at || p.date || Date.now());
    const diff = now - d; // ms
    switch (dateFilter) {
      case 'hour':
        return diff <= 1000 * 60 * 60;
      case 'today':
        return d.toDateString() === now.toDateString();
      case 'week':
        return diff <= 1000 * 60 * 60 * 24 * 7;
      case 'month':
        return diff <= 1000 * 60 * 60 * 24 * 30;
      case 'year':
        return diff <= 1000 * 60 * 60 * 24 * 365;
      default:
        return true;
    }
  });
}

function sortPosts(posts, sort) {
  if (!sort || sort === 'relevance') return posts;
  const copy = posts.slice();
  if (sort === 'date') return copy.sort((a, b) => new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0));
  if (sort === 'views') return copy.sort((a, b) => (b.views || 0) - (a.views || 0));
  if (sort === 'rating') return copy; // no rating field in mock
  return copy;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const navigate = useNavigate();
  const [query, setQuery] = useState(q);
  const [filters, setFilters] = useState({ date: 'any', sort: 'relevance' });

  useEffect(() => {
    // if query params have filters, sync them
    const date = searchParams.get('date');
    const sort = searchParams.get('sort');
    setFilters((f) => ({ ...f, date: date || f.date, sort: sort || f.sort }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const results = useMemo(() => {
    let list = mockPosts.slice();
    list = list.filter((p) => matchesQuery(p, q));
    list = filterByDate(list, filters.date);
    list = sortPosts(list, filters.sort);
    return list;
  }, [q, filters]);

  useEffect(() => {
    const params = {};
    if (q) params.q = q;
    if (filters.date && filters.date !== 'any') params.date = filters.date;
    if (filters.sort && filters.sort !== 'relevance') params.sort = filters.sort;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, q]);

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="mb-3 page-search">
          <form className="position-relative" onSubmit={(e) => { e.preventDefault(); const s = (query||'').trim(); if (s) navigate(`/search?q=${encodeURIComponent(s)}`); else navigate('/search'); }}>
            <span className="search-icon"><FiSearch /></span>
            <input className="form-control" type="search" placeholder="Search blogs..." value={query} onChange={e=>setQuery(e.target.value)} style={{paddingLeft:36}} />
          </form>
        </div>
        <div className="row">
          <div className="col-12 col-lg-3">
            <SidebarFilter filters={filters} setFilters={setFilters} />
          </div>
          <div className="col-12 col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Search results{q ? ` for "${q}"` : ''}</h5>
              <small className="text-muted">{results.length} result{results.length !== 1 ? 's' : ''}</small>
            </div>

            <div className="row">
              {results.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
              {results.length === 0 && (
                <div className="col-12">
                  <div className="alert alert-info">No results found.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
