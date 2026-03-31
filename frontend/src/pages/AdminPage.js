import React, { useState, useCallback } from 'react';
import { useApi, apiPost, apiDelete } from '../hooks/useApi';

function AdminPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [scraping, setScraping] = useState(false);
  const [message, setMessage] = useState('');

  const queryParams = new URLSearchParams({ page, limit: 20 });
  if (statusFilter) queryParams.set('status', statusFilter);

  const { data: statsData, refetch: refetchStats } = useApi('/admin/stats');
  const { data: articlesData, refetch: refetchArticles } = useApi(`/admin/articles?${queryParams}`);

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    try {
      const result = await apiPost('/admin/scrape');
      showMessage(`Scrape complete! Auto-published ${result.autoPublished} articles.`);
      refetchStats();
      refetchArticles();
    } catch (err) {
      showMessage(`Scrape failed: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await apiPost(`/admin/articles/${id}/publish`);
      showMessage('Article published');
      refetchArticles();
      refetchStats();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await apiPost(`/admin/articles/${id}/unpublish`);
      showMessage('Article unpublished');
      refetchArticles();
      refetchStats();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await apiDelete(`/admin/articles/${id}`);
      showMessage('Article deleted');
      refetchArticles();
      refetchStats();
    } catch (err) {
      showMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {message && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
          {message}
        </div>
      )}

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Total Articles</p>
            <p className="text-2xl font-bold text-gray-900">{statsData.totalArticles}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Published</p>
            <p className="text-2xl font-bold text-green-600">{statsData.publishedArticles}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Unpublished</p>
            <p className="text-2xl font-bold text-yellow-600">{statsData.unpublishedArticles}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="text-2xl font-bold text-indigo-600">{statsData.totalViews}</p>
          </div>
        </div>
      )}

      {/* Source Stats */}
      {statsData?.sourceStats && (
        <div className="bg-white p-5 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-3">Articles by Source</h2>
          <div className="flex flex-wrap gap-4">
            {statsData.sourceStats.map((s) => (
              <div key={s._id} className="flex items-center gap-2">
                <span className="font-medium capitalize">{s._id}:</span>
                <span className="text-gray-600">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {scraping ? 'Scraping...' : 'Run Scraper Now'}
        </button>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg"
        >
          <option value="">All Articles</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {/* Recent Scrape Logs */}
      {statsData?.recentLogs?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-8 overflow-hidden">
          <h2 className="text-lg font-semibold p-5 border-b">Recent Scrape Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Found</th>
                  <th className="text-left p-3">Saved</th>
                  <th className="text-left p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {statsData.recentLogs.map((log) => (
                  <tr key={log._id} className="border-t">
                    <td className="p-3 capitalize">{log.source}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">{log.articles_found}</td>
                    <td className="p-3">{log.articles_saved}</td>
                    <td className="p-3">{new Date(log.started_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Articles Table */}
      {articlesData && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <h2 className="text-lg font-semibold p-5 border-b">Articles</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Views</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articlesData.articles.map((article) => (
                  <tr key={article._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 max-w-xs truncate" title={article.title}>
                      {article.title}
                    </td>
                    <td className="p-3 capitalize">{article.source}</td>
                    <td className="p-3 capitalize">{article.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3">{article.views}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {article.is_published ? (
                          <button
                            onClick={() => handleUnpublish(article._id)}
                            className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(article._id)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {articlesData.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {page} / {articlesData.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(articlesData.pagination.pages, p + 1))}
                disabled={page === articlesData.pagination.pages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
