import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  X,
  Compass,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { EventCard } from '../components/shared/EventCard';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge, Skeleton, EmptyState } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Tabs';
import { eventService } from '../services/eventService';
import { categoryService } from '../services/categoryService';

export const ExploreEventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [dateRange, setDateRange] = useState(searchParams.get('dateRange') || 'all');
  const [price, setPrice] = useState(searchParams.get('price') || 'all');
  const [locationType, setLocationType] = useState(searchParams.get('locationType') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'soonest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Load categories on mount
  useEffect(() => {
    categoryService.getCategories().then((data) => setCategories(data || []));
  }, []);

  // Fetch events whenever filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = {
          search: search.trim() || undefined,
          category: category !== 'all' ? category : undefined,
          dateRange: dateRange !== 'all' ? dateRange : undefined,
          price: price !== 'all' ? price : undefined,
          locationType: locationType !== 'all' ? locationType : undefined,
          sort,
          page,
          limit: 9,
        };

        const result = await eventService.getEvents(params);
        setEvents(result.events || []);
        setPagination(result.pagination || { total: 0, pages: 1 });
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Sync state to URL
    const newParams = {};
    if (search) newParams.search = search;
    if (category !== 'all') newParams.category = category;
    if (dateRange !== 'all') newParams.dateRange = dateRange;
    if (price !== 'all') newParams.price = price;
    if (locationType !== 'all') newParams.locationType = locationType;
    if (sort !== 'soonest') newParams.sort = sort;
    if (page > 1) newParams.page = page.toString();
    setSearchParams(newParams, { replace: true });
  }, [search, category, dateRange, price, locationType, sort, page]);

  const clearAllFilters = () => {
    setSearch('');
    setCategory('all');
    setDateRange('all');
    setPrice('all');
    setLocationType('all');
    setSort('soonest');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    category !== 'all' ||
    dateRange !== 'all' ||
    price !== 'all' ||
    locationType !== 'all';

  const filterSidebarContent = (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Category
        </label>
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Date
        </label>
        <Select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Any Date (Upcoming)</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="past">Past Events</option>
        </Select>
      </div>

      {/* Price Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Price
        </label>
        <Select
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Prices</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </Select>
      </div>

      {/* Location Type Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Format
        </label>
        <Select
          value={locationType}
          onChange={(e) => {
            setLocationType(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">In-Person & Online</option>
          <option value="physical">In-Person Only</option>
          <option value="online">Online Only</option>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={clearAllFilters}
          className="w-full text-xs"
        >
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header and Search Bar */}
      <div className="space-y-4">
        <div>
          <Badge variant="indigo" size="sm" className="mb-2">
            Discovery Hub
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Explore Events
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover workshops, conferences, concerts, and meetups around you.
          </p>
        </div>

        {/* Search Bar & View Mode Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by event title, keywords, city, or venue..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-500" />
              )}
            </button>

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-3 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="soonest">Sort: Soonest</option>
              <option value="popular">Sort: Most Popular</option>
              <option value="newest">Sort: Newly Added</option>
              <option value="price_low">Sort: Price (Low to High)</option>
              <option value="price_high">Sort: Price (High to Low)</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Active filters:</span>
            {category !== 'all' && (
              <Badge variant="indigo" size="sm" className="gap-1.5 pl-2.5 pr-1.5">
                <span>{categories.find((c) => c._id === category)?.name || 'Category'}</span>
                <button onClick={() => setCategory('all')}>
                  <X className="w-3 h-3 hover:text-rose-500" />
                </button>
              </Badge>
            )}
            {dateRange !== 'all' && (
              <Badge variant="purple" size="sm" className="gap-1.5 pl-2.5 pr-1.5 capitalize">
                <span>{dateRange.replace('_', ' ')}</span>
                <button onClick={() => setDateRange('all')}>
                  <X className="w-3 h-3 hover:text-rose-500" />
                </button>
              </Badge>
            )}
            {price !== 'all' && (
              <Badge variant="emerald" size="sm" className="gap-1.5 pl-2.5 pr-1.5 capitalize">
                <span>{price} only</span>
                <button onClick={() => setPrice('all')}>
                  <X className="w-3 h-3 hover:text-rose-500" />
                </button>
              </Badge>
            )}
            {locationType !== 'all' && (
              <Badge variant="amber" size="sm" className="gap-1.5 pl-2.5 pr-1.5 capitalize">
                <span>{locationType}</span>
                <button onClick={() => setLocationType('all')}>
                  <X className="w-3 h-3 hover:text-rose-500" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-500 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Sidebar + Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <Filter className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Events
              </h3>
            </div>
            {filterSidebarContent}
          </div>
        </div>

        {/* Events Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong>{events.length}</strong> of <strong>{pagination.total}</strong> events
            </span>
          </div>

          {loading ? (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
                >
                  <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No events match your criteria"
              description="Try adjusting your keywords, expanding your date range, or removing active filter chips."
              actionText="Reset All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="pt-6">
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer for Filters */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Events"
        side="right"
      >
        <div className="space-y-6">
          {filterSidebarContent}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              className="w-full"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
