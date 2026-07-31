import React, { useState } from 'react';
import { Database, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './TablesPage.module.css';

// Mock chunk data representing vector store entries
const MOCK_CHUNKS = Array.from({ length: 24 }, (_, i) => ({
  id: `chunk_${i}`,
  source: 'Research_paper.pdf',
  page: Math.floor(Math.random() * 20) + 1,
  snippet: `This section discusses the methodology for semantic text retrieval using dense vector embeddings. Chunk ${i} covers relevant parts of the paper that relate to retrieval-augmented generation pipelines.`,
  dimensions: 384,
}));

const PAGE_SIZE = 8;

export const TablesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage]   = useState(1);

  const filtered = MOCK_CHUNKS.filter(c =>
    c.snippet.toLowerCase().includes(search.toLowerCase()) ||
    c.id.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Vector Database</h2>
          <p className={styles.pageSub}>Inspect all ingested chunks stored in ChromaDB.</p>
        </div>
        <div className={styles.dbMeta}>
          <Database size={14} />
          <span>{MOCK_CHUNKS.length} chunks indexed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search chunks or IDs…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Chunk ID</th>
              <th>Source</th>
              <th>Page</th>
              <th>Snippet Preview</th>
              <th>Embedding</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(chunk => (
              <tr key={chunk.id} className={styles.row}>
                <td>
                  <span className={styles.idBadge}>{chunk.id}</span>
                </td>
                <td className={styles.sourceCell}>{chunk.source}</td>
                <td className={styles.pageCell}>{chunk.page}</td>
                <td className={styles.snippetCell}>
                  <span className={styles.snippetText}>{chunk.snippet.slice(0, 110)}…</span>
                </td>
                <td>
                  <span className={styles.vecBadge}>[1 × {chunk.dimensions}]</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.paginationMeta}>
          {filtered.length} results · page {page} of {totalPages}
        </span>
        <div className={styles.paginationBtns}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablesPage;
