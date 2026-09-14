import React, { useState, useMemo, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    UploadCloud, Folder, Search, Grid, List, Copy, Check,
    Trash2, ExternalLink, Download, FileImage, HardDrive,
    Layers, ChevronLeft, ChevronRight, X, AlertTriangle,
    RefreshCw, Filter, Eye, CheckSquare, Square
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
    id: string;
    name: string;
    folder: string;
    path: string;
    url: string;
    size: string;
    size_bytes: number;
    extension: string;
    mime_type: string;
    dimensions?: string | null;
    modified_at: string;
    timestamp: number;
}

interface FileManagerProps {
    files: MediaFile[];
    folders: string[];
    folderCounts: Record<string, number>;
    selectedFolder: string;
    search: string;
    sort: string;
    stats: {
        total_files: number;
        total_size: string;
        total_bytes: number;
    };
}

export const FileManager: React.FC<FileManagerProps> = ({
    files = [],
    folders = [],
    folderCounts = {},
    selectedFolder: initialFolder = 'all',
    search: initialSearch = '',
    sort: initialSort = 'newest',
    stats = { total_files: 0, total_size: '0 B', total_bytes: 0 }
}) => {
    // Local state
    const [currentFolder, setCurrentFolder] = useState<string>(initialFolder);
    const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
    const [sortBy, setSortBy] = useState<string>(initialSort);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Upload state
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadFolder, setUploadFolder] = useState<string>('products');
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Selection & Modal state
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Handle Folder Navigation
    const handleSelectFolder = (folder: string) => {
        setCurrentFolder(folder);
        if (folder !== 'all' && folders.includes(folder)) {
            setUploadFolder(folder);
        }
        router.get(
            route('admin.file-manager.index'),
            { folder, search: searchQuery, sort: sortBy },
            { preserveState: true, replace: true }
        );
    };

    // Handle Search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.file-manager.index'),
            { folder: currentFolder, search: searchQuery, sort: sortBy },
            { preserveState: true, replace: true }
        );
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(
            route('admin.file-manager.index'),
            { folder: currentFolder, search: '', sort: sortBy },
            { preserveState: true, replace: true }
        );
    };

    // Handle Sort Change
    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        router.get(
            route('admin.file-manager.index'),
            { folder: currentFolder, search: searchQuery, sort: newSort },
            { preserveState: true, replace: true }
        );
    };

    // Upload Handler
    const handleFileUpload = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        const formData = new FormData();
        Array.from(fileList).forEach(file => {
            formData.append('files[]', file);
        });
        formData.append('folder', uploadFolder);

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${fileList.length} file(s)... ⏳`);

        router.post(route('admin.file-manager.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsUploading(false);
                toast.success('Files uploaded and optimized successfully! 🎉', { id: toastId });
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (err) => {
                setIsUploading(false);
                const msg = Object.values(err)[0] || 'Failed to upload files.';
                toast.error(String(msg), { id: toastId });
            }
        });
    };

    // Drag and Drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    // Copy to clipboard helper
    const copyToClipboard = (text: string, key: string, label = 'URL') => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success(`${label} copied to clipboard! 📋`);
        setTimeout(() => {
            setCopiedKey(prev => (prev === key ? null : prev));
        }, 2000);
    };

    // Single Delete
    const handleDeleteSingle = (file: MediaFile) => {
        if (!confirm(`Are you sure you want to delete "${file.name}"? This cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        router.delete(route('admin.file-manager.destroy'), {
            data: { path: file.path },
            onSuccess: () => {
                setIsDeleting(false);
                setSelectedFile(null);
                toast.success('File deleted successfully! 🗑️');
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to delete file.');
            }
        });
    };

    // Bulk Select & Delete
    const toggleSelectFile = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllVisible = () => {
        if (selectedIds.size === files.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(files.map(f => f.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected file(s)? This action cannot be undone.`)) {
            return;
        }

        const pathsToDelete = files
            .filter(f => selectedIds.has(f.id))
            .map(f => f.path);

        setIsDeleting(true);
        router.post(route('admin.file-manager.bulk-destroy'), { paths: pathsToDelete }, {
            onSuccess: () => {
                setIsDeleting(false);
                setSelectedIds(new Set());
                setIsBulkMode(false);
                toast.success(`${pathsToDelete.length} files deleted successfully! 🗑️`);
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to delete files.');
            }
        });
    };

    // Navigation inside modal
    const currentIndex = selectedFile ? files.findIndex(f => f.id === selectedFile.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < files.length - 1;

    const showPrev = () => {
        if (hasPrev) setSelectedFile(files[currentIndex - 1]);
    };

    const showNext = () => {
        if (hasNext) setSelectedFile(files[currentIndex + 1]);
    };

    return (
        <AdminLayout>
            <Head title="File Manager | Media Library - ChutirMart" />

            <div className="space-y-6 pb-12">
                {/* ── Top Header & Stats ─────────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#009E49]">
                                <Folder className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    File Manager
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                    WordPress-style Media Library — view, upload, optimize & manage store assets.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                            <FileImage className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs text-slate-500 font-medium">Total Files:</span>
                            <span className="text-xs font-bold text-slate-800">{stats.total_files}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                            <HardDrive className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs text-slate-500 font-medium">Storage:</span>
                            <span className="text-xs font-bold text-slate-800">{stats.total_size}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009E49] hover:bg-[#00873D] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
                        >
                            <UploadCloud className="w-4 h-4" />
                            Upload Media
                        </button>
                    </div>
                </div>

                {/* ── Drag & Drop Upload Zone ────────────────────────────────────── */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl border-2 border-dashed transition-all p-6 sm:p-8 text-center bg-white shadow-xs ${
                        isDragOver
                            ? 'border-[#009E49] bg-emerald-50/70 scale-[1.005]'
                            : 'border-slate-300 hover:border-emerald-400 bg-linear-to-b from-white to-slate-50/50'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                    />

                    <div className="max-w-md mx-auto space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-[#009E49] mx-auto flex items-center justify-center shadow-xs">
                            <UploadCloud className={`w-7 h-7 transition-transform duration-300 ${isUploading ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                {isUploading ? 'Uploading & optimizing media...' : 'Drag & drop media files here'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Supports WebP, PNG, JPG, JPEG, SVG, GIF, ICO up to 15MB. Automatically optimized to WebP.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                <span className="font-semibold text-slate-500">Destination:</span>
                                <select
                                    value={uploadFolder}
                                    onChange={(e) => setUploadFolder(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-emerald-700 focus:ring-0 focus:outline-none cursor-pointer"
                                >
                                    {folders.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                    <option value="media">media (general)</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                {isUploading ? 'Processing...' : 'Browse Computer'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Filter Tabs & Search Bar ───────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
                    {/* Folder Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => handleSelectFolder('all')}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                currentFolder === 'all'
                                    ? 'bg-[#009E49] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            All Media
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                currentFolder === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {stats.total_files}
                            </span>
                        </button>

                        {folders.map(folder => {
                            const count = folderCounts[folder] || 0;
                            const isActive = currentFolder === folder;
                            return (
                                <button
                                    key={folder}
                                    type="button"
                                    onClick={() => handleSelectFolder(folder)}
                                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-[#009E49] text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <Folder className="w-3.5 h-3.5" />
                                    {folder.replace(/-/g, ' ')}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Tooling Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by file name..."
                                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Controls (Sort, Bulk, View) */}
                        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                            {/* Bulk selection toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBulkMode(!isBulkMode);
                                    if (isBulkMode) setSelectedIds(new Set());
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    isBulkMode
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Select Multiple</span>
                            </button>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="size_desc">Largest Size</option>
                                <option value="size_asc">Smallest Size</option>
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                            </select>

                            {/* View Switcher */}
                            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-white text-[#009E49] shadow-xs'
                                            : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                    title="Grid View"
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                        viewMode === 'list'
                                            ? 'bg-white text-[#009E49] shadow-xs'
                                            : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions Banner */}
                    {isBulkMode && (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={selectAllVisible}
                                    className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                                >
                                    {selectedIds.size === files.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-xs font-semibold text-emerald-700">
                                    {selectedIds.size} file(s) selected
                                </span>
                            </div>

                            <button
                                type="button"
                                disabled={selectedIds.size === 0 || isDeleting}
                                onClick={handleBulkDelete}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Selected ({selectedIds.size})
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Media Items Display ────────────────────────────────────────── */}
                {files.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                            <FileImage className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No media files found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            {searchQuery
                                ? `No files matching "${searchQuery}". Try a different keyword or filter.`
                                : `No files in folder "${currentFolder}". Drag and drop files above to upload.`}
                        </p>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ── GRID VIEW ── */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {files.map(file => {
                            const isSelected = selectedIds.has(file.id);
                            return (
                                <div
                                    key={file.id}
                                    onClick={() => {
                                        if (isBulkMode) {
                                            toggleSelectFile(file.id);
                                        } else {
                                            setSelectedFile(file);
                                        }
                                    }}
                                    className={`group relative bg-white rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                                        isSelected
                                            ? 'ring-2 ring-[#009E49] border-[#009E49] shadow-md'
                                            : 'border-slate-200/80 hover:border-emerald-400 hover:shadow-md'
                                    }`}
                                >
                                    {/* Thumbnail box */}
                                    <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden checkerboard-bg">
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            loading="lazy"
                                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        />

                                        {/* Selection Checkbox */}
                                        {(isBulkMode || isSelected) && (
                                            <div
                                                onClick={(e) => toggleSelectFile(file.id, e)}
                                                className="absolute top-2 left-2 z-10"
                                            >
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                                    isSelected ? 'bg-[#009E49] text-white shadow-xs' : 'bg-white/90 border border-slate-300 text-transparent'
                                                }`}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Overlay with Quick Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(file.url, file.id);
                                                }}
                                                className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer"
                                                title="Copy Link"
                                            >
                                                {copiedKey === file.id ? (
                                                    <Check className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(file);
                                                }}
                                                className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer"
                                                title="Preview Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Extension Badge */}
                                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                                            {file.extension}
                                        </span>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-2.5 bg-white border-t border-slate-100 flex-1 flex flex-col justify-between">
                                        <p className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-medium">
                                            <span>{file.size}</span>
                                            <span className="capitalize">{file.folder}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── LIST VIEW ── */
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        {isBulkMode && <th className="p-3 w-10"></th>}
                                        <th className="p-3 w-16">Preview</th>
                                        <th className="p-3">File Name</th>
                                        <th className="p-3">Folder</th>
                                        <th className="p-3">Dimensions</th>
                                        <th className="p-3">Size</th>
                                        <th className="p-3">Uploaded</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {files.map(file => {
                                        const isSelected = selectedIds.has(file.id);
                                        return (
                                            <tr
                                                key={file.id}
                                                onClick={() => {
                                                    if (isBulkMode) toggleSelectFile(file.id);
                                                    else setSelectedFile(file);
                                                }}
                                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                                    isSelected ? 'bg-emerald-50/50' : ''
                                                }`}
                                            >
                                                {isBulkMode && (
                                                    <td className="p-3" onClick={(e) => toggleSelectFile(file.id, e)}>
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                                                            isSelected ? 'bg-[#009E49] text-white' : 'border border-slate-300'
                                                        }`}>
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="p-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-3 font-semibold text-slate-800 max-w-[200px] truncate" title={file.name}>
                                                    {file.name}
                                                </td>
                                                <td className="p-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 capitalize">
                                                        {file.folder}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-500 font-medium">
                                                    {file.dimensions || '—'}
                                                </td>
                                                <td className="p-3 text-slate-600 font-bold">
                                                    {file.size}
                                                </td>
                                                <td className="p-3 text-slate-400">
                                                    {file.modified_at}
                                                </td>
                                                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(file.url, file.id)}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                            title="Copy Link"
                                                        >
                                                            {copiedKey === file.id ? (
                                                                <Check className="w-4 h-4 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFile(file)}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSingle(file)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── WordPress-Style Media Details Modal / Drawer ────────────────── */}
                {selectedFile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-slate-900">Attachment Details</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <button
                                            type="button"
                                            disabled={!hasPrev}
                                            onClick={showPrev}
                                            className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Previous item"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span>{currentIndex + 1} of {files.length}</span>
                                        <button
                                            type="button"
                                            disabled={!hasNext}
                                            onClick={showNext}
                                            className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Next item"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                                {/* Left/Top: Image Canvas */}
                                <div className="lg:col-span-7 bg-slate-950/5 p-6 flex flex-col items-center justify-center min-h-[260px] lg:min-h-[440px] relative checkerboard-bg">
                                    <img
                                        src={selectedFile.url}
                                        alt={selectedFile.name}
                                        className="max-h-[380px] max-w-full object-contain rounded-lg shadow-sm"
                                    />
                                    <a
                                        href={selectedFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        View Full Image in New Tab
                                    </a>
                                </div>

                                {/* Right: File Information & Link Copier */}
                                <div className="lg:col-span-5 p-5 space-y-5 bg-white">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-slate-900 break-all">
                                            {selectedFile.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium">
                                            Uploaded on {selectedFile.modified_at}
                                        </p>
                                    </div>

                                    {/* Specs Grid */}
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">File type:</span>
                                            <span className="font-bold text-slate-800">{selectedFile.mime_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">File size:</span>
                                            <span className="font-bold text-slate-800">{selectedFile.size}</span>
                                        </div>
                                        {selectedFile.dimensions && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-medium">Dimensions:</span>
                                                <span className="font-bold text-slate-800">{selectedFile.dimensions} pixels</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Folder:</span>
                                            <span className="font-bold text-emerald-700 capitalize">{selectedFile.folder}</span>
                                        </div>
                                    </div>

                                    {/* URL Copy Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">File URL (Public Link)</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                readOnly
                                                value={selectedFile.url}
                                                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-700 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(selectedFile.url, 'modal_url', 'File URL')}
                                                className="shrink-0 px-3 py-2 rounded-xl bg-[#009E49] hover:bg-[#00873D] text-white text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
                                            >
                                                {copiedKey === 'modal_url' ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Copy URL
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Relative Path Copy Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Relative Path (for settings/code)</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                readOnly
                                                value={selectedFile.path}
                                                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-700 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(selectedFile.path, 'modal_path', 'Relative Path')}
                                                className="shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                            >
                                                {copiedKey === 'modal_path' ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Copy Path
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <a
                                            href={selectedFile.url}
                                            download={selectedFile.name}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </a>

                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() => handleDeleteSingle(selectedFile)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete File
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkerboard Pattern for transparent images */}
            <style>{`
                .checkerboard-bg {
                    background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                                      linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                                      linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                                      linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
                    background-size: 16px 16px;
                    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
                }
            `}</style>
        </AdminLayout>
    );
};

export default FileManager;
