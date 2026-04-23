import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../App';
import {
  Folder, FolderPlus, Upload, Download, Trash2, Search,
  Grid, List, Image, Music, Video, FileText, Archive,
  Star, Clock, MoreHorizontal, X, Eye, Copy, Share2,
  ChevronRight, Home, HardDrive, AlertCircle, Check,
  RefreshCw, Move, Edit2, Lock, Unlock, ExternalLink
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────
const PLAN_STORAGE = { free: 1073741824, creator: 5368709120, pro: 26843545600 };

const FILE_ICONS = {
  image: { icon: Image, color: '#22d3ee' },
  audio: { icon: Music, color: '#ec4899' },
  video: { icon: Video, color: '#f59e0b' },
  document: { icon: FileText, color: '#10b981' },
  archive: { icon: Archive, color: '#10b981' },
  default: { icon: FileText, color: '#9096b8' },
};

const getFileType = (mime = '') => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) return 'document';
  if (mime.includes('zip') || mime.includes('rar')) return 'archive';
  return 'default';
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
};

const formatStorageBar = (used, total) => {
  const pct = Math.min(Math.round((used / total) * 100), 100);
  return { pct, color: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981' };
};

// ── File Icon Component ───────────────────────────────────────────
function FileIcon({ mime, size = 20 }) {
  const type = getFileType(mime);
  const { icon: Icon, color } = FILE_ICONS[type] || FILE_ICONS.default;
  return <Icon size={size} color={color} />;
}

// ── Breadcrumb ────────────────────────────────────────────────────
function Breadcrumb({ path, onNavigate }) {
  return (
    <div className="fm-breadcrumb">
      <button className="fm-bread-item" onClick={() => onNavigate(null)}><Home size={13} /></button>
      {path.map((folder, i) => (
        <React.Fragment key={folder.id}>
          <ChevronRight size={12} className="fm-bread-sep" />
          <button
            className={`fm-bread-item ${i === path.length - 1 ? 'active' : ''}`}
            onClick={() => i < path.length - 1 && onNavigate(folder.id)}
          >{folder.name}</button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Folder Card ───────────────────────────────────────────────────
function FolderCard({ folder, onOpen, onDelete, onRename, viewMode }) {
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder.name);

  const handleRename = async () => {
    if (name.trim() && name !== folder.name) { await onRename(folder.id, name); }
    setRenaming(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="fm-list-row" onDoubleClick={() => onOpen(folder)}>
        <Folder size={16} color="#f59e0b" />
        {renaming ? (
          <input className="fm-rename-input" value={name} onChange={e => setName(e.target.value)} onBlur={handleRename} onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }} autoFocus />
        ) : (
          <span className="fm-list-name" onDoubleClick={() => setRenaming(true)}>{folder.name}</span>
        )}
        <span className="fm-list-meta">Folder</span>
        <span className="fm-list-date">{folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '—'}</span>
        <button className="admin-action-btn" onClick={e => { e.stopPropagation(); setMenu(m => !m); }}><MoreHorizontal size={13} /></button>
        {menu && (
          <div className="fm-context-menu">
            <button onClick={() => { setRenaming(true); setMenu(false); }}><Edit2 size={12} /> Rename</button>
            <button className="danger" onClick={() => onDelete(folder.id)}><Trash2 size={12} /> Delete</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fm-folder-card" onDoubleClick={() => onOpen(folder)}>
      <div className="fm-folder-icon"><Folder size={28} color="#f59e0b" /></div>
      {renaming ? (
        <input className="fm-rename-input" value={name} onChange={e => setName(e.target.value)} onBlur={handleRename} onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }} autoFocus onClick={e => e.stopPropagation()} />
      ) : (
        <div className="fm-card-name">{folder.name}</div>
      )}
      <button className="fm-card-menu" onClick={e => { e.stopPropagation(); setMenu(m => !m); }}><MoreHorizontal size={13} /></button>
      {menu && (
        <div className="fm-context-menu">
          <button onClick={() => { setRenaming(true); setMenu(false); }}><Edit2 size={12} /> Rename</button>
          <button className="danger" onClick={() => onDelete(folder.id)}><Trash2 size={12} /> Delete</button>
        </div>
      )}
    </div>
  );
}

// ── File Card ─────────────────────────────────────────────────────
function FileCard({ file, selected, onSelect, onDownload, onDelete, onShare, onPreview, viewMode }) {
  const [menu, setMenu] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className={`fm-list-row ${selected ? 'selected' : ''}`} onClick={() => onSelect(file.id)}>
        <FileIcon mime={file.mime_type} size={16} />
        <span className="fm-list-name">{file.filename}</span>
        <span className="fm-list-meta">{formatSize(file.size)}</span>
        <span className="fm-list-date">{file.created_at ? new Date(file.created_at).toLocaleDateString() : '—'}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="admin-action-btn" onClick={e => { e.stopPropagation(); onPreview(file); }}><Eye size={12} /></button>
          <button className="admin-action-btn" onClick={e => { e.stopPropagation(); onDownload(file); }}><Download size={12} /></button>
          <button className="admin-action-btn" onClick={e => { e.stopPropagation(); setMenu(m => !m); }}><MoreHorizontal size={12} /></button>
        </div>
        {menu && (
          <div className="fm-context-menu">
            <button onClick={() => { onShare(file); setMenu(false); }}><Share2 size={12} /> Share Link</button>
            <button onClick={() => { onDownload(file); setMenu(false); }}><Download size={12} /> Download</button>
            <button className="danger" onClick={() => onDelete(file.id)}><Trash2 size={12} /> Delete</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fm-file-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(file.id)} onDoubleClick={() => onPreview(file)}>
      <div className="fm-file-thumb">
        {file.mime_type?.startsWith('image/') && file.storage_url ? (
          <img src={file.storage_url} alt={file.filename} className="fm-thumb-img" />
        ) : (
          <FileIcon mime={file.mime_type} size={32} />
        )}
        {file.is_favorite && <Star size={12} className="fm-favorite-badge" fill="#f59e0b" color="#f59e0b" />}
      </div>
      <div className="fm-card-name">{file.filename}</div>
      <div className="fm-card-size">{formatSize(file.size)}</div>
      <button className="fm-card-menu" onClick={e => { e.stopPropagation(); setMenu(m => !m); }}><MoreHorizontal size={13} /></button>
      {menu && (
        <div className="fm-context-menu">
          <button onClick={() => { onPreview(file); setMenu(false); }}><Eye size={12} /> Preview</button>
          <button onClick={() => { onShare(file); setMenu(false); }}><Share2 size={12} /> Share Link</button>
          <button onClick={() => { onDownload(file); setMenu(false); }}><Download size={12} /> Download</button>
          <button className="danger" onClick={() => { onDelete(file.id); setMenu(false); }}><Trash2 size={12} /> Delete</button>
        </div>
      )}
    </div>
  );
}

// ── Upload Zone ───────────────────────────────────────────────────
function UploadZone({ folderId, onComplete, addToast, storageUsed, storagePlan }) {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const id = `${file.name}-${Date.now()}`;
      setUploads(u => [...u, { id, name: file.name, progress: 0, status: 'uploading' }]);
      try {
        const fd = new FormData();
        fd.append('file', file);
        if (folderId) fd.append('folder_id', folderId);
        await api.post('/api/files/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploads(u => u.map(x => x.id === id ? { ...x, progress: pct } : x));
          }
        });
        setUploads(u => u.map(x => x.id === id ? { ...x, status: 'done', progress: 100 } : x));
        setTimeout(() => setUploads(u => u.filter(x => x.id !== id)), 2000);
      } catch (e) {
        setUploads(u => u.map(x => x.id === id ? { ...x, status: 'error' } : x));
        addToast('Upload failed', file.name, 'error');
      }
    }
    onComplete();
  };

  return (
    <div>
      <div
        className={`fm-upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={20} color={dragging ? '#10b981' : 'var(--mu)'} />
        <span>{dragging ? 'Drop to upload' : 'Click or drag files here'}</span>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      </div>
      {uploads.length > 0 && (
        <div className="fm-upload-progress">
          {uploads.map(u => (
            <div key={u.id} className="fm-upload-item">
              <div className="fm-upload-name">{u.name}</div>
              <div className="fm-upload-bar">
                <div style={{ width: `${u.progress}%`, background: u.status === 'error' ? '#ef4444' : u.status === 'done' ? '#10b981' : '#10b981' }} />
              </div>
              <div className="fm-upload-status">
                {u.status === 'done' && <Check size={12} color="#10b981" />}
                {u.status === 'error' && <AlertCircle size={12} color="#ef4444" />}
                {u.status === 'uploading' && <span className="admin-muted" style={{ fontSize: 11 }}>{u.progress}%</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────
function PreviewModal({ file, onClose, onDownload }) {
  const type = getFileType(file.mime_type);
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="fm-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="fm-preview-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileIcon mime={file.mime_type} size={16} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{file.filename}</span>
            <span className="admin-muted" style={{ fontSize: 12 }}>{formatSize(file.size)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn-secondary" onClick={() => onDownload(file)}><Download size={13} /> Download</button>
            <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="fm-preview-body">
          {type === 'image' && file.storage_url && <img src={file.storage_url} alt={file.filename} className="fm-preview-img" />}
          {type === 'audio' && file.storage_url && <audio controls src={file.storage_url} style={{ width: '100%' }} />}
          {type === 'video' && file.storage_url && <video controls src={file.storage_url} style={{ width: '100%', maxHeight: 400 }} />}
          {(type === 'document' || type === 'archive' || type === 'default') && (
            <div className="fm-preview-nopreview">
              <FileIcon mime={file.mime_type} size={48} />
              <div style={{ marginTop: 12, fontSize: 14 }}>No preview available</div>
              <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={() => onDownload(file)}><Download size={14} /> Download to view</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main File Manager ─────────────────────────────────────────────
function FileManager({ user, addToast }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('all');
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0 });
  const [showUpload, setShowUpload] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const storagePlan = PLAN_STORAGE[user?.plan || 'free'];

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(currentFolder && { folder_id: currentFolder }),
        ...(search && { search }),
        ...(sidebarTab === 'favorites' && { favorites: true }),
        ...(sidebarTab === 'recent' && { recent: true }),
        ...(sidebarTab === 'trash' && { trash: true }),
      });
      const [filesRes, foldersRes, storageRes] = await Promise.all([
        api.get(`/api/files?${params}`),
        sidebarTab === 'all' ? api.get(`/api/folders?${currentFolder ? `parent_id=${currentFolder}` : 'root=true'}`) : Promise.resolve({ data: { folders: [] } }),
        api.get('/api/files/storage'),
      ]);
      setFiles(filesRes.data.files || []);
      setFolders(foldersRes.data.folders || []);
      setStorageInfo(storageRes.data);
    } catch { addToast('Failed to load files', '', 'error'); }
    setLoading(false);
  }, [currentFolder, search, sidebarTab]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const navigateFolder = async (folderId) => {
    if (!folderId) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      try {
        const res = await api.get(`/api/folders/${folderId}`);
        const folder = res.data;
        setCurrentFolder(folderId);
        setFolderPath(fp => {
          const idx = fp.findIndex(f => f.id === folderId);
          if (idx !== -1) return fp.slice(0, idx + 1);
          return [...fp, { id: folderId, name: folder.name }];
        });
      } catch {}
    }
  };

  const openFolder = (folder) => navigateFolder(folder.id);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post('/api/folders', { name: newFolderName, parent_id: currentFolder || null });
      setNewFolderName('');
      setShowNewFolder(false);
      fetchFiles();
      addToast('Folder created', '', 'success');
    } catch { addToast('Failed', '', 'error'); }
  };

  const deleteFolder = async (id) => {
    if (!window.confirm('Delete this folder and all its contents?')) return;
    try { await api.delete(`/api/folders/${id}`); fetchFiles(); } catch { addToast('Failed', '', 'error'); }
  };

  const renameFolder = async (id, name) => {
    try { await api.put(`/api/folders/${id}`, { name }); fetchFiles(); } catch {}
  };

  const deleteFile = async (id) => {
    try { await api.delete(`/api/files/${id}`); fetchFiles(); setSelected(s => s.filter(x => x !== id)); } catch { addToast('Failed', '', 'error'); }
  };

  const downloadFile = async (file) => {
    try {
      const res = await api.get(`/api/files/${file.id}/download`);
      const a = document.createElement('a');
      a.href = res.data.url; a.download = file.filename; a.target = '_blank'; a.click();
    } catch { addToast('Download failed', '', 'error'); }
  };

  const shareFileLink = async (file) => {
    try {
      const res = await api.post(`/api/files/${file.id}/share`);
      navigator.clipboard.writeText(res.data.share_url);
      addToast('Share link copied!', res.data.share_url, 'success');
    } catch { addToast('Failed', '', 'error'); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const bulkDelete = async () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} files?`)) return;
    for (const id of selected) await deleteFile(id);
    setSelected([]);
  };

  const { pct: storagePercent, color: storageColor } = formatStorageBar(storageInfo.used || 0, storagePlan);

  return (
    <div className="panel active fm-root" data-testid="files-panel">
      <div className="tool-header">
        <span className="tool-icon"><HardDrive size={26} color="#10b981" /></span>
        <div className="tool-info">
          <h2>File Manager</h2>
          <p>Upload, organise, and share your creative assets</p>
        </div>
      </div>

      <div className="fm-layout">
        {/* Sidebar */}
        <div className="fm-sidebar">
          <div className="fm-storage">
            <div className="fm-storage-label">
              <HardDrive size={13} />
              <span>Storage</span>
              <span className="fm-storage-value">{formatSize(storageInfo.used || 0)} / {formatSize(storagePlan)}</span>
            </div>
            <div className="fm-storage-bar"><div style={{ width: `${storagePercent}%`, background: storageColor }} /></div>
          </div>

          <nav className="fm-nav">
            {[
              { id: 'all', label: 'All Files', icon: Folder },
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'favorites', label: 'Favourites', icon: Star },
              { id: 'trash', label: 'Trash', icon: Trash2 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} className={`fm-nav-item ${sidebarTab === id ? 'active' : ''}`} onClick={() => { setSidebarTab(id); setCurrentFolder(null); setFolderPath([]); }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main */}
        <div className="fm-main">
          {/* Toolbar */}
          <div className="fm-toolbar">
            <Breadcrumb path={folderPath} onNavigate={navigateFolder} />
            <div className="fm-toolbar-actions">
              <div className="admin-search-wrap" style={{ maxWidth: 200 }}>
                <Search size={13} className="admin-search-icon" />
                <input className="admin-search" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="admin-btn-icon" onClick={fetchFiles}><RefreshCw size={13} /></button>
              <button className={`admin-btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid size={13} /></button>
              <button className={`admin-btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={13} /></button>
              <button className="admin-btn-icon" onClick={() => setShowNewFolder(true)}><FolderPlus size={13} /> New Folder</button>
              <button className="admin-btn-primary" onClick={() => setShowUpload(s => !s)}><Upload size={13} /> Upload</button>
            </div>
          </div>

          {/* Upload zone */}
          {showUpload && (
            <div style={{ marginBottom: 14 }}>
              <UploadZone folderId={currentFolder} onComplete={() => { fetchFiles(); setShowUpload(false); }} addToast={addToast} />
            </div>
          )}

          {/* New folder input */}
          {showNewFolder && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="form-input" placeholder="Folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolder(false); }} autoFocus />
              <button className="admin-btn-primary" onClick={createFolder}>Create</button>
              <button className="admin-btn-secondary" onClick={() => setShowNewFolder(false)}>Cancel</button>
            </div>
          )}

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div className="admin-bulk-bar" style={{ marginBottom: 10 }}>
              <span>{selected.length} selected</span>
              <button className="admin-btn-sm danger" onClick={bulkDelete}><Trash2 size={12} /> Delete</button>
              <button className="admin-btn-text" onClick={() => setSelected([])}>Clear</button>
            </div>
          )}

          {/* Files grid/list */}
          {loading ? (
            <div className="admin-loading"><span className="spinner" /> Loading files...</div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="fm-empty">
              <Upload size={36} color="var(--mu)" />
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>No files here yet</div>
              <div style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16 }}>Upload files or drag and drop them anywhere</div>
              <button className="admin-btn-primary" onClick={() => setShowUpload(true)}><Upload size={14} /> Upload Files</button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'fm-grid' : 'fm-list'}>
              {viewMode === 'list' && (
                <div className="fm-list-header">
                  <span>Name</span><span>Size</span><span>Modified</span><span></span>
                </div>
              )}
              {folders.map(f => (
                <FolderCard key={f.id} folder={f} onOpen={openFolder} onDelete={deleteFolder} onRename={renameFolder} viewMode={viewMode} />
              ))}
              {files.map(f => (
                <FileCard key={f.id} file={f} selected={selected.includes(f.id)} onSelect={toggleSelect} onDownload={downloadFile} onDelete={deleteFile} onShare={shareFileLink} onPreview={setPreviewFile} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>

      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onDownload={downloadFile} />}
    </div>
  );
}

export default FileManager;
