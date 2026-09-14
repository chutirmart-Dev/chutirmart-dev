import React, { useState, useEffect, useRef } from 'react';
import {
    X, UploadCloud, Image as ImageIcon, Search, Check,
    Folder, Layers, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export interface MediaFile {
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

export interface MediaSelectPayload {
    url: string;
    path: string;
    file: MediaFile;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (selected: MediaSelectPayload) => void;
    onSelectMultiple?: (selected: MediaSelectPayload[]) => void;
    multiple?: boolean;
    defaultFolder?: string;
    title?: string;
    confirmText?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    onSelectMultiple,
    multiple = false,
    defaultFolder = 'products',
    title = 'Select Media',
    confirmText
}) => {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Selected files state
    const [selectedItems, setSelectedItems] = useState<Map<string, MediaFile>>(new Map());

    // Upload state
    const [uploadFolder, setUploadFolder] = useState<string>(defaultFolder);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load files from backend API
    const fetchMedia = async (folder: string = selectedFolder, search: string = searchQuery) => {
        setIsLoading(true);
        try {
            const url = new URL(route('admin.file-manager.index'), window.location.origin);
            if (folder && folder !== 'all') url.searchParams.set('folder', folder);
            if (search.trim()) url.searchParams.set('search', search.trim());

            const res = await fetch(url.toString(), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (res.ok) {
                const data = await res.json();
                setFiles(data.files || []);
                setFolders(data.folders || []);
                setFolderCounts(data.folderCounts || {});
            }
        } catch (error) {
            console.error('Failed to fetch media library:', error);
            toast.error('Failed to load media files.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedItems(new Map());
            setActiveTab('library');
            if (defaultFolder && defaultFolder !== 'all') {
                setSelectedFolder(defaultFolder);
                setUploadFolder(defaultFolder);
                fetchMedia(defaultFolder, searchQuery);
            } else {
                fetchMedia('all', searchQuery);
            }
        }
    }, [isOpen, defaultFolder]);

    // Handle Folder change
    const handleFolderChange = (f: string) => {
        setSelectedFolder(f);
        if (f !== 'all' && folders.includes(f)) {
            setUploadFolder(f);
        }
        fetchMedia(f, searchQuery);
    };

    // Handle Search
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMedia(selectedFolder, searchQuery);
    };

    // Item click
    const handleItemClick = (file: MediaFile) => {
        if (multiple) {
            setSelectedItems(prev => {
                const next = new Map(prev);
                if (next.has(file.id)) {
                    next.delete(file.id);
                } else {
                    next.set(file.id, file);
                }
                return next;
            });
        } else {
            // Single select replaces selection
            setSelectedItems(new Map([[file.id, file]]));
        }
    };

    // Confirm selection
    const handleConfirm = () => {
        const items = Array.from(selectedItems.values()).map(f => ({
            url: f.url,
            path: f.path,
            file: f
        }));

        if (items.length === 0) {
            toast.error('Please select an image first.');
            return;
        }

        if (multiple) {
            if (onSelectMultiple) {
                onSelectMultiple(items);
            } else if (onSelect && items[0]) {
                onSelect(items[0]);
            }
        } else {
            if (onSelect && items[0]) {
                onSelect(items[0]);
            }
        }

        onClose();
    };

    // File Upload inside Modal
    const handleUploadFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        const formData = new FormData();
        Array.from(fileList).forEach(file => {
            formData.append('files[]', file);
        });
        formData.append('folder', uploadFolder);

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${fileList.length} file(s)... ⏳`);

        try {
            const res = await fetch(route('admin.file-manager.upload'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('File(s) uploaded and optimized successfully! 🎉', { id: toastId });

                // Refresh library
                await fetchMedia(uploadFolder);
                setSelectedFolder(uploadFolder);

                // Auto-select newly uploaded files
                if (data.uploaded && Array.from(data.uploaded).length > 0) {
                    const newMap = new Map<string, MediaFile>(multiple ? selectedItems : []);
                    (data.uploaded as MediaFile[]).forEach(f => {
                        newMap.set(f.id, f);
                    });
                    setSelectedItems(newMap);
                }

                // Switch to library tab
                setActiveTab('library');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                toast.error('Upload failed. Please check file size and format.', { id: toastId });
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Error uploading files.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    // Single active selected preview for sidebar
    const activeSelectedFile = selectedItems.size > 0 ? Array.from(selectedItems.values())[selectedItems.size - 1] : null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
                className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Modal Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#009E49]">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <span className="text-base font-black text-slate-900">{title}</span>
                        </div>

                        {/* Tabs (WordPress style) */}
                        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setActiveTab('library')}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    activeTab === 'library'
                                        ? 'bg-white text-[#009E49] shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Media Library
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    activeTab === 'upload'
                                        ? 'bg-white text-[#009E49] shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Upload Files
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Modal Body ───────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {activeTab === 'upload' ? (
                        /* ── TAB 1: UPLOAD FILES ── */
                        <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center bg-slate-50/50">
                            <div
                                onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        handleUploadFiles(e.dataTransfer.files);
                                    }
                                }}
                                className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-white shadow-xs ${
                                    isDragOver
                                        ? 'border-[#009E49] bg-emerald-50/70 scale-[1.01]'
                                        : 'border-slate-300 hover:border-emerald-400'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple={multiple}
                                    accept="image/*"
                                    onChange={(e) => handleUploadFiles(e.target.files)}
                                    className="hidden"
                                />

                                <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 text-[#009E49] mx-auto flex items-center justify-center mb-4 shadow-xs">
                                    <UploadCloud className={`w-8 h-8 ${isUploading ? 'animate-bounce' : ''}`} />
                                </div>

                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                                    {isUploading ? 'Uploading & Optimizing Media...' : 'Drop files anywhere to upload'}
                                </h3>
                                <p className="text-xs text-slate-500 mb-5">
                                    Supports WebP, PNG, JPG, JPEG, SVG, GIF up to 15MB. Automatically converted to optimized WebP.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
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
                                        className="px-5 py-2 rounded-xl bg-[#009E49] hover:bg-[#00873D] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                                    >
                                        {isUploading ? 'Processing...' : 'Select Files'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── TAB 2: MEDIA LIBRARY ── */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Filter Bar */}
                            <div className="p-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                {/* Folder Tabs */}
                                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                                    <button
                                        type="button"
                                        onClick={() => handleFolderChange('all')}
                                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            selectedFolder === 'all'
                                                ? 'bg-[#009E49] text-white shadow-2xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Layers className="w-3 h-3" />
                                        All
                                    </button>

                                    {folders.map(folder => {
                                        const count = folderCounts[folder] || 0;
                                        const isActive = selectedFolder === folder;
                                        return (
                                            <button
                                                key={folder}
                                                type="button"
                                                onClick={() => handleFolderChange(folder)}
                                                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-[#009E49] text-white shadow-2xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                <Folder className="w-3 h-3" />
                                                {folder}
                                                {count > 0 && (
                                                    <span className={`text-[10px] px-1 py-0.2 rounded-full ${
                                                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Bar & Refresh */}
                                <div className="flex items-center gap-2">
                                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Filter media..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                                        />
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                                    </form>

                                    <button
                                        type="button"
                                        onClick={() => fetchMedia()}
                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                                        title="Refresh"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Library Grid + Details Sidebar */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Grid container */}
                                <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
                                    {isLoading ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                                            <span className="text-xs font-semibold">Loading media library...</span>
                                        </div>
                                    ) : files.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                            <ImageIcon className="w-12 h-12 mb-2 text-slate-300" />
                                            <p className="text-sm font-bold text-slate-700">No media files found</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Switch to the 'Upload Files' tab to upload new media.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('upload')}
                                                className="mt-3 px-4 py-1.5 rounded-lg bg-[#009E49] text-white text-xs font-bold cursor-pointer hover:bg-[#00873D]"
                                            >
                                                Upload Now
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                            {files.map(file => {
                                                const isSelected = selectedItems.has(file.id);
                                                return (
                                                    <div
                                                        key={file.id}
                                                        onClick={() => handleItemClick(file)}
                                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-white shadow-2xs ${
                                                            isSelected
                                                                ? 'border-[#009E49] ring-2 ring-[#009E49]/30 scale-[0.98]'
                                                                : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
                                                        }`}
                                                    >
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            loading="lazy"
                                                            className="w-full h-full object-contain p-1"
                                                        />

                                                        {/* Selected Badge */}
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#009E49] text-white flex items-center justify-center shadow-xs">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}

                                                        {/* Filename Tag on Hover */}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-[10px] font-semibold text-white truncate text-center">
                                                                {file.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Right details sidebar (WordPress style) */}
                                {activeSelectedFile && (
                                    <div className="hidden md:flex w-64 border-l border-slate-200 bg-white flex-col p-4 overflow-y-auto space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Selected Media
                                            </span>
                                            <h4 className="text-xs font-bold text-slate-800 break-all">
                                                {activeSelectedFile.name}
                                            </h4>
                                        </div>

                                        <div className="aspect-square w-full rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                                            <img
                                                src={activeSelectedFile.url}
                                                alt={activeSelectedFile.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>

                                        <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Folder:</span>
                                                <span className="font-bold text-emerald-700 capitalize">{activeSelectedFile.folder}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Size:</span>
                                                <span className="font-bold text-slate-700">{activeSelectedFile.size}</span>
                                            </div>
                                            {activeSelectedFile.dimensions && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Dimensions:</span>
                                                    <span className="font-bold text-slate-700">{activeSelectedFile.dimensions}</span>
                                                </div>
                                            )}
                                        </div>

                                        <a
                                            href={activeSelectedFile.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Open Full Resolution
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Modal Footer ─────────────────────────────────────────── */}
                <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-medium">
                        {selectedItems.size > 0 ? (
                            <span className="text-emerald-700 font-bold">
                                {selectedItems.size} {selectedItems.size === 1 ? 'image' : 'images'} selected
                            </span>
                        ) : (
                            <span>Click an image to select it, or upload a new one.</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={selectedItems.size === 0}
                            onClick={handleConfirm}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009E49] hover:bg-[#00873D] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            {confirmText || (multiple ? `Add to Selection (${selectedItems.size})` : 'Use Selected Image')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPickerModal;
