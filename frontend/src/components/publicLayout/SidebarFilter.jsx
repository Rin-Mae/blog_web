import React from 'react';

export default function SidebarFilter({ filters, setFilters }) {
  const onDateChange = (e) => {
    setFilters((f) => ({ ...f, date: e.target.value }));
  };

  const onSortChange = (e) => {
    setFilters((f) => ({ ...f, sort: e.target.value }));
  };

  return (
    <aside className="card p-3 mb-4">
      <h6 className="mb-3">Filters</h6>

      <div className="mb-3">
        <label className="form-label fw-semibold">Upload date</label>
        <select className="form-select" value={filters.date} onChange={onDateChange}>
          <option value="any">Any time</option>
          <option value="hour">Last hour</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Sort by</label>
        <select className="form-select" value={filters.sort} onChange={onSortChange}>
          <option value="relevance">Relevance</option>
          <option value="date">Upload date</option>
          <option value="views">View count</option>
          <option value="rating">Rating</option>
        </select>
      </div>

    </aside>
  );
}
