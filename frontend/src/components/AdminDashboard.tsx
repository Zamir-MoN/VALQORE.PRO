import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Edit2, Trash2, LogOut, Search, Loader2, X, Package, Plus, AlertCircle, Gamepad2, Gift, Ticket, Image as ImageIcon, ShoppingCart, Copy, Check, Users, UserCheck, Download, Upload, Eye, GripVertical, ArrowUpDown, CreditCard, CheckCircle2, Clock, FileText, ChevronDown, Filter, Trophy, Sparkles, ExternalLink, Send, RotateCcw } from 'lucide-react';
import { FaDiscord, FaInstagram } from 'react-icons/fa';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { getYouTubeVideoId } from '../utils/youtube';
import { getImageUrl, getThumbnailUrl } from '../utils/image';
import { formatOrderId } from '../utils/order';
import { parseGiveawayRules } from '../utils/giveaway';
import type { Game } from '../types';
import {
  handleNormalSelect,
  handleCtrlToggle,
  handleShiftSelect,
  handleSelectAll,
  handleClearSelection,
  calculateGroupReorder,
  mergeReorderedWithFullList,
  filterGamesByStatus,
  calculateStatusCounts,
  type GameStatusFilter
} from '../utils/gameSelectionAndReorder';
import {
  calculateAutoScrollSpeed,
  getScrollableAncestor,
  performScroll
} from '../utils/dragAutoScroll';
import {
  calculateExternalUrlsToProcess,
  type ImageFields
} from '../utils/imageOptimization';
const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'games' | 'bundles' | 'giveaways' | 'coupons' | 'posters' | 'orders' | 'creator_requests' | 'users' | 'payments'>('games');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);

  // Multi-selection & Group drag-and-drop state
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(new Set());
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null);
  const [draggedGameId, setDraggedGameId] = useState<string | null>(null);
  const [draggedGroupIds, setDraggedGroupIds] = useState<string[]>([]);
  const [dragOverTarget, setDragOverTarget] = useState<{ id: string; position: 'above' | 'below' } | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [processingPublish, setProcessingPublish] = useState<string | null>(null);
  const [processingCreatorAccess, setProcessingCreatorAccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Snapshot of images when edit modal opens to avoid redundant optimization of unchanged images
  const initialImageStateRef = useRef<ImageFields>({
    coverImage: '',
    tagImage: '',
    screenshots: []
  });

  // Auto-scrolling state & refs for Drag-and-Drop
  const gamesListRef = useRef<HTMLDivElement>(null);
  const isDraggingGameRef = useRef(false);
  const dragRafIdRef = useRef<number | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragOverTargetRef = useRef<{ id: string; position: 'above' | 'below' } | null>(null);
  const draggedGroupIdsRef = useRef<string[]>([]);
  const isReorderingRef = useRef(false);

  // Sync ref values for animation loop without causing re-renders
  useEffect(() => {
    dragOverTargetRef.current = dragOverTarget;
  }, [dragOverTarget]);

  useEffect(() => {
    draggedGroupIdsRef.current = draggedGroupIds;
  }, [draggedGroupIds]);

  useEffect(() => {
    isReorderingRef.current = isReordering;
  }, [isReordering]);

  // Status Filter State for Games Tab
  const [gameStatusFilter, setGameStatusFilter] = useState<GameStatusFilter>('all');

  // Compute status breakdown counts for regular games (excluding bundles and giveaways)
  const baseGames = useMemo(() => {
    return games.filter(g => !g.isBundle && !g.isGiveaway);
  }, [games]);

  const statusCounts = useMemo(() => {
    return calculateStatusCounts(baseGames);
  }, [baseGames]);

  const handleStatusFilterChange = (filter: GameStatusFilter) => {
    setGameStatusFilter(filter);
    setSelectedGameIds(new Set());
    setSelectionAnchorId(null);
    setDraggedGameId(null);
    setDraggedGroupIds([]);
    setDragOverTarget(null);
  };

  const [draggedScreenshotIndex, setDraggedScreenshotIndex] = useState<number | null>(null);
  const [dragOverScreenshotIndex, setDragOverScreenshotIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [bundleSearchTerm, setBundleSearchTerm] = useState('');

  // Payments State
  const [adminPayments, setAdminPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Order state
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);


  // Coupon state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponFormData, setCouponFormData] = useState({ code: '', discount: '', createdBy: 'Sagar', usageLimit: '', creatorId: '', commissionRate: '' });
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Poster state
  const [posters, setPosters] = useState<any[]>([]);
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [posterToDelete, setPosterToDelete] = useState<string | null>(null);

  const [creatorRequests, setCreatorRequests] = useState<any[]>([]);
  const [loadingCreatorRequests, setLoadingCreatorRequests] = useState(false);
  const [selectedCreatorRequest, setSelectedCreatorRequest] = useState<any>(null);

  const [importPreviewData, setImportPreviewData] = useState<any>(null);
  const [importGamesData, setImportGamesData] = useState<any[]>([]);
  const [importMode, setImportMode] = useState<'create-only' | 'restore'>('create-only');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    rating: 0,
    genre: '',
    price: 0,
    steamPrice: '',
    internalCost: '',
    discount: 0,
    coverImage: '',
    releaseDate: '',
    platforms: '',
    isRentable: false,
    outOfStock: false,
    isGiveaway: false,
    giveawayRules: '',
    rentPrice: '',
    rentDurationDays: 7,
    rentRules: '',
    minRequirements: '',
    recRequirements: '',
    trailerUrl: '',
    screenshots: '',
    tagImage: '',
    steamAppId: '',
    creatorAccess: false,
    isBundle: false,
    bundleGames: '',
    description: '',
    slug: '',
    isPublished: false
  });

  // Giveaway specific form states
  const [giveawayCategory, setGiveawayCategory] = useState<string>('Game Bundle');
  const [giveawayWorth, setGiveawayWorth] = useState<string>('');
  const [giveawayEndDate, setGiveawayEndDate] = useState<string>('');
  const [giveawayWinnersCount, setGiveawayWinnersCount] = useState<number>(1);
  const [giveawayRequireDiscord, setGiveawayRequireDiscord] = useState<boolean>(true);
  const [giveawayDiscordUrl, setGiveawayDiscordUrl] = useState<string>('https://discord.gg/WKWqt7DGAd');
  const [giveawayRequireInstagram, setGiveawayRequireInstagram] = useState<boolean>(true);
  const [giveawayInstagramUrl, setGiveawayInstagramUrl] = useState<string>('https://www.instagram.com/valqore.pro/');

  // Giveaway Participants & Winner State
  const [participantsModalGame, setParticipantsModalGame] = useState<Game | null>(null);
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [drawingWinnerForId, setDrawingWinnerForId] = useState<string | null>(null);
  const [drawnWinnerModal, setDrawnWinnerModal] = useState<{ gameTitle: string; winner: any } | null>(null);

  // Giveaway Instagram DM 4-Digit Code Approval State
  const [giveawayApproveCode, setGiveawayApproveCode] = useState<string>('');
  const [approvingGiveawayCode, setApprovingGiveawayCode] = useState<boolean>(false);
  const [approvingGiveawayEntryId, setApprovingGiveawayEntryId] = useState<string | null>(null);
  const [revokingGiveawayEntryId, setRevokingGiveawayEntryId] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagImageFile, setTagImageFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const tagImageInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  const clearCoverImage = () => {
    setImageFile(null);
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
  };

  const clearTagImage = () => {
    setTagImageFile(null);
    if (tagImageInputRef.current) tagImageInputRef.current.value = '';
  };

  const clearScreenshots = () => {
    setScreenshotFiles([]);
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
  };

  useEffect(() => {
    if (token) {
      fetchGames();
      fetchCoupons();
      fetchPosters();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'orders' && token) {
      fetchAdminOrders(searchQuery);
    }
    if (activeTab === 'payments' && token) {
      fetchAdminPayments(searchQuery, paymentFilter);
    }
    if (activeTab === 'creator_requests' && token) {
      fetchCreatorRequests();
    }
    if (activeTab === 'users' && token) {
      fetchUsers();
    }
  }, [activeTab, paymentFilter]);

  useEffect(() => {
    if (formData.isBundle) {
      const selectedList = formData.bundleGames 
        ? formData.bundleGames.split(/[,+]/).map(s => s.trim()).filter(Boolean)
        : [];
      
      let totalSteamPrice = 0;
      selectedList.forEach(item => {
        const matched = games.find(g => g.id === item || g.title.toLowerCase() === item.toLowerCase());
        if (matched && matched.steamPrice && !isNaN(Number(matched.steamPrice))) {
          totalSteamPrice += Number(matched.steamPrice);
        }
      });

      setFormData(prev => {
        const newSteamPrice = totalSteamPrice > 0 ? String(totalSteamPrice) : '';
        if (prev.steamPrice !== newSteamPrice) {
          return { ...prev, steamPrice: newSteamPrice };
        }
        return prev;
      });
    }
  }, [formData.bundleGames, formData.isBundle, games]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const fetchAdminPayments = async (query = '', status = paymentFilter) => {
    setLoadingPayments(true);
    try {
      const res = await axios.get(`${API_URL}/payments/admin/all`, {
        params: { search: query || undefined, status: status !== 'ALL' ? status : undefined },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
      toast.error('Failed to load payments list');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleAdminVerifyPayment = async (orderId: string, utr?: string) => {
    try {
      await axios.put(`${API_URL}/payments/admin/${orderId}/verify`, { utr }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payment approved and order completed!');
      fetchAdminPayments(searchQuery, paymentFilter);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to verify payment');
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_URL}/auth/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsersList(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${API_URL}/auth/admin/users/${userToDelete}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      setUsersList(prev => prev.filter(u => u.id !== userToDelete));
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setUserToDelete(null);
    }
  };


  const exportGamesBackup = async () => {
    if (!window.confirm('IMPORTANT: This JSON export only backs up game metadata. Cover images, tag images, and screenshots are NOT included in this file.\n\nTo preserve media, you must manually back up the "/uploads/" directory on your server. Proceed with JSON export?')) {
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/games/backup/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `valqore_games_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Exported ${res.data.totalGames || res.data.games?.length} games to JSON!`);
    } catch (err) {
      toast.error('Failed to export backup');
    }
  };

  const handleBackupFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const gamesArray = Array.isArray(json) ? json : json.games;
        if (!gamesArray || !Array.isArray(gamesArray)) {
          toast.error('Invalid JSON format. File must contain a games array.');
          return;
        }

        const res = await axios.post(`${API_URL}/games/backup/import`, { 
          games: gamesArray,
          mode: 'create-only',
          preview: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setImportGamesData(gamesArray);
        setImportMode('create-only');
        setImportPreviewData(res.data);
        setIsImportModalOpen(true);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to read backup file');
      } finally {
        if (backupFileInputRef.current) backupFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const updateImportMode = async (newMode: 'create-only' | 'restore') => {
    setImportMode(newMode);
    try {
      const res = await axios.post(`${API_URL}/games/backup/import`, { 
        games: importGamesData, 
        mode: newMode, 
        preview: true 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImportPreviewData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const executeImport = async () => {
    if (importMode === 'restore') {
      if (!window.confirm('WARNING: Restore mode will overwrite existing game data with the backup data. Are you sure you want to proceed?')) return;
    }
    
    try {
      const res = await axios.post(`${API_URL}/games/backup/import`, { 
        games: importGamesData, 
        mode: importMode, 
        preview: false 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Games imported successfully!');
      setIsImportModalOpen(false);
      setImportGamesData([]);
      setImportPreviewData(null);
      fetchGames();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to import games');
    }
  };

  const fetchGames = async () => {
    try {
      const res = await axios.get(`${API_URL}/games/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGames(res.data);
      // Prune any deleted or removed game IDs from selection
      setSelectedGameIds(prev => {
        if (prev.size === 0) return prev;
        const currentIds = new Set(res.data.map((g: Game) => g.id));
        const updated = new Set<string>();
        prev.forEach(id => {
          if (currentIds.has(id)) updated.add(id);
        });
        return updated.size === prev.size ? prev : updated;
      });
      setLoading(false);
    } catch (_err) {
      toast.error('Failed to fetch games');
      setLoading(false);
    }
  };

  // Stop continuous auto-scrolling and reset tracking state
  const stopAutoScroll = () => {
    isDraggingGameRef.current = false;
    if (dragRafIdRef.current !== null) {
      cancelAnimationFrame(dragRafIdRef.current);
      dragRafIdRef.current = null;
    }
    pointerPosRef.current = null;
  };

  // Start continuous frame-based auto-scrolling loop
  const startAutoScroll = () => {
    isDraggingGameRef.current = true;
    if (dragRafIdRef.current === null) {
      const autoScrollLoop = () => {
        if (!isDraggingGameRef.current) {
          dragRafIdRef.current = null;
          return;
        }

        const pos = pointerPosRef.current;
        if (pos) {
          const innerContainer = getScrollableAncestor(gamesListRef.current);
          let delta = 0;

          // If the games list is inside an inner scrollable container, check inner container bounds first
          if (innerContainer) {
            const rect = innerContainer.getBoundingClientRect();
            const inContainerX = pos.x >= rect.left && pos.x <= rect.right;
            if (inContainerX && pos.y >= rect.top && pos.y <= rect.bottom) {
              delta = calculateAutoScrollSpeed(pos.y, rect.top, rect.bottom, {
                zoneSize: 100,
                maxSpeed: 24,
                minSpeed: 2
              });
            }
          }

          // If inner container didn't trigger scroll, check window viewport edges
          if (delta === 0) {
            delta = calculateAutoScrollSpeed(pos.y, 0, window.innerHeight, {
              zoneSize: 120,
              maxSpeed: 28,
              minSpeed: 2
            });
          }

          if (delta !== 0) {
            performScroll(delta, innerContainer);

            // Dynamically update drop target under pointer while scrolling
            const el = document.elementFromPoint(pos.x, pos.y);
            const row = el?.closest('[data-game-id]');
            if (row) {
              const targetId = row.getAttribute('data-game-id');
              if (targetId && !draggedGroupIdsRef.current.includes(targetId) && !isReorderingRef.current) {
                const rect = row.getBoundingClientRect();
                const offsetY = pos.y - rect.top;
                const position: 'above' | 'below' = offsetY < rect.height / 2 ? 'above' : 'below';
                const current = dragOverTargetRef.current;
                if (!current || current.id !== targetId || current.position !== position) {
                  const nextTarget = { id: targetId, position };
                  dragOverTargetRef.current = nextTarget;
                  setDragOverTarget(nextTarget);
                }
              }
            }
          }
        }

        dragRafIdRef.current = requestAnimationFrame(autoScrollLoop);
      };

      dragRafIdRef.current = requestAnimationFrame(autoScrollLoop);
    }
  };

  // Global dragover, drop, and window blur listeners for smooth auto-scrolling
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      if (!isDraggingGameRef.current) return;
      if (e.clientX === 0 && e.clientY === 0) return;
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleGlobalDragEnd = () => {
      stopAutoScroll();
    };

    const handleGlobalBlur = () => {
      stopAutoScroll();
    };

    window.addEventListener('dragover', handleGlobalDragOver, { passive: true });
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    window.addEventListener('blur', handleGlobalBlur);

    return () => {
      stopAutoScroll();
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
      window.removeEventListener('blur', handleGlobalBlur);
    };
  }, []);

  // Clear selection, reset status filter, and stop auto-scroll when activeTab changes
  useEffect(() => {
    stopAutoScroll();
    setGameStatusFilter('all');
    setSelectedGameIds(new Set());
    setSelectionAnchorId(null);
    setDraggedGameId(null);
    setDraggedGroupIds([]);
    setDragOverTarget(null);
  }, [activeTab]);

  // Pressing Escape clears current selection and cancels active drag/scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAutoScroll();
        handleDragEnd();
        setSelectedGameIds(new Set());
        setSelectionAnchorId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragStart = (e: React.DragEvent, game: Game, currentFilteredGames: Game[]) => {
    if (searchQuery || isReordering) {
      e.preventDefault();
      return;
    }

    let movingIds: string[] = [];
    if (selectedGameIds.has(game.id)) {
      // Dragging selected group: preserve relative order
      movingIds = currentFilteredGames
        .filter(g => selectedGameIds.has(g.id))
        .map(g => g.id);
    } else {
      // Drag begins on unselected game: single-game drag behavior & selection rules
      const single = handleNormalSelect(game.id);
      setSelectedGameIds(single.selectedIds);
      setSelectionAnchorId(single.anchorId);
      movingIds = [game.id];
    }

    setDraggedGameId(game.id);
    setDraggedGroupIds(movingIds);
    pointerPosRef.current = { x: e.clientX, y: e.clientY };
    startAutoScroll();

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', game.id);

    // Visual ghost indicator for multi-selection drag
    if (movingIds.length > 1) {
      const ghost = document.createElement('div');
      ghost.innerText = `Moving ${movingIds.length} games`;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      ghost.style.left = '-1000px';
      ghost.style.padding = '6px 12px';
      ghost.style.background = '#DCF836';
      ghost.style.color = '#000000';
      ghost.style.fontWeight = 'bold';
      ghost.style.fontSize = '12px';
      ghost.style.borderRadius = '8px';
      ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
      ghost.style.zIndex = '9999';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
      requestAnimationFrame(() => {
        document.body.removeChild(ghost);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent, game: Game) => {
    e.preventDefault();
    pointerPosRef.current = { x: e.clientX, y: e.clientY };
    if (!draggedGameId || isReordering || draggedGroupIds.includes(game.id)) {
      if (dragOverTarget !== null) setDragOverTarget(null);
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position: 'above' | 'below' = offsetY < rect.height / 2 ? 'above' : 'below';

    if (!dragOverTarget || dragOverTarget.id !== game.id || dragOverTarget.position !== position) {
      setDragOverTarget({ id: game.id, position });
    }
  };

  const handleDragEnd = () => {
    stopAutoScroll();
    setDraggedGameId(null);
    setDraggedGroupIds([]);
    setDragOverTarget(null);
  };

  const handleDrop = async (targetGame: Game, currentFilteredGames: Game[]) => {
    stopAutoScroll();
    if (!draggedGameId || draggedGroupIds.length === 0 || !dragOverTarget || isReordering) {
      handleDragEnd();
      return;
    }

    if (draggedGroupIds.includes(targetGame.id)) {
      handleDragEnd();
      return;
    }

    const dropPosition = dragOverTarget.position;
    const currentDraggedGroup = [...draggedGroupIds];
    handleDragEnd();

    const reorderedFiltered = calculateGroupReorder(
      currentFilteredGames,
      currentDraggedGroup,
      targetGame.id,
      dropPosition
    );

    const hasChanged = reorderedFiltered.some((g, i) => g.id !== currentFilteredGames[i]?.id);
    if (!hasChanged) return;

    const previousGames = [...games];
    const newFullGamesList = mergeReorderedWithFullList(
      games,
      reorderedFiltered,
      activeTab,
      activeTab === 'games' ? gameStatusFilter : 'all'
    );

    // Optimistically update local UI state smoothly
    setGames(newFullGamesList);

    // Save reordered array to database
    try {
      setIsReordering(true);
      const gameIds = newFullGamesList.map(g => g.id);
      await axios.put(`${API_URL}/games/reorder`, { gameIds }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(
        currentDraggedGroup.length > 1
          ? `Moved ${currentDraggedGroup.length} games to new position!`
          : 'Game position updated!',
        { id: 'reorder-toast', duration: 1500 }
      );
    } catch (err: any) {
      console.error('Reorder error:', err);
      toast.error(err.response?.data?.error || 'Failed to save reordered positions');
      setGames(previousGames); // Rollback on error
      fetchGames(); // Re-sync canonical state
    } finally {
      setIsReordering(false);
    }
  };

  const handleRowClick = (e: React.MouseEvent, game: Game, visibleList: Game[]) => {
    if (isReordering) return;

    // Ignore clicks on buttons, links, inputs, or drag handles
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, [data-drag-handle="true"]')) {
      return;
    }

    // Prevent browser text selection when clicking with shift
    if (e.shiftKey) {
      window.getSelection()?.removeAllRanges();
    }

    if (e.ctrlKey || e.metaKey) {
      const result = handleCtrlToggle(game.id, selectedGameIds);
      setSelectedGameIds(result.selectedIds);
      setSelectionAnchorId(result.anchorId);
    } else if (e.shiftKey) {
      const result = handleShiftSelect(game.id, selectionAnchorId, selectedGameIds, visibleList);
      setSelectedGameIds(result.selectedIds);
      setSelectionAnchorId(result.anchorId);
    } else {
      const result = handleNormalSelect(game.id);
      setSelectedGameIds(result.selectedIds);
      setSelectionAnchorId(result.anchorId);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, gameId: string) => {
    e.stopPropagation();
    const result = handleCtrlToggle(gameId, selectedGameIds);
    setSelectedGameIds(result.selectedIds);
    setSelectionAnchorId(result.anchorId);
  };


  const handleScreenshotDragStart = (index: number) => {
    setDraggedScreenshotIndex(index);
  };

  const handleScreenshotDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverScreenshotIndex !== index) {
      setDragOverScreenshotIndex(index);
    }
  };

  const handleScreenshotDragEnd = () => {
    setDraggedScreenshotIndex(null);
    setDragOverScreenshotIndex(null);
  };

  const handleScreenshotDrop = (dropIndex: number) => {
    if (draggedScreenshotIndex === null || draggedScreenshotIndex === dropIndex) {
      setDraggedScreenshotIndex(null);
      setDragOverScreenshotIndex(null);
      return;
    }

    const currentUrls = formData.screenshots ? formData.screenshots.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (draggedScreenshotIndex >= currentUrls.length || dropIndex >= currentUrls.length) return;

    const reordered = [...currentUrls];
    const [movedUrl] = reordered.splice(draggedScreenshotIndex, 1);
    reordered.splice(dropIndex, 0, movedUrl);

    setFormData({ ...formData, screenshots: reordered.join(',') });
    setDraggedScreenshotIndex(null);
    setDragOverScreenshotIndex(null);
  };



  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons`, { headers: { 'Authorization': `Bearer ${token}` } });
      setCoupons(res.data);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    }
  };

  const fetchPosters = async () => {
    try {
      const res = await axios.get(`${API_URL}/posters`);
      setPosters(res.data);
    } catch (err) {
      console.error('Failed to fetch posters', err);
    }
  };

  const fetchAdminOrders = async (search: string = '') => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API_URL}/orders/admin${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAdminOrders(res.data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCreatorRequests = async () => {
    setLoadingCreatorRequests(true);
    try {
      const res = await axios.get(`${API_URL}/creators/admin/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCreatorRequests(res.data);
    } catch (err) {
      toast.error('Failed to fetch creator requests');
    } finally {
      setLoadingCreatorRequests(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(`${API_URL}/orders/admin/${orderId}/status`, { status }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(`Order marked as ${status}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const deleteAllOrders = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete ALL orders? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('All orders deleted successfully');
      setAdminOrders([]);
    } catch (err) {
      toast.error('Failed to delete orders');
    }
  };

  const updateCreatorRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`${API_URL}/creators/admin/${requestId}/status`, { status }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(`Application marked as ${status}`);
      if (selectedCreatorRequest && selectedCreatorRequest.id === requestId) {
        setSelectedCreatorRequest({ ...selectedCreatorRequest, status });
      }
      setCreatorRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    } catch (err) {
      toast.error('Failed to update creator request status');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/coupons`, couponFormData, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Coupon created successfully');
      setCouponFormData({ ...couponFormData, code: '', discount: '', usageLimit: '', creatorId: '', commissionRate: '' });
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create coupon');
    }
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    try {
      await axios.delete(`${API_URL}/coupons/${couponToDelete}`, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    } finally {
      setCouponToDelete(null);
    }
  };

  const handlePosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/posters`, { imageUrl: posterImageUrl }, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Poster added successfully');
      setPosterImageUrl('');
      fetchPosters();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add poster');
    }
  };

  const confirmDeletePoster = async () => {
    if (!posterToDelete) return;
    try {
      await axios.delete(`${API_URL}/posters/${posterToDelete}`, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Poster deleted');
      fetchPosters();
    } catch (err) {
      toast.error('Failed to delete poster');
    } finally {
      setPosterToDelete(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const validateFileSize = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Image size exceeds 10MB limit: ${file.name}`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (validateFileSize(e.target.files[0])) {
        setImageFile(e.target.files[0]);
      } else {
        e.target.value = '';
      }
    }
  };

  const handleTagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (validateFileSize(e.target.files[0])) {
        setTagImageFile(e.target.files[0]);
      } else {
        e.target.value = '';
      }
    }
  };

  const handleScreenshotFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(validateFileSize);
      setScreenshotFiles(validFiles);
      if (validFiles.length !== files.length) {
        e.target.value = ''; // clear input if any failed
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const submitter = (e.nativeEvent as any).submitter as HTMLButtonElement;
    const action = submitter?.value || 'save';

    if (action === 'unpublish') {
      if (!window.confirm('Are you sure you want to unpublish this game? It will be removed from public listings.')) return;
    }
    if (action === 'cancel') return;

    if (formData.trailerUrl && formData.trailerUrl.trim() !== '') {
      const videoId = getYouTubeVideoId(formData.trailerUrl);
      if (!videoId) {
        toast.error('Please enter a valid YouTube video URL.');
        return;
      }
    }

    setIsSaving(true);
    const reqId = Date.now();
    console.time(`[FRONTEND SAVE ${reqId}] Total`);
    console.time(`[FRONTEND SAVE ${reqId}] Images Upload`);

    try {
      let imageUrl = formData.coverImage;
      let tagImageUrl = formData.tagImage;

      if (imageFile) {
        const form = new FormData();
        form.append('image', imageFile);
        try {
          const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          imageUrl = uploadRes.data.url;
        } catch (err: any) {
          toast.error(`Image error: ${err.response?.data?.error || err.message}`);
          console.error("Cover image upload error:", err);
          return;
        }
      }

      if (tagImageFile) {
        const form = new FormData();
        form.append('image', tagImageFile);
        try {
          const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          tagImageUrl = uploadRes.data.url;
        } catch (err: any) {
          toast.error(`Tag image error: ${err.response?.data?.error || err.message}`);
          console.error("Tag image upload error:", err);
          return;
        }
      }

      let screenshotsStr = formData.screenshots;
      if (screenshotFiles.length > 0) {
        const form = new FormData();
        screenshotFiles.forEach(file => form.append('images', file));
        try {
          const uploadRes = await axios.post(`${API_URL}/upload/multiple`, form, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const uploadedUrls = uploadRes.data.urls;
          const existing = screenshotsStr ? screenshotsStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          screenshotsStr = [...existing, ...uploadedUrls].join(',');
        } catch (err: any) {
          toast.error(`Screenshots error: ${err.response?.data?.error || err.message}`);
          console.error("Screenshot upload error:", err);
          return;
        }
      }
      
      console.timeEnd(`[FRONTEND SAVE ${reqId}] Images Upload`);

      // Idempotently determine only newly added or modified external images that actually need optimization
      const externalUrlsToProcess = calculateExternalUrlsToProcess(
        {
          coverImage: imageUrl,
          tagImage: tagImageUrl,
          screenshots: screenshotsStr,
          hasNewCoverFile: Boolean(imageFile),
          hasNewTagFile: Boolean(tagImageFile),
        },
        initialImageStateRef.current,
        isEditing
      );

      let screenshotsArr = screenshotsStr ? screenshotsStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

      if (externalUrlsToProcess.length > 0) {
        toast.loading(`Optimizing ${externalUrlsToProcess.length} external image(s)...`, { id: 'ext-opt' });
        try {
          const extRes = await axios.post(`${API_URL}/upload/external`, { urls: externalUrlsToProcess }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const results = extRes.data.results || {};
          
          if (imageUrl && results[imageUrl]) imageUrl = results[imageUrl];
          if (tagImageUrl && results[tagImageUrl]) tagImageUrl = results[tagImageUrl];
          
          screenshotsArr = screenshotsArr.map(url => results[url] || url);
          screenshotsStr = screenshotsArr.join(',');
          toast.success(`Optimized ${externalUrlsToProcess.length} external image(s)!`, { id: 'ext-opt' });
        } catch (err: any) {
          console.error("External image optimization error:", err);
          toast.error(`External optimization failed or partially failed, keeping original URLs`, { id: 'ext-opt' });
        }
      }

      let targetPublished = formData.isPublished;
      if (action === 'publish') {
        if (!formData.isGiveaway) {
          const priceVal = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
          if (!priceVal || priceVal <= 0) {
            toast.error('Add selling price to publish game.');
            setTimeout(() => {
              document.getElementById('game-price-input')?.focus();
            }, 100);
            return;
          }
        }
        targetPublished = true;
      }
      if (action === 'unpublish') targetPublished = false;
      if (!isEditing && action === 'save') targetPublished = false;

      const dataToSubmit: any = { 
        ...formData, 
        coverImage: imageUrl, 
        tagImage: tagImageUrl, 
        screenshots: screenshotsStr, 
        isPublished: targetPublished 
      };

      if (formData.isGiveaway) {
        const existingRules = isEditing && currentId ? games.find(g => g.id === currentId)?.giveawayRules : null;
        const parsedExisting = parseGiveawayRules(existingRules);

        const giveawayConfig = {
          category: giveawayCategory,
          worth: parseFloat(giveawayWorth) || 0,
          endDate: giveawayEndDate,
          winnersCount: giveawayWinnersCount,
          tasks: {
            discord: { required: giveawayRequireDiscord, url: giveawayDiscordUrl },
            instagram: { required: giveawayRequireInstagram, url: giveawayInstagramUrl }
          },
          rules: formData.giveawayRules || '',
          winner: parsedExisting.winner || null
        };

        dataToSubmit.giveawayRules = JSON.stringify(giveawayConfig);
        dataToSubmit.developer = giveawayCategory || 'Valqore Giveaway';
        dataToSubmit.genre = giveawayCategory || 'Subscription';
        dataToSubmit.platforms = 'All Platforms';
        dataToSubmit.price = 0;
        dataToSubmit.isBundle = false;
        dataToSubmit.rating = 5.0;
        dataToSubmit.releaseDate = giveawayEndDate ? giveawayEndDate.split('T')[0] : (formData.releaseDate || new Date().toISOString().split('T')[0]);
      }

      let updatedGameRes;
      if (isEditing && currentId) {
        updatedGameRes = await axios.put(`${API_URL}/games/${currentId}`, dataToSubmit, { headers: { 'Authorization': `Bearer ${token}` } });
        toast.success(formData.isGiveaway ? 'Giveaway updated successfully' : 'Game updated successfully');
      } else {
        updatedGameRes = await axios.post(`${API_URL}/games`, dataToSubmit, { headers: { 'Authorization': `Bearer ${token}` } });
        toast.success(formData.isGiveaway ? 'Giveaway added successfully' : 'Game added successfully');
      }
      
      if (updatedGameRes && updatedGameRes.data) {
        const returnedGame = updatedGameRes.data;
        setGames(prevGames => {
          if (isEditing && currentId) {
            return prevGames.map(g => g.id === currentId ? { ...g, ...returnedGame } : g);
          } else {
            return [returnedGame, ...prevGames];
          }
        });
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Operation failed');
      console.error("Update failed:", err);
    } finally {
      setIsSaving(false);
      console.timeEnd(`[FRONTEND SAVE ${reqId}] Total`);
    }
  };

  const editGame = (game: any) => {
    setIsEditing(true);
    setCurrentId(game.id);
    initialImageStateRef.current = {
      coverImage: (game.coverImage || '').trim(),
      tagImage: (game.tagImage || '').trim(),
      screenshots: (game.screenshots || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    };
    setFormData({
      title: game.title,
      developer: game.developer,
      rating: game.rating,
      genre: game.genre,
      price: game.price,
      steamPrice: game.steamPrice || '',
      internalCost: game.internalCost || '',
      discount: game.discount,
      coverImage: game.coverImage,
      releaseDate: game.releaseDate,
      platforms: game.platforms,
      isRentable: game.isRentable || false,
      outOfStock: game.outOfStock || false,
      isGiveaway: game.isGiveaway || false,
      giveawayRules: game.giveawayRules || '',
      rentPrice: game.rentPrice || '',
      rentDurationDays: game.rentDurationDays || 7,
      rentRules: game.rentRules || '',
      minRequirements: game.minRequirements || '',
      recRequirements: game.recRequirements || '',
      trailerUrl: game.trailerUrl || '',
      screenshots: game.screenshots || '',
      tagImage: game.tagImage || '',
      steamAppId: game.steamAppId || '',
      creatorAccess: game.creatorAccess || false,
      isBundle: game.isGiveaway ? false : (game.isBundle || false),
      bundleGames: game.bundleGames || '',
      description: game.description || '',
      slug: game.slug || '',
      isPublished: game.isPublished ?? false
    });

    if (game.isGiveaway) {
      const gConfig = parseGiveawayRules(game.giveawayRules);
      let cat = gConfig.category || game.genre || 'Game Bundle';
      if (cat === 'Game Key') cat = 'Single Game';
      if (cat === 'Other') cat = 'Other Reward';
      setGiveawayCategory(cat);
      setGiveawayWorth(gConfig.worth ? String(gConfig.worth) : (game.price ? String(game.price) : ''));
      setGiveawayEndDate(gConfig.endDate || '');
      setGiveawayWinnersCount(gConfig.winnersCount || 1);
      setGiveawayRequireDiscord(gConfig.tasks?.discord?.required !== false);
      setGiveawayDiscordUrl(gConfig.tasks?.discord?.url || 'https://discord.gg/WKWqt7DGAd');
      setGiveawayRequireInstagram(gConfig.tasks?.instagram?.required !== false);
      setGiveawayInstagramUrl(gConfig.tasks?.instagram?.url || 'https://www.instagram.com/valqore.pro/');
    }

    setImageFile(null);
    setTagImageFile(null);
    setScreenshotFiles([]);
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    if (tagImageInputRef.current) tagImageInputRef.current.value = '';
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setGameToDelete(id);
  };

  const confirmDelete = async () => {
    if (!gameToDelete) return;
    try {
      await axios.delete(`${API_URL}/games/${gameToDelete}`, { headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Game deleted');
      fetchGames();
    } catch (err) {
      toast.error('Failed to delete game');
    } finally {
      setGameToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const toggleOutOfStock = async (gameId: string, currentStatus: boolean) => {
    try {
      await axios.put(`${API_URL}/games/${gameId}`, 
        { outOfStock: !currentStatus }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(currentStatus ? 'Game is back in stock!' : 'Game marked as out of stock!');
      fetchGames();
    } catch (err) {
      toast.error('Failed to update stock status');
      console.error("Toggle stock failed:", err);
    }
  };

  const togglePublishedStatus = async (gameId: string, currentStatus: boolean, gamePrice: number | string) => {
    if (processingPublish) return;

    const targetGame = games.find(g => g.id === gameId);
    if (!currentStatus && !targetGame?.isGiveaway) {
      const priceVal = typeof gamePrice === 'string' ? parseFloat(gamePrice) : gamePrice;
      if (!priceVal || priceVal <= 0) {
        toast.error('Add selling price to publish game.');
        if (targetGame) {
          editGame(targetGame);
          setTimeout(() => {
            document.getElementById('game-price-input')?.focus();
          }, 100);
        }
        return;
      }
    }

    setProcessingPublish(gameId);
    try {
      await axios.put(`${API_URL}/games/${gameId}`, 
        { isPublished: !currentStatus }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(currentStatus ? 'Game unpublished!' : 'Game is now published!');
      fetchGames();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update publication status');
      console.error("Toggle published failed:", err);
    } finally {
      setProcessingPublish(null);
    }
  };

  const toggleCreatorAccess = async (gameId: string, currentStatus: boolean) => {
    if (processingCreatorAccess === gameId) return;

    const nextStatus = !currentStatus;
    setProcessingCreatorAccess(gameId);

    // Optimistic UI update: immediately update game state so toggle switch & Creator badge update instantly
    setGames(prevGames =>
      prevGames.map(g => (g.id === gameId ? { ...g, creatorAccess: nextStatus } : g))
    );

    try {
      const res = await axios.put(
        `${API_URL}/games/${gameId}`,
        { creatorAccess: nextStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Reconcile response if returned
      if (res.data && res.data.id === gameId) {
        setGames(prevGames =>
          prevGames.map(g => (g.id === gameId ? { ...g, ...res.data } : g))
        );
      }
      toast.success(nextStatus ? 'Creator Access enabled!' : 'Creator Access disabled!');
      fetchGames();
    } catch (err: any) {
      // Revert optimistic update on failure
      setGames(prevGames =>
        prevGames.map(g => (g.id === gameId ? { ...g, creatorAccess: currentStatus } : g))
      );
      const errorMsg = err.response?.data?.error || 'Failed to update Creator Access';
      toast.error(errorMsg);
      console.error("Toggle creator access failed:", err);
      fetchGames();
    } finally {
      setProcessingCreatorAccess(null);
    }
  };

  // Open Giveaway Participants Modal
  const openGiveawayParticipants = async (game: Game) => {
    setParticipantsModalGame(game);
    setParticipantsList([]);
    setLoadingParticipants(true);
    try {
      const res = await axios.get(`${API_URL}/giveaways/admin/${game.id}/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParticipantsList(res.data.entries || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch giveaway entries');
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Admin approves giveaway participant by pasting 4-digit code
  const handleApproveGiveawayCode = async (gameId: string) => {
    if (!giveawayApproveCode.trim()) {
      toast.error('Please enter the 4-digit code from Instagram DM');
      return;
    }

    setApprovingGiveawayCode(true);
    try {
      const res = await axios.post(
        `${API_URL}/giveaways/admin/${gameId}/approve-code`,
        { code: giveawayApproveCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || 'Participant approved! 🎉', { duration: 5000 });
      setGiveawayApproveCode('');
      if (participantsModalGame) {
        openGiveawayParticipants(participantsModalGame);
      }
      fetchGames();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve code');
    } finally {
      setApprovingGiveawayCode(false);
    }
  };

  // Admin directly approves a participant by clicking Approve on their row
  const handleApproveGiveawayEntryDirectly = async (entryId: string) => {
    setApprovingGiveawayEntryId(entryId);
    try {
      const res = await axios.post(
        `${API_URL}/giveaways/admin/entries/${entryId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || 'Participant approved! 🎉');
      if (participantsModalGame) {
        openGiveawayParticipants(participantsModalGame);
      }
      fetchGames();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve entry');
    } finally {
      setApprovingGiveawayEntryId(null);
    }
  };

  // Admin revokes an approved participant back to Pending (e.g. if user unfollowed on Instagram)
  const handleRevokeGiveawayEntryDirectly = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to revoke this participant approval? They will be moved back to Pending DM.')) {
      return;
    }

    setRevokingGiveawayEntryId(entryId);
    try {
      const res = await axios.post(
        `${API_URL}/giveaways/admin/entries/${entryId}/revoke`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || 'Approval revoked to Pending');
      if (participantsModalGame) {
        openGiveawayParticipants(participantsModalGame);
      }
      fetchGames();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to revoke approval');
    } finally {
      setRevokingGiveawayEntryId(null);
    }
  };

  // Draw Random Winner for Giveaway
  const handleDrawWinner = async (game: Game) => {
    if (!window.confirm(`Are you sure you want to draw a random winner for "${game.title}"?`)) {
      return;
    }

    setDrawingWinnerForId(game.id);
    try {
      const res = await axios.post(`${API_URL}/giveaways/admin/${game.id}/draw-winner`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.winner) {
        setDrawnWinnerModal({
          gameTitle: game.title,
          winner: res.data.winner
        });
        toast.success(`Winner chosen: ${res.data.winner.username}! 🎉`, { duration: 6000 });
        fetchGames();
        if (participantsModalGame?.id === game.id) {
          openGiveawayParticipants(game);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to draw winner');
    } finally {
      setDrawingWinnerForId(null);
    }
  };

  const resetForm = (mode: 'game' | 'giveaway' | 'bundle' = 'game') => {
    setIsEditing(false);
    setCurrentId(null);
    initialImageStateRef.current = {
      coverImage: '',
      tagImage: '',
      screenshots: []
    };
    setFormData({
      title: '',
      developer: '',
      rating: 0,
      genre: mode === 'bundle' ? 'Bundle' : '',
      price: 0,
      steamPrice: '',
      internalCost: '',
      discount: 0,
      coverImage: '',
      releaseDate: '',
      platforms: '',
      isRentable: false,
      outOfStock: false,
      isGiveaway: mode === 'giveaway',
      giveawayRules: '',
      isBundle: mode === 'bundle',
      bundleGames: '',
      description: '',
      slug: '',
      rentPrice: '',
      rentDurationDays: 7,
      rentRules: '',
      minRequirements: '',
      recRequirements: '',
      trailerUrl: '',
      screenshots: '',
      tagImage: '',
      steamAppId: '',
      creatorAccess: false,
      isPublished: false
    });

    setImageFile(null);
    setTagImageFile(null);
    setScreenshotFiles([]);
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    if (tagImageInputRef.current) tagImageInputRef.current.value = '';
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';

    setGiveawayCategory('Game Bundle');
    setGiveawayWorth('');
    setGiveawayEndDate('');
    setGiveawayWinnersCount(1);
    setGiveawayRequireDiscord(true);
    setGiveawayDiscordUrl('https://discord.gg/WKWqt7DGAd');
    setGiveawayRequireInstagram(true);
    setGiveawayInstagramUrl('https://www.instagram.com/valqore.pro/');
  };

  const handleAutofill = async () => {
    if (!formData.title) {
      toast.error('Please enter a game title first!');
      return;
    }
    
    setIsAutofilling(true);
    try {
      const res = await axios.get(`${API_URL}/igdb/search?q=${encodeURIComponent(formData.title)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const gameData = res.data;
      setFormData(prev => ({
        ...prev,
        developer: gameData.developer || prev.developer,
        releaseDate: gameData.releaseDate || prev.releaseDate,
        genre: gameData.genre || prev.genre,
        platforms: gameData.platforms || prev.platforms,
        coverImage: gameData.coverImage || prev.coverImage,
        rating: gameData.rating || prev.rating,
      }));
      toast.success('Successfully auto-filled from IGDB!');
    } catch (error) {
      toast.error('Could not find game on IGDB. You may need to fill it manually.');
    } finally {
      setIsAutofilling(false);
    }
  };

  // if (loading) return <div className="min-h-screen pt-32 text-center text-white">Loading...</div>;

  const totalGames = games.filter(g => !g.isGiveaway && !g.isBundle).length;
  const totalBundles = games.filter(g => g.isBundle).length;
  const totalGiveaways = games.filter(g => g.isGiveaway).length;
  const outOfStockCount = games.filter(g => !g.isGiveaway && g.outOfStock).length;

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 sm:p-8 pt-24">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold">Admin Dashboard</h2>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div data-lenis-prevent="true" className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              {/* Sticky Top Header with Title, Save Button & Close Button */}
              <div className="sticky -top-6 -mx-6 px-6 pt-2 pb-4 mb-5 bg-background/95 backdrop-blur-md border-b border-white/10 z-30 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary truncate font-heading flex items-center gap-3">
                    {isEditing 
                      ? (formData.isBundle ? 'Edit Bundle' : formData.isGiveaway ? 'Edit Giveaway' : 'Edit Game') 
                      : (formData.isBundle ? 'Add New Bundle' : formData.isGiveaway ? 'Add New Giveaway' : 'Add New Game')}
                    {isEditing && (
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${formData.isPublished ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                        {formData.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {formData.title ? formData.title : 'Configure details and save changes'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Save Option at Top */}
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        name="action"
                        value="save"
                        form="admin-game-form"
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                          formData.isBundle 
                            ? 'bg-[#A855F7] hover:bg-[#A855F7]/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]' 
                            : formData.isGiveaway
                            ? 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                            : 'bg-primary hover:bg-primary/90 text-background shadow-[0_0_15px_rgba(220,248,54,0.35)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                        <span>{formData.isBundle ? 'Save Bundle' : formData.isGiveaway ? 'Save Giveaway' : 'Save Changes'}</span>
                      </button>
                      
                      {!formData.isPublished ? (
                        <button
                          type="submit"
                          name="action"
                          value="publish"
                          form="admin-game-form"
                          disabled={isSaving}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                          <span>Publish</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="action"
                          value="unpublish"
                          form="admin-game-form"
                          disabled={isSaving}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 border border-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={16} strokeWidth={2.5} />
                          <span>Unpublish</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="submit"
                      name="action"
                      value="save"
                      form="admin-game-form"
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                        formData.isBundle 
                          ? 'bg-[#A855F7] hover:bg-[#A855F7]/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]' 
                          : formData.isGiveaway
                          ? 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                          : 'bg-primary hover:bg-primary/90 text-background shadow-[0_0_15px_rgba(220,248,54,0.35)]'
                      }`}
                    >
                      <Check size={16} strokeWidth={2.5} />
                      <span>Save as Draft</span>
                    </button>
                  )}

                  {/* Close Modal Button */}
                  <button 
                    type="button"
                    onClick={() => { resetForm(); setIsModalOpen(false); }}
                    className="text-text-secondary hover:text-white transition-colors bg-cards hover:bg-white/10 p-2.5 rounded-xl border border-white/5 cursor-pointer"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form id="admin-game-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Basic Information / Dedicated Giveaway Information */}
                {formData.isGiveaway ? (
                  <div className="p-5 border border-[#00F0FF]/30 rounded-xl bg-cards/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex flex-col gap-4">
                    <h3 className="font-bold text-[#00F0FF] flex items-center gap-2 text-base">
                      <Gift size={18} /> Giveaway Prize Information
                    </h3>

                    {/* Prize Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                        Giveaway / Prize Title *
                      </label>
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 1 Month Discord Nitro, Xbox Game Pass 3 Months, Cyberpunk 2077 Key" 
                        required 
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none" 
                      />
                    </div>

                    {/* Category & Worth */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                          Prize Category
                        </label>
                        <select
                          value={giveawayCategory}
                          onChange={(e) => setGiveawayCategory(e.target.value)}
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none cursor-pointer"
                        >
                          <option value="Game Bundle">Game Bundle</option>
                          <option value="Single Game">Single Game</option>
                          <option value="Subscription">Subscription</option>
                          <option value="Other Reward">Other Reward</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                          Estimated Worth / Value (₹)
                        </label>
                        <input 
                          type="number" 
                          value={giveawayWorth} 
                          onChange={(e) => setGiveawayWorth(e.target.value)} 
                          placeholder="e.g. 499 (0 for Free/Unspecified)" 
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none" 
                        />
                      </div>
                    </div>

                    {/* End Date & Winners Count */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                          Giveaway End Date / Draw Date
                        </label>
                        <input 
                          type="datetime-local" 
                          value={giveawayEndDate} 
                          onChange={(e) => setGiveawayEndDate(e.target.value)} 
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none [&::-webkit-calendar-picker-indicator]:invert cursor-pointer" 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                          Number of Winners
                        </label>
                        <input 
                          type="number" 
                          min="1"
                          max="100"
                          value={giveawayWinnersCount} 
                          onChange={(e) => setGiveawayWinnersCount(parseInt(e.target.value, 10) || 1)} 
                          placeholder="e.g. 1" 
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none" 
                        />
                      </div>
                    </div>

                    {/* Social Tasks Configuration - Instagram Only */}
                    <div className="p-4 rounded-xl border border-pink-500/30 bg-black/40 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                          <FaInstagram size={14} /> Instagram Follow & 4-Digit DM Verification
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Participants must follow this Instagram profile and DM the generated 4-digit code to get approved by admin:
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="flex items-center gap-2 select-none shrink-0 min-w-[190px]">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <FaInstagram size={14} className="text-pink-500" /> Instagram Profile Link:
                          </span>
                        </label>
                        <input 
                          type="url"
                          value={giveawayInstagramUrl}
                          onChange={(e) => setGiveawayInstagramUrl(e.target.value)}
                          placeholder="https://www.instagram.com/valqore.pro/"
                          className="flex-1 bg-cards border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-pink-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Prize Description & Rules */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                        Prize Details, Description & Rules
                      </label>
                      <textarea 
                        name="giveawayRules" 
                        value={formData.giveawayRules} 
                        onChange={handleInputChange} 
                        placeholder="Explain how the prize will be delivered, subscription benefits, and any terms..." 
                        rows={5}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none resize-none" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border border-white/10 rounded-xl bg-cards/30">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full"></span>Basic Information</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-3">
                        <div className="flex-1 flex flex-col gap-1.5">
                          <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Game Title</label>
                          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter title" required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-transparent uppercase tracking-wider font-bold select-none">Action</label>
                          <button 
                            type="button" 
                            onClick={handleAutofill} 
                            disabled={isAutofilling}
                            className="bg-primary/20 text-primary hover:bg-primary/30 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors border border-primary/50 disabled:opacity-50 h-[50px]"
                            title="Auto-fill details from IGDB"
                          >
                            {isAutofilling ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            <span className="hidden sm:inline font-bold">Autofill</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Developer</label>
                          <input type="text" name="developer" value={formData.developer} onChange={handleInputChange} placeholder="E.g. Rockstar Games" required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Genre</label>
                          <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} placeholder="E.g. Action, RPG" required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Release Date</label>
                          <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none [&::-webkit-calendar-picker-indicator]:invert" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Platforms</label>
                          <input type="text" name="platforms" value={formData.platforms} onChange={handleInputChange} placeholder="E.g. PC, PS5" required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-[#00F0FF] uppercase tracking-wider font-bold ml-1 flex items-center gap-1"><Gamepad2 size={12}/> Steam Mon App ID (Optional)</label>
                        <input type="text" name="steamAppId" value={formData.steamAppId} onChange={handleInputChange} placeholder="E.g. 1196590" className="bg-cards border border-[#00F0FF]/30 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">URL Slug (Optional)</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="e.g. call-of-duty-modern-warfare-4 (auto-generated if left empty)" className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                      </div>

                    </div>
                  </div>
                )}

                {/* Bundle Configuration: Included Games & Description */}
                {formData.isBundle && (
                  <div className="flex flex-col gap-6">
                    {/* 1. Included Games Section with All Available Website Posters */}
                    <div className="p-5 border border-[#A855F7]/40 rounded-xl bg-cards/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <Package className="text-[#A855F7]" size={18} />
                            <span>Included Games in this Bundle</span>
                          </h3>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Click game posters below to select all games from the website included in this bundle pack.
                          </p>
                        </div>
                        {(() => {
                          const selectedList = formData.bundleGames 
                            ? formData.bundleGames.split(/[,+]/).map(s => s.trim()).filter(Boolean)
                            : [];
                          return (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/30 text-[#A855F7]">
                              {selectedList.length} Selected
                            </span>
                          );
                        })()}
                      </div>

                      {/* Selected Games Badges */}
                      {(() => {
                        const selectedList = formData.bundleGames 
                          ? formData.bundleGames.split(/[,+]/).map(s => s.trim()).filter(Boolean)
                          : [];
                        if (selectedList.length === 0) return null;

                        return (
                          <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                              Currently Selected Games:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {selectedList.map((item, idx) => {
                                const matched = games.find(g => g.id === item || g.title.toLowerCase() === item.toLowerCase());
                                return (
                                  <div 
                                    key={idx}
                                    className="inline-flex items-center gap-2 bg-[#A855F7]/20 border border-[#A855F7]/40 text-white rounded-lg pl-1.5 pr-2.5 py-1 text-xs font-bold shadow-md"
                                  >
                                    {matched?.coverImage ? (
                                      <img 
                                        src={getImageUrl(matched.coverImage)} 
                                        alt={item} 
                                        className="w-5 h-6 object-cover rounded"
                                      />
                                    ) : (
                                      <Gamepad2 size={13} className="text-[#A855F7]" />
                                    )}
                                    <span>{matched?.title || item}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = selectedList.filter((_, i) => i !== idx);
                                        setFormData(prev => ({ ...prev, bundleGames: updated.join(', ') }));
                                      }}
                                      className="text-white/60 hover:text-red-400 p-0.5 rounded cursor-pointer ml-0.5"
                                      title="Remove"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Search Games Input */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search all available games on website..."
                          value={bundleSearchTerm}
                          onChange={(e) => setBundleSearchTerm(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#A855F7] outline-none"
                        />
                      </div>

                      {/* Game Posters Grid */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                          All Available Games on Website (Click to Select / Deselect):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-2.5 bg-black/40 rounded-xl border border-white/5 no-scrollbar">
                          {games
                            .filter(g => !g.isBundle && g.id !== currentId)
                            .filter(g => 
                              !bundleSearchTerm.trim() || 
                              g.title.toLowerCase().includes(bundleSearchTerm.toLowerCase()) ||
                              g.developer.toLowerCase().includes(bundleSearchTerm.toLowerCase()) ||
                              g.genre.toLowerCase().includes(bundleSearchTerm.toLowerCase())
                            )
                            .map((gameItem) => {
                              const selectedList = formData.bundleGames 
                                ? formData.bundleGames.split(/[,+]/).map(s => s.trim()).filter(Boolean)
                                : [];
                              const isSelected = selectedList.some(
                                item => item.toLowerCase() === gameItem.title.toLowerCase() || item === gameItem.id
                              );

                              return (
                                <div
                                  key={gameItem.id}
                                  onClick={() => {
                                    let updated: string[];
                                    if (isSelected) {
                                      updated = selectedList.filter(
                                        item => item.toLowerCase() !== gameItem.title.toLowerCase() && item !== gameItem.id
                                      );
                                    } else {
                                      updated = [...selectedList, gameItem.title];
                                    }
                                    setFormData(prev => ({
                                      ...prev,
                                      bundleGames: updated.join(', ')
                                    }));
                                  }}
                                  className={`group relative flex flex-col rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 select-none ${
                                    isSelected
                                      ? 'border-[#A855F7] bg-[#A855F7]/15 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[0.98]'
                                      : 'border-white/10 hover:border-white/30 bg-cards/60 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                                  }`}
                                >
                                  {/* Poster Image */}
                                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                                    <img
                                      src={getImageUrl(gameItem.coverImage) || '/images/hero-artwork.png'}
                                      alt={gameItem.title}
                                      loading="lazy"
                                      className="w-full h-full object-cover"
                                    />
                                    {isSelected ? (
                                      <div className="absolute inset-0 bg-[#A855F7]/35 flex items-center justify-center">
                                        <div className="w-7 h-7 rounded-full bg-[#A855F7] text-white flex items-center justify-center shadow-lg border border-white/30">
                                          <Check size={16} strokeWidth={3} />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-full p-1 text-white">
                                        <Plus size={12} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-1.5 bg-black/90 flex flex-col">
                                    <span className="text-[11px] font-bold text-white truncate group-hover:text-[#A855F7] transition-colors">
                                      {gameItem.title}
                                    </span>
                                    <span className="text-[9px] text-text-secondary truncate">
                                      {formatPrice(gameItem.price)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Manual text input fallback */}
                      <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                        <label className="text-[11px] text-text-secondary font-bold">
                          Included Games Text (Auto-updates or type custom names):
                        </label>
                        <input
                          type="text"
                          name="bundleGames"
                          value={formData.bundleGames}
                          onChange={handleInputChange}
                          placeholder="E.g. Grand Theft Auto V, Red Dead Redemption 2"
                          className="w-full bg-cards border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#A855F7] outline-none"
                        />
                      </div>
                    </div>

                    {/* 2. Bundle Description Section */}
                    <div className="p-5 border border-[#A855F7]/40 rounded-xl bg-cards/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                          <FileText className="text-[#A855F7]" size={18} />
                          <span>Bundle Description</span>
                        </h3>
                        <span className="text-[11px] text-text-secondary uppercase tracking-wider font-bold">
                          Rich Overview
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Write a detailed description for this bundle pack, storyline, features, editions, DLCs, and activation instructions.
                      </p>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Write a detailed description for this bundle pack, storyline, features, editions, DLCs, and activation instructions..."
                        className="w-full bg-cards border border-white/10 rounded-xl p-3.5 text-white focus:border-[#A855F7] outline-none text-sm resize-y leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Pricing & Rating */}
                {!formData.isGiveaway && (
                  <div className="p-5 border border-white/10 rounded-xl bg-cards/30">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full"></span>Pricing & Rating</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Price (₹)</label>
                      <input type="number" step="0.1" id="game-price-input" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">
                        Steam Price (₹)
                        {formData.isBundle && <span className="ml-2 text-[9px] text-[#E6FF00] lowercase font-normal">(auto-calculated)</span>}
                      </label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="steamPrice" 
                        value={formData.steamPrice} 
                        onChange={handleInputChange} 
                        placeholder="0.00" 
                        className={`bg-cards border border-white/10 rounded-lg p-3 text-white outline-none ${formData.isBundle ? 'opacity-70 cursor-not-allowed' : 'focus:border-primary'}`} 
                        readOnly={formData.isBundle} 
                        title={formData.isBundle ? "Automatically calculated from included games" : ""} 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Our Cost (₹)</label>
                      <input type="number" step="0.1" name="internalCost" value={formData.internalCost} onChange={handleInputChange} placeholder="0.00" className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Rating (0-5)</label>
                      <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} placeholder="E.g. 4.5" required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                  </div>
                  </div>
                )}

                {/* Cover & Branding */}
                <div className="p-5 border border-white/10 rounded-xl bg-cards/30">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full"></span>Cover & Branding</h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-white">Cover Image</label>
                        {imageFile && (
                          <button type="button" onClick={clearCoverImage} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                            <X size={12} /> Clear Selection
                          </button>
                        )}
                      </div>
                      <input type="file" accept="image/*" ref={coverImageInputRef} onChange={handleFileChange} className="bg-cards border border-white/10 rounded-lg p-2 text-text-secondary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                      <span className="text-xs text-text-secondary font-bold">Or use URL:</span>
                      <div className="flex gap-4 items-start">
                        <input type="text" name="coverImage" value={formData.coverImage} onChange={handleInputChange} placeholder="https://..." className="flex-1 bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none text-sm" />
                        {formData.coverImage && (
                          <div className="relative group w-16 h-20 shrink-0">
                            <img src={getImageUrl(formData.coverImage)} alt="Cover Preview" className="w-full h-full object-cover rounded-lg border border-white/10" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'; }} />
                            <button 
                              type="button"
                              onClick={() => setFormData({ ...formData, coverImage: '' })}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {!formData.isGiveaway && (
                      <>
                        <div className="w-full h-px bg-white/10"></div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-white">Platform Badge</label>
                          <div className="flex gap-4 items-start">
                            <select 
                              name="tagImage" 
                              value={formData.tagImage} 
                              onChange={handleInputChange} 
                              className="flex-1 bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none text-sm cursor-pointer"
                            >
                              <option value="">None</option>
                              <option value="/badges/STEAM.png">Steam</option>
                              <option value="/badges/Ubsoft.png">Ubisoft</option>
                              <option value="/badges/ROCKSTAR.png">Rockstar Games</option>
                              <option value="/badges/EPIC_Game.png">Epic Games</option>
                            </select>
                            {formData.tagImage && (
                              <div className="relative group w-16 h-16 shrink-0 bg-black/50 rounded-lg flex items-center justify-center p-2 border border-white/10">
                                <img src={getImageUrl(formData.tagImage)} alt="Badge Preview" className="max-w-full max-h-full object-contain drop-shadow-lg" />
                                <button 
                                  type="button"
                                  onClick={() => setFormData({ ...formData, tagImage: '' })}
                                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  title="Remove badge"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              {/* Rental Options */}
              {!formData.isGiveaway && (
                <div className="mt-4 p-4 border border-white/10 rounded-xl bg-cards/30">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative flex items-center justify-center w-6 h-6 rounded bg-background border border-white/20">
                      <input 
                        type="checkbox" 
                        name="isRentable" 
                        checked={formData.isRentable} 
                        onChange={handleInputChange} 
                        className="absolute opacity-0 w-full h-full cursor-pointer"
                      />
                      {formData.isRentable && <div className="w-3 h-3 bg-primary rounded-sm"></div>}
                    </div>
                    <span className="font-bold text-white">This game is rentable</span>
                  </label>

                  {formData.isRentable && (
                    <div className="mt-4 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="flex gap-4">
                        <input 
                          type="number" 
                          step="0.1" 
                          name="rentPrice" 
                          value={formData.rentPrice} 
                          onChange={handleInputChange} 
                          placeholder="Rent Price (₹)" 
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none w-full" 
                        />
                        <input 
                          type="number" 
                          step="1" 
                          name="rentDurationDays" 
                          value={formData.rentDurationDays} 
                          onChange={handleInputChange} 
                          placeholder="Duration (Days)" 
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none w-full" 
                        />
                      </div>
                      <textarea 
                        name="rentRules" 
                        value={formData.rentRules} 
                        onChange={handleInputChange} 
                        placeholder="Rental Rules / Details (Optional)" 
                        rows={2}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none resize-none" 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Management & Creator Access */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-white/10 rounded-xl bg-cards/30">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative flex items-center justify-center w-6 h-6 rounded bg-background border border-white/20">
                      <input 
                        type="checkbox" 
                        name="outOfStock" 
                        checked={formData.outOfStock} 
                        onChange={handleInputChange} 
                        className="absolute opacity-0 w-full h-full cursor-pointer"
                      />
                      {formData.outOfStock && <div className="w-3 h-3 bg-red-500 rounded-sm"></div>}
                    </div>
                    <span className="font-bold text-red-400">
                      {formData.isGiveaway ? 'Mark as Concluded / Ended' : 'Mark as Out of Stock'}
                    </span>
                  </label>
                </div>

                {!formData.isGiveaway && (
                  <div className="p-4 border border-primary/20 rounded-xl bg-cards/30">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative flex items-center justify-center w-6 h-6 rounded bg-background border border-primary/40">
                        <input 
                          type="checkbox" 
                          name="creatorAccess" 
                          checked={formData.creatorAccess} 
                          onChange={handleInputChange} 
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        {formData.creatorAccess && <div className="w-3 h-3 bg-primary rounded-sm shadow-[0_0_8px_rgba(220,248,54,0.8)]"></div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          Creator Access
                        </span>
                        <span className="text-[11px] text-text-secondary">Enable creator program access for this game</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>


              {/* System Requirements */}
              {!formData.isGiveaway && !formData.isBundle && (
                <div className="mt-4 p-4 border border-white/10 rounded-xl bg-cards/30">
                  <h3 className="font-bold text-white mb-4">System Requirements (Optional)</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-text-secondary">Minimum Requirements</label>
                      <textarea 
                        name="minRequirements" 
                        value={formData.minRequirements} 
                        onChange={handleInputChange} 
                        placeholder="E.g. OS: Windows 10, Processor: i5, Memory: 8GB RAM, Graphics: GTX 960" 
                        rows={3}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none resize-none" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-text-secondary">Recommended Requirements</label>
                      <textarea 
                        name="recRequirements" 
                        value={formData.recRequirements} 
                        onChange={handleInputChange} 
                        placeholder="E.g. OS: Windows 10/11, Processor: i7, Memory: 16GB RAM, Graphics: RTX 2070" 
                        rows={3}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none resize-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Game Media / Multi Game Posters */}
              {!formData.isGiveaway && (
                <div className="mt-4 p-4 border border-white/10 rounded-xl bg-cards/30">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  {formData.isBundle ? (
                    <>
                      <Package size={18} className="text-[#A855F7]" />
                      <span>Multi Game Posters / Artwork</span>
                    </>
                  ) : (
                    <span>Game Media (Epic Layout)</span>
                  )}
                </h3>
                <div className="flex flex-col gap-4">
                  {!formData.isBundle && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-text-secondary">YouTube Trailer URL</label>
                      <input 
                        type="text" 
                        name="trailerUrl" 
                        value={formData.trailerUrl} 
                        onChange={handleInputChange} 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none w-full" 
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-white">
                        {formData.isBundle ? 'Multi Game Posters (Upload Individual Game Posters)' : 'Screenshots (Upload Multiple)'}
                      </label>
                      {screenshotFiles.length > 0 && (
                        <button type="button" onClick={clearScreenshots} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                          <X size={12} /> Clear ({screenshotFiles.length})
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      ref={screenshotsInputRef}
                      onChange={handleScreenshotFilesChange} 
                      className="bg-cards border border-white/10 rounded-lg p-2 text-white" 
                    />
                    {/* Visual display of current URLs with Drag & Drop */}
                    {formData.screenshots && formData.screenshots.split(',').filter(s => s.trim()).length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <div className="flex items-center justify-between text-[11px] text-text-secondary font-bold px-1">
                          <span className="flex items-center gap-1">
                            <ArrowUpDown size={12} className="text-primary" />
                            Drag screenshots to rearrange gallery order
                          </span>
                          <span>{formData.screenshots.split(',').filter(s => s.trim()).length} images</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {formData.screenshots.split(',').map(s => s.trim()).filter(Boolean).map((url, idx) => {
                            const isDragging = draggedScreenshotIndex === idx;
                            const isOver = dragOverScreenshotIndex === idx;
                            const isDroppingLeft = isOver && draggedScreenshotIndex !== null && draggedScreenshotIndex > idx;
                            const isDroppingRight = isOver && draggedScreenshotIndex !== null && draggedScreenshotIndex < idx;

                            return (
                              <div key={idx} className="relative transition-all duration-200">
                                {/* Left Drop Indicator Line */}
                                {isDroppingLeft && (
                                  <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_12px_rgba(220,248,54,1)] z-30 animate-pulse"></div>
                                )}

                                <div 
                                  draggable
                                  onDragStart={() => handleScreenshotDragStart(idx)}
                                  onDragOver={(e) => handleScreenshotDragOver(e, idx)}
                                  onDragEnd={handleScreenshotDragEnd}
                                  onDrop={() => handleScreenshotDrop(idx)}
                                  className={`relative group rounded-xl overflow-hidden border transition-all duration-300 shadow-md cursor-grab active:cursor-grabbing select-none ${
                                    isDragging 
                                      ? 'opacity-25 scale-90 border-dashed border-primary/50 bg-primary/10' 
                                      : isOver 
                                      ? 'border-primary shadow-[0_0_20px_rgba(220,248,54,0.4)] scale-105' 
                                      : 'border-white/10 hover:border-primary/40'
                                  }`}
                                >
                                  <img 
                                    src={getThumbnailUrl(url)} 
                                    alt={`Screenshot ${idx + 1}`} 
                                    className="w-full h-24 object-cover" 
                                    loading="lazy"
                                  />

                                  {/* Position badge */}
                                  <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white/90 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                    <GripVertical size={10} className="text-primary" />
                                    <span>#{idx + 1}</span>
                                  </div>

                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newUrls = formData.screenshots.split(',').map(s => s.trim()).filter(Boolean).filter((_, i) => i !== idx);
                                      setFormData({ ...formData, screenshots: newUrls.join(',') });
                                    }}
                                    className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                                    title="Remove image"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>

                                {/* Right Drop Indicator Line */}
                                {isDroppingRight && (
                                  <div className="absolute -right-1.5 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_12px_rgba(220,248,54,1)] z-30 animate-pulse"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    
                    <span className="text-xs text-text-secondary mt-2">Or add image URL (can be comma-separated):</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Paste URL(s) here..." 
                        className="bg-cards border border-white/10 rounded-lg p-2 text-white focus:border-primary outline-none flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const current = formData.screenshots ? formData.screenshots.split(',').map(s => s.trim()).filter(Boolean) : [];
                              const newUrls = val.split(',').map(s => s.trim()).filter(Boolean);
                              setFormData({ ...formData, screenshots: [...current, ...newUrls].join(',') });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const val = input.value.trim();
                          if (val) {
                            const current = formData.screenshots ? formData.screenshots.split(',').map(s => s.trim()).filter(Boolean) : [];
                            const newUrls = val.split(',').map(s => s.trim()).filter(Boolean);
                            setFormData({ ...formData, screenshots: [...current, ...newUrls].join(',') });
                            input.value = '';
                          }
                        }}
                        className="bg-primary/20 text-primary px-3 rounded-lg hover:bg-primary/30 transition-colors text-sm font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                <button type="submit" disabled={isSaving} className={`flex-1 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${formData.isBundle ? 'bg-[#A855F7] text-white hover:bg-[#A855F7]/90' : formData.isGiveaway ? 'bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 font-black shadow-[0_0_15px_rgba(0,240,255,0.35)]' : 'bg-primary text-background hover:bg-primary/90'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  <span>{isEditing ? (formData.isBundle ? 'Update Bundle' : formData.isGiveaway ? 'Update Giveaway' : 'Update Game') : (formData.isBundle ? 'Add Bundle' : formData.isGiveaway ? 'Add Giveaway' : 'Add Game')}</span>
                </button>
                <button type="button" disabled={isSaving} onClick={() => { resetForm(); setIsModalOpen(false); }} className="bg-cards border border-white/10 text-white font-bold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">Total Games</p>
                  <h3 className="text-4xl font-black text-white">{totalGames}</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
            
            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#A855F7]/30 transition-colors shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/10 rounded-full blur-3xl group-hover:bg-[#A855F7]/20 transition-all duration-500"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">Bundles</p>
                  <h3 className="text-4xl font-black text-white">{totalBundles}</h3>
                </div>
                <div className="p-3 bg-[#A855F7]/10 rounded-xl border border-[#A855F7]/20">
                  <Package className="w-6 h-6 text-[#A855F7]" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#00F0FF]/30 transition-colors shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 rounded-full blur-3xl group-hover:bg-[#00F0FF]/20 transition-all duration-500"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">Giveaways</p>
                  <h3 className="text-4xl font-black text-white">{totalGiveaways}</h3>
                </div>
                <div className="p-3 bg-[#00F0FF]/10 rounded-xl border border-[#00F0FF]/20">
                  <Gift className="w-6 h-6 text-[#00F0FF]" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-500/30 transition-colors shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">Out of Stock</p>
                  <h3 className="text-4xl font-black text-white">{outOfStockCount}</h3>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tab Navigation & Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-white/[0.02] border border-white/5 p-2 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl overflow-x-auto w-full lg:w-max [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button 
                onClick={() => setActiveTab('games')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'games' ? 'bg-primary text-background shadow-[0_0_20px_rgba(var(--primary),0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <Gamepad2 size={20} /> Games
              </button>
              <button 
                onClick={() => setActiveTab('bundles')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'bundles' ? 'bg-[#A855F7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <Package size={20} /> Bundles
              </button>
              <button 
                onClick={() => setActiveTab('giveaways')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'giveaways' ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <Gift size={20} /> Giveaways
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'coupons' ? 'bg-[#FF00F0] text-white shadow-[0_0_20px_rgba(255,0,240,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <Ticket size={20} /> Coupons
              </button>
              <button 
                onClick={() => setActiveTab('posters')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'posters' ? 'bg-[#00FFAA] text-black shadow-[0_0_20px_rgba(0,255,170,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <ImageIcon size={20} /> Posters
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <ShoppingCart size={20} /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'payments' ? 'bg-emerald-500 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <CreditCard size={20} /> Payments
              </button>
              <button 
                onClick={() => setActiveTab('creator_requests')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'creator_requests' ? 'bg-[#DCF836] text-black shadow-[0_0_20px_rgba(220,248,54,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <Users size={20} /> Creator Requests
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${activeTab === 'users' ? 'bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                <UserCheck size={20} /> Users
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto px-2 lg:px-4 flex-shrink-0">
              <div className="relative w-full sm:w-64 lg:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (activeTab === 'orders') fetchAdminOrders(searchQuery);
                      if (activeTab === 'payments') fetchAdminPayments(searchQuery, paymentFilter);
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-primary/50 focus:bg-black/60 outline-none transition-all duration-300"
                />
              </div>

              {/* Status Filter for Games tab */}
              {activeTab === 'games' && (
                <div className="w-full sm:w-auto flex items-center">
                  {/* Mobile Dropdown */}
                  <div className="relative w-full sm:hidden">
                    <select
                      id="admin-game-status-filter-select"
                      aria-label="Filter games by status"
                      value={gameStatusFilter}
                      onChange={(e) => handleStatusFilterChange(e.target.value as GameStatusFilter)}
                      className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3.5 text-sm font-semibold text-white focus:border-primary/50 focus:bg-black/60 outline-none transition-all cursor-pointer"
                    >
                      <option value="all" className="bg-[#121216] text-white">All Games ({statusCounts.all})</option>
                      <option value="published" className="bg-[#121216] text-white">Published ({statusCounts.published})</option>
                      <option value="draft" className="bg-[#121216] text-white">Draft ({statusCounts.draft})</option>
                      <option value="out_of_stock" className="bg-[#121216] text-white">Out of Stock ({statusCounts.out_of_stock})</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                  </div>

                  {/* Desktop / Tablet Segmented Buttons */}
                  <div
                    role="group"
                    aria-label="Filter games by status"
                    className="hidden sm:inline-flex items-center p-1 bg-black/40 border border-white/10 rounded-xl gap-1 text-xs font-semibold"
                  >
                    <button
                      type="button"
                      id="filter-all-games"
                      onClick={() => handleStatusFilterChange('all')}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        gameStatusFilter === 'all'
                          ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(220,248,54,0.35)]'
                          : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>All Games</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        gameStatusFilter === 'all' ? 'bg-black/20 text-background' : 'bg-white/10 text-white/70'
                      }`}>
                        {statusCounts.all}
                      </span>
                    </button>

                    <button
                      type="button"
                      id="filter-published-games"
                      onClick={() => handleStatusFilterChange('published')}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        gameStatusFilter === 'published'
                          ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(220,248,54,0.35)]'
                          : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>Published</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        gameStatusFilter === 'published' ? 'bg-black/20 text-background' : 'bg-white/10 text-white/70'
                      }`}>
                        {statusCounts.published}
                      </span>
                    </button>

                    <button
                      type="button"
                      id="filter-draft-games"
                      onClick={() => handleStatusFilterChange('draft')}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        gameStatusFilter === 'draft'
                          ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(220,248,54,0.35)]'
                          : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>Draft</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        gameStatusFilter === 'draft' ? 'bg-black/20 text-background' : 'bg-white/10 text-white/70'
                      }`}>
                        {statusCounts.draft}
                      </span>
                    </button>

                    <button
                      type="button"
                      id="filter-out-of-stock-games"
                      onClick={() => handleStatusFilterChange('out_of_stock')}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        gameStatusFilter === 'out_of_stock'
                          ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(220,248,54,0.35)]'
                          : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>Out of Stock</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        gameStatusFilter === 'out_of_stock' ? 'bg-black/20 text-background' : 'bg-white/10 text-white/70'
                      }`}>
                        {statusCounts.out_of_stock}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'orders' ? (
                <button
                  onClick={() => fetchAdminOrders(searchQuery)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30 whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              ) : activeTab === 'payments' ? (
                <button
                  onClick={() => fetchAdminPayments(searchQuery, paymentFilter)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              ) : (activeTab === 'games' || activeTab === 'bundles' || activeTab === 'giveaways') && (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Hidden file input for Import */}
                  <input 
                    type="file" 
                    accept=".json" 
                    ref={backupFileInputRef}
                    onChange={handleBackupFileUpload}
                    className="hidden"
                  />

                  {/* Export Backup Button */}
                  <button
                    onClick={exportGamesBackup}
                    type="button"
                    title="Download complete JSON backup of all games"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 whitespace-nowrap cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4 text-primary" />
                    <span>Export</span>
                  </button>

                  {/* Import Backup Button */}
                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    type="button"
                    title="Upload JSON file to restore games"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 whitespace-nowrap cursor-pointer text-sm"
                  >
                    <Upload className="w-4 h-4 text-[#00F0FF]" />
                    <span>Import</span>
                  </button>

                  {/* Add Game / Bundle / Giveaway Button */}
                  {activeTab === 'giveaways' ? (
                    <button
                      onClick={() => {
                        resetForm('giveaway');
                        setIsModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Giveaway</span>
                    </button>
                  ) : activeTab === 'bundles' ? (
                    <button
                      onClick={() => {
                        resetForm('bundle');
                        setIsModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer bg-[#A855F7]/10 text-[#A855F7] hover:bg-[#A855F7] hover:text-white border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Bundle</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          resetForm('game');
                          setIsModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-background border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Game</span>
                      </button>
                      <button
                        onClick={() => {
                          resetForm('bundle');
                          setIsModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold py-3.5 px-5 rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer bg-[#A855F7]/10 text-[#A855F7] hover:bg-[#A855F7] hover:text-white border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-sm"
                      >
                        <Package className="w-4 h-4" />
                        <span>Add Bundle</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* List Section */}
          <div className="w-full">
            <div className="flex flex-col gap-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="glass p-4 rounded-2xl border border-white/5 flex gap-6 items-center animate-pulse bg-white/[0.02]">
                    <div className="w-16 h-20 bg-white/5 rounded-xl shadow-inner"></div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="h-5 bg-white/10 rounded-md w-1/4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/6"></div>
                    </div>
                  </div>
                ))
              ) : activeTab === 'posters' ? (
                <div className="flex flex-col gap-8">
                  {/* Create Poster Form */}
                  <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white font-heading">Add New Poster</h3>
                        <p className="text-text-secondary text-xs mt-0.5">Upload or link hero artwork posters</p>
                      </div>
                      <button 
                        type="submit" 
                        form="admin-poster-form"
                        className="bg-[#00FFAA] text-black font-bold py-2.5 px-6 rounded-xl hover:bg-[#00FFAA]/90 transition-all shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 cursor-pointer text-sm"
                      >
                        <Check size={16} strokeWidth={2.5} />
                        <span>Save Poster</span>
                      </button>
                    </div>
                    <form id="admin-poster-form" onSubmit={handlePosterSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex flex-col gap-2 w-full flex-1">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Image URL</label>
                        <input 
                          type="text" 
                          value={posterImageUrl} 
                          onChange={(e) => setPosterImageUrl(e.target.value)} 
                          placeholder="https://image1.jpg, https://image2.png (comma separated for multiple)" 
                          required 
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00FFAA] outline-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full sm:w-auto bg-[#00FFAA] text-black font-bold py-3 px-8 rounded-lg hover:bg-[#00FFAA]/90 transition-colors shadow-[0_0_15px_rgba(0,255,170,0.3)] whitespace-nowrap"
                      >
                        Add Poster
                      </button>
                    </form>
                  </div>

                  {/* Active Posters Grid */}
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-white font-heading flex items-center gap-3">
                      <div className="w-2 h-6 bg-[#00FFAA] rounded-full"></div>
                      Active Posters
                    </h3>
                    {posters.length === 0 ? (
                      <div className="py-12 px-8 flex flex-col items-center justify-center text-center glass rounded-2xl border border-dashed border-white/20">
                        <ImageIcon className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Posters Found</h3>
                        <p className="text-text-secondary">Add some posters using the form above.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {posters.map(poster => (
                          <div key={poster.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[3/4] bg-cards/50">
                            <img src={poster.imageUrl} alt="Poster" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => setPosterToDelete(poster.id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
                                title="Delete Poster"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete Confirmation Modal */}
                  {posterToDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                        <p className="text-text-secondary mb-6">Are you sure you want to delete this poster? It will be removed from the homepage immediately.</p>
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setPosterToDelete(null)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                          <button onClick={confirmDeletePoster} className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">Delete Poster</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'games' || activeTab === 'bundles' || activeTab === 'giveaways' ? (
                <>
                  {(() => {
                    const baseTabFiltered = games.filter(game => {
                      if (activeTab === 'giveaways') return Boolean(game.isGiveaway);
                      if (activeTab === 'bundles') return Boolean(game.isBundle);
                      return !game.isGiveaway && !game.isBundle;
                    });

                    const statusFiltered = activeTab === 'games'
                      ? filterGamesByStatus(baseTabFiltered, gameStatusFilter)
                      : baseTabFiltered;

                    const filtered = statusFiltered.filter(game =>
                      game.title.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      const hasActiveFilter = activeTab === 'games' && (gameStatusFilter !== 'all' || searchQuery.trim().length > 0);
                      const isSearchingOther = activeTab !== 'games' && searchQuery.trim().length > 0;

                      return (
                        <div className="col-span-full py-20 px-8 flex flex-col items-center justify-center text-center glass rounded-2xl border border-dashed border-white/20 bg-white/[0.01]">
                          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                            {hasActiveFilter || isSearchingOther ? (
                              <Filter className="w-10 h-10 text-white/40 relative z-10" />
                            ) : (
                              <Package className="w-10 h-10 text-white/40 relative z-10" />
                            )}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 font-heading">
                            {hasActiveFilter
                              ? 'No matching games found'
                              : isSearchingOther
                              ? `No ${activeTab} matching "${searchQuery}"`
                              : `No ${activeTab} found`}
                          </h3>
                          <p className="text-text-secondary max-w-md">
                            {hasActiveFilter
                              ? (gameStatusFilter !== 'all' && searchQuery.trim()
                                  ? `No games found matching "${searchQuery}" with status "${gameStatusFilter === 'out_of_stock' ? 'Out of Stock' : gameStatusFilter}".`
                                  : gameStatusFilter !== 'all'
                                  ? `There are currently no games marked as ${gameStatusFilter === 'out_of_stock' ? 'Out of Stock' : gameStatusFilter}.`
                                  : `No games found matching "${searchQuery}".`)
                              : isSearchingOther
                              ? 'Try adjusting your search query.'
                              : 'Your inventory is looking a little empty. Try adding a new item to get started.'}
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                            {(hasActiveFilter || isSearchingOther) && (
                              <button
                                onClick={() => {
                                  if (activeTab === 'games') handleStatusFilterChange('all');
                                  setSearchQuery('');
                                }}
                                className="font-bold py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                              >
                                <X size={16} /> Reset Filters
                              </button>
                            )}
                            <button
                              onClick={() => {
                                resetForm(activeTab === 'giveaways' ? 'giveaway' : activeTab === 'bundles' ? 'bundle' : 'game');
                                setIsModalOpen(true);
                              }}
                              className="font-bold py-3 px-8 rounded-xl bg-primary text-background hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(220,248,54,0.3)]"
                            >
                              <Plus size={18} /> Add {activeTab === 'bundles' ? 'Bundle' : activeTab === 'giveaways' ? 'Giveaway' : 'Game'}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const allVisibleSelected = filtered.length > 0 && filtered.every(g => selectedGameIds.has(g.id));
                    const someVisibleSelected = filtered.some(g => selectedGameIds.has(g.id));
                    const visibleSelectedCount = filtered.filter(g => selectedGameIds.has(g.id)).length;

                    return (
                      <div ref={gamesListRef} className="flex flex-col gap-3">
                        {/* Windows-style Selection Action Bar */}
                        {selectedGameIds.size > 0 ? (
                          <div className="glass p-3 px-4 rounded-xl border border-primary/40 bg-primary/[0.08] shadow-[0_0_20px_rgba(220,248,54,0.12)] flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                            <div className="flex items-center gap-3">
                              {/* Master Checkbox */}
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={allVisibleSelected}
                                  ref={el => {
                                    if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
                                  }}
                                  onChange={() => {
                                    if (allVisibleSelected) {
                                      const res = handleClearSelection();
                                      setSelectedGameIds(res.selectedIds);
                                      setSelectionAnchorId(res.anchorId);
                                    } else {
                                      const res = handleSelectAll(filtered);
                                      setSelectedGameIds(res.selectedIds);
                                      setSelectionAnchorId(res.anchorId);
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary accent-primary focus:ring-primary/40 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="font-bold text-xs text-white">
                                  {selectedGameIds.size} {selectedGameIds.size === 1 ? 'item' : 'items'} selected
                                  {(searchQuery || (activeTab === 'games' && gameStatusFilter !== 'all')) && visibleSelectedCount !== selectedGameIds.size && (
                                    <span className="text-text-secondary font-normal ml-1">
                                      ({visibleSelectedCount} visible)
                                    </span>
                                  )}
                                </span>
                              </label>

                              <span className="hidden lg:inline-flex text-[11px] text-text-secondary">
                                • Drag grip handle to move group • Shift+Click range • Ctrl+Click toggle
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isReordering && (
                                <span className="flex items-center gap-1.5 text-xs text-primary font-bold mr-2">
                                  <Loader2 size={13} className="animate-spin" /> Saving order...
                                </span>
                              )}
                              {!allVisibleSelected && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = handleSelectAll(filtered);
                                    setSelectedGameIds(res.selectedIds);
                                    setSelectionAnchorId(res.anchorId);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                                >
                                  {searchQuery || (activeTab === 'games' && gameStatusFilter !== 'all')
                                    ? `Select All Visible (${filtered.length})`
                                    : `Select All (${filtered.length})`}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const res = handleClearSelection();
                                  setSelectedGameIds(res.selectedIds);
                                  setSelectionAnchorId(res.anchorId);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/80 hover:text-red-400 border border-white/10 hover:border-red-500/30 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <X size={14} /> Clear Selection
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-text-secondary font-bold px-2 py-1">
                            <span className="flex items-center gap-1.5">
                              <ArrowUpDown size={14} className="text-primary" />
                              Select multiple games (Ctrl/Shift+Click or checkboxes) then drag handle to move group
                            </span>
                            <div className="flex items-center gap-3">
                              {filtered.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = handleSelectAll(filtered);
                                    setSelectedGameIds(res.selectedIds);
                                    setSelectionAnchorId(res.anchorId);
                                  }}
                                  className="text-[11px] text-text-secondary hover:text-primary transition-colors cursor-pointer font-bold"
                                >
                                  Select All ({filtered.length})
                                </button>
                              )}
                              <span>
                                {activeTab === 'games' && gameStatusFilter !== 'all'
                                  ? `${filtered.length} ${gameStatusFilter === 'out_of_stock' ? 'out-of-stock' : gameStatusFilter} ${filtered.length === 1 ? 'game' : 'games'}`
                                  : `${filtered.length} ${activeTab}`}
                              </span>
                            </div>
                          </div>
                        )}

                        {filtered.map((game) => {
                          const isSelected = selectedGameIds.has(game.id);
                          const isPartOfDraggedGroup = draggedGroupIds.includes(game.id);
                          const isTargetOver = dragOverTarget?.id === game.id;
                          const isDroppingAbove = isTargetOver && dragOverTarget?.position === 'above';
                          const isDroppingBelow = isTargetOver && dragOverTarget?.position === 'below';

                          return (
                            <div key={game.id} data-game-id={game.id} className="relative transition-all duration-200">
                              {/* Glowing Drop Line Indicator - TOP */}
                              {isDroppingAbove && (
                                <div className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(220,248,54,1)] z-30 animate-pulse flex items-center justify-between px-2 pointer-events-none">
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-1"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary -mr-1"></div>
                                </div>
                              )}

                              <div 
                                onDragOver={(e) => handleDragOver(e, game)}
                                onDragEnd={handleDragEnd}
                                onDrop={() => handleDrop(game, filtered)}
                                onClick={(e) => handleRowClick(e, game, filtered)}
                                className={`group relative glass p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center transition-all duration-300 shadow-md select-none cursor-pointer ${
                                  isPartOfDraggedGroup 
                                    ? 'opacity-30 scale-[0.99] border-dashed border-primary/50 bg-primary/5' 
                                    : isTargetOver 
                                    ? 'border-primary/80 bg-white/[0.08] shadow-[0_0_25px_rgba(220,248,54,0.25)] -translate-y-0.5' 
                                    : isSelected
                                    ? 'border-primary/70 bg-primary/[0.08] shadow-[0_0_20px_rgba(220,248,54,0.15)] -translate-y-0.5 ring-1 ring-primary/40'
                                    : 'border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent hover:from-white/[0.06] hover:border-white/20 hover:-translate-y-0.5'
                                }`}
                              >
                                {/* Left glowing accent bar for selected row */}
                                {isSelected && (
                                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(220,248,54,0.8)] pointer-events-none"></div>
                                )}

                                {/* Drag Handle */}
                                <div 
                                  draggable={!searchQuery && !isReordering}
                                  onDragStart={(e) => handleDragStart(e, game, filtered)}
                                  className={`hidden sm:flex items-center justify-center p-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing hover:bg-white/10 shrink-0 ${
                                    isSelected ? 'text-primary' : 'text-white/30 group-hover:text-primary'
                                  }`}
                                  title={
                                    isSelected && selectedGameIds.size > 1
                                      ? `Drag to move ${selectedGameIds.size} selected games`
                                      : "Drag to reorder"
                                  }
                                  data-drag-handle="true"
                                >
                                  <GripVertical size={20} />
                                </div>

                                {/* Row Selection Checkbox */}
                                <div 
                                  onClick={(e) => e.stopPropagation()} 
                                  className="flex items-center justify-center p-1 shrink-0"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleCheckboxChange(e, game.id)}
                                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-primary accent-primary focus:ring-primary/40 focus:ring-offset-0 cursor-pointer transition-all"
                                    aria-label={`Select ${game.title}`}
                                  />
                                </div>

                                <div className={`relative shrink-0 overflow-hidden rounded-xl ${game.isBundle ? 'w-full sm:w-36 h-36 sm:h-20' : 'w-full sm:w-20 h-48 sm:h-24'} shadow-lg border border-white/10`}>
                                  <img 
                                    src={getImageUrl(game.coverImage)} 
                                    alt={game.title} 
                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${game.outOfStock ? 'grayscale opacity-60' : ''}`} 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col w-full z-10 sm:py-1">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span 
                                          draggable={!searchQuery && !isReordering}
                                          onDragStart={(e) => handleDragStart(e, game, filtered)}
                                          className={`sm:hidden cursor-grab active:cursor-grabbing p-1 ${
                                            isSelected ? 'text-primary' : 'text-text-secondary'
                                          }`}
                                          data-drag-handle="true"
                                          title="Drag to reorder"
                                        >
                                          <GripVertical size={16} />
                                        </span>
                                        <h3 className="font-bold text-lg sm:text-xl text-white leading-tight group-hover:text-primary transition-colors truncate">
                                          {game.title}
                                        </h3>
                                      {game.isBundle && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30 shadow-[0_0_10px_rgba(168,85,247,0.15)] shrink-0">
                                          <Package size={11} /> Bundle
                                        </span>
                                      )}
                                      {game.isGiveaway && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase bg-[#DCF836]/15 text-primary border border-primary/30 shadow-[0_0_10px_rgba(220,248,54,0.15)] shrink-0">
                                          <Gift size={11} /> {parseGiveawayRules(game.giveawayRules).category || 'Giveaway'}
                                        </span>
                                      )}
                                      {game.isGiveaway && parseGiveawayRules(game.giveawayRules).winner && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)] shrink-0">
                                          <Trophy size={11} /> Winner: {parseGiveawayRules(game.giveawayRules).winner?.username}
                                        </span>
                                      )}
                                      {game.creatorAccess && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase bg-primary/10 text-primary border border-primary/30 shrink-0">
                                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                          Creator
                                        </span>
                                      )}
                                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase shrink-0 ${game.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'}`}>
                                        {game.isPublished ? 'Published' : 'Draft'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-sm flex-wrap">
                                      {game.isGiveaway ? (
                                        <span className="text-primary font-heading font-black">
                                          {parseGiveawayRules(game.giveawayRules).worth ? `Worth ₹${parseGiveawayRules(game.giveawayRules).worth}` : 'Free Giveaway'}
                                        </span>
                                      ) : (
                                        <span className="text-primary font-heading font-black">{formatPrice(game.price)}</span>
                                      )}
                                      {game.bundleGames && (() => {
                                        const count = game.bundleGames.split(/[,+]/).map(g => g.trim()).filter(Boolean).length;
                                        return (
                                          <span 
                                            className="text-xs text-text-secondary/80 flex items-center gap-1 truncate max-w-md sm:max-w-lg" 
                                            title={game.bundleGames}
                                          >
                                            • <Gamepad2 size={12} className="text-[#A855F7] shrink-0" />
                                            <span className="font-bold text-white/80">{count} Games:</span>
                                            <span className="truncate">{game.bundleGames}</span>
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap lg:flex-nowrap">
                                    {/* Giveaway Specific Actions: View Participants & Draw Winner */}
                                    {game.isGiveaway && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openGiveawayParticipants(game);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer shadow-[0_0_10px_rgba(220,248,54,0.15)]"
                                          title="View Giveaway Entrants"
                                        >
                                          <Users size={13} />
                                          <span>Participants</span>
                                        </button>

                                        <button
                                          type="button"
                                          disabled={drawingWinnerForId === game.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDrawWinner(game);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25 hover:border-yellow-500/50 transition-all cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.2)] disabled:opacity-50"
                                          title="Draw Random Winner"
                                        >
                                          {drawingWinnerForId === game.id ? (
                                            <Loader2 size={13} className="animate-spin text-yellow-400" />
                                          ) : (
                                            <Trophy size={13} />
                                          )}
                                          <span>{parseGiveawayRules(game.giveawayRules).winner ? 'Redraw Winner' : 'Draw Winner'}</span>
                                        </button>
                                      </>
                                    )}

                                    {/* Inline Creator Access Switch (games only) */}
                                    {!game.isGiveaway && (
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={Boolean(game.creatorAccess)}
                                        aria-label={game.creatorAccess ? 'Disable Creator Access' : 'Enable Creator Access'}
                                        title={game.creatorAccess ? 'Disable Creator Access' : 'Enable Creator Access'}
                                        disabled={processingCreatorAccess === game.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCreatorAccess(game.id, Boolean(game.creatorAccess));
                                        }}
                                        className={`group/creator relative flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 border select-none ${
                                          processingCreatorAccess === game.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                        } ${
                                          game.creatorAccess
                                            ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(230,255,0,0.2)]'
                                            : 'bg-white/5 text-text-secondary/70 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white/90'
                                        }`}
                                      >
                                        <span className="text-[11px] font-bold tracking-wider">Creator</span>
                                        
                                        {/* Switch track & thumb */}
                                        <span
                                          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                                            game.creatorAccess 
                                              ? 'bg-primary shadow-[0_0_8px_rgba(230,255,0,0.6)]' 
                                              : 'bg-white/20'
                                          }`}
                                        >
                                          {processingCreatorAccess === game.id ? (
                                            <Loader2 size={10} className={`animate-spin absolute left-1 ${game.creatorAccess ? 'text-black' : 'text-white'}`} />
                                          ) : (
                                            <span
                                              className={`inline-block h-3 w-3 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                                                game.creatorAccess
                                                  ? 'translate-x-3.5 bg-black'
                                                  : 'translate-x-0.5 bg-white/70'
                                              }`}
                                            />
                                          )}
                                        </span>

                                        <span className={`text-[10px] font-black tracking-wider ${game.creatorAccess ? 'text-primary' : 'text-text-secondary/60'}`}>
                                          {processingCreatorAccess === game.id ? '...' : game.creatorAccess ? 'ON' : 'OFF'}
                                        </span>
                                      </button>
                                    )}

                                    <button 
                                      disabled={processingPublish === game.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePublishedStatus(game.id, game.isPublished || false, game.price);
                                      }}
                                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 border ${
                                        processingPublish === game.id ? 'opacity-50 cursor-not-allowed' : ''
                                      } ${
                                        !game.isPublished 
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                      }`}
                                    >
                                      {processingPublish === game.id ? (
                                        <Loader2 size={14} className="animate-spin text-white" />
                                      ) : (
                                        <div className={`w-2 h-2 rounded-full ${!game.isPublished ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
                                      )}
                                      {processingPublish === game.id ? 'Updating...' : game.isPublished ? 'Published' : 'Unpublished'}
                                    </button>

                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOutOfStock(game.id, game.outOfStock || false);
                                      }}
                                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 border ${
                                        game.outOfStock 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                        : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${game.outOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}`}></div>
                                      {game.outOfStock ? 'Out of Stock' : 'In Stock'}
                                    </button>

                                    {game.internalCost != null && !game.isGiveaway && (
                                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] tracking-wider uppercase bg-white/5 text-text-secondary border border-white/10 shadow-sm" title="Internal admin cost">
                                        OUR COST: ₹{game.internalCost}
                                      </span>
                                    )}

                                    <div className="h-6 w-px bg-white/10 hidden sm:block shrink-0"></div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          editGame(game);
                                        }} 
                                        className="p-2 bg-black/40 hover:bg-primary/20 border border-white/5 hover:border-primary/50 rounded-xl text-text-secondary hover:text-primary transition-all duration-300 tooltip-trigger"
                                        title="Edit Game"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(game.id);
                                        }} 
                                        className="p-2 bg-black/40 hover:bg-error/20 border border-white/5 hover:border-error/50 rounded-xl text-text-secondary hover:text-error transition-all duration-300 tooltip-trigger"
                                        title="Delete Game"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Glowing Drop Line Indicator - BOTTOM */}
                            {isDroppingBelow && (
                              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(220,248,54,1)] z-30 animate-pulse flex items-center justify-between px-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-1"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-primary -mr-1"></div>
                              </div>
                            )}
                          </div>

                          );
                        })}
                      </div>

                    );
                  })()}
                </>
              ) : null}
            </div>
          </div>


          {/* Coupon Management Section */}
          {activeTab === 'coupons' && (
            <div className="w-full mt-6">
              <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-heading">Create New Coupon</h3>
                    <p className="text-text-secondary text-xs mt-0.5">Configure discounts and creator referral codes</p>
                  </div>
                  <button 
                    type="submit" 
                    form="admin-coupon-form"
                    className="bg-[#FF00F0] hover:bg-[#FF00F0]/80 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,240,0.3)] flex items-center gap-1.5 cursor-pointer text-sm"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Save Coupon</span>
                  </button>
                </div>
                <form id="admin-coupon-form" onSubmit={handleCouponSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex flex-col gap-2 w-full flex-1">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Admin</label>
                      <select 
                        value={couponFormData.createdBy} 
                        onChange={(e) => setCouponFormData({ ...couponFormData, createdBy: e.target.value })}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none"
                      >
                        <option value="Sagar">Sagar</option>
                        <option value="Zamir">Zamir</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 w-full flex-1">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Assign Creator</label>
                      <select 
                        value={couponFormData.creatorId} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setCouponFormData({ 
                            ...couponFormData, 
                            creatorId: val,
                            usageLimit: val ? '' : couponFormData.usageLimit,
                            commissionRate: val ? couponFormData.commissionRate : ''
                          });
                        }}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none"
                      >
                        <option value="">None (Standard Coupon)</option>
                        {creatorRequests.filter(req => req.status === 'APPROVED').map(req => (
                          <option key={req.userId} value={req.userId}>{req.name}</option>
                        ))}
                      </select>
                    </div>
                    {couponFormData.creatorId && (
                      <div className="flex flex-col gap-2 w-full flex-1">
                        <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Commission (%)</label>
                        <select 
                          value={couponFormData.commissionRate} 
                          onChange={(e) => setCouponFormData({ ...couponFormData, commissionRate: e.target.value })}
                          className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none"
                          required={!!couponFormData.creatorId}
                        >
                          <option value="">Select Rate</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rate => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-end mt-2">
                    <div className="flex flex-col gap-2 w-full flex-1">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Coupon Code</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. SAGAR-20"
                        value={couponFormData.code} 
                        onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full flex-1">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Discount Amount (₹)</label>
                      <input 
                        type="number" 
                        required
                        step="1"
                        min="1"
                        placeholder="e.g. 20"
                        value={couponFormData.discount} 
                        onChange={(e) => setCouponFormData({ ...couponFormData, discount: e.target.value })}
                        className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full flex-1">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold">Usage Limit</label>
                      <input 
                        type="number" 
                        min="1"
                        step="1"
                        disabled={!!couponFormData.creatorId}
                        placeholder={couponFormData.creatorId ? "No Limit (Creator)" : "e.g. 5 (or blank for unlmtd)"}
                        value={couponFormData.creatorId ? '' : couponFormData.usageLimit} 
                        onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                        className={`border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none ${couponFormData.creatorId ? 'bg-black/50 opacity-50 cursor-not-allowed' : 'bg-cards'}`}
                      />
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-[#FF00F0] hover:bg-[#FF00F0]/80 text-white font-bold py-3 px-6 rounded-lg transition-colors h-[50px] shadow-[0_0_15px_rgba(255,0,240,0.3)]">
                      Create Coupon
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase())).map(coupon => (
                  <div key={coupon.id} className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:border-[#FF00F0]/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF00F0]/5 rounded-full blur-2xl group-hover:bg-[#FF00F0]/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <span className="bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md mb-2 inline-block">Created by {coupon.createdBy}</span>
                        <h4 className="text-2xl font-black font-heading text-[#FF00F0] tracking-wider">{coupon.code}</h4>
                      </div>
                      <button 
                        onClick={() => setCouponToDelete(coupon.id)}
                        className="text-text-secondary hover:text-red-500 bg-white/5 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-text-secondary text-sm font-bold">Flat Discount</span>
                        <span className="text-xs text-text-secondary/70">
                          {coupon.usageLimit ? `Used: ${coupon.usageCount}/${coupon.usageLimit}` : `Used: ${coupon.usageCount} (Unlmtd)`}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-white">₹{coupon.discount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {activeTab === 'orders' && (
            <div className="w-full mt-6">
              <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white font-heading">Order Management</h3>
                  <button 
                    onClick={deleteAllOrders}
                    disabled={adminOrders.length === 0}
                    className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} /> Delete All
                  </button>
                </div>
                
                {loadingOrders ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : adminOrders.length === 0 ? (
                  <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Orders Found</h3>
                    {searchQuery && <p className="text-text-secondary">Try searching with a different term.</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-text-secondary text-sm">
                          <th className="py-3 px-4 whitespace-nowrap">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.map(order => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-primary">
                                  {formatOrderId(order.id)}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(formatOrderId(order.id));
                                    toast.success(`Order ID ${formatOrderId(order.id)} copied!`);
                                  }}
                                  className="text-text-secondary hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Copy Order ID"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white font-bold">{order.user.username}</div>
                              <div className="text-text-secondary text-xs">{order.user.email}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-white">
                              {formatPrice(order.totalAmount)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-secondary">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Creator Requests Section */}
          {activeTab === 'creator_requests' && (
            <div className="w-full mt-6">
              <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-white font-heading">Creator Applications</h3>
                
                {loadingCreatorRequests ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#DCF836]" /></div>
                ) : creatorRequests.length === 0 ? (
                  <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
                    <p className="text-text-secondary">There are currently no creator requests to review.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-text-secondary text-sm">
                          <th className="py-3 px-4 whitespace-nowrap">Applicant</th>
                          <th className="py-3 px-4">Creator Email</th>
                          <th className="py-3 px-4">Account Email</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creatorRequests.map(req => (
                          <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="text-white font-bold">{req.name}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#DCF836]">
                              {req.creatorEmail}
                            </td>
                            <td className="py-3 px-4 text-sm text-text-secondary">
                              {req.user?.email || 'Unknown'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-secondary">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => setSelectedCreatorRequest(req)}
                                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Management Section */}
          {activeTab === 'users' && (
            <div className="w-full mt-6">
              <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-heading">Registered Users</h3>
                    <p className="text-text-secondary text-xs mt-1">Manage and view all registered member accounts</p>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-xl font-bold text-xs">
                    {usersList.length} Total Users
                  </span>
                </div>
                
                {loadingUsers ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" /></div>
                ) : usersList.length === 0 ? (
                  <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
                    <UserCheck className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
                    <p className="text-text-secondary">No registered user accounts found in the database.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-text-secondary text-sm">
                          <th className="py-3 px-4">Username</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Orders</th>
                          <th className="py-3 px-4">Joined Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList
                          .filter(u => 
                            !searchQuery || 
                            u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(u => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4">
                                <div className="text-white font-bold flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold uppercase">
                                    {u.username.charAt(0)}
                                  </div>
                                  <span>{u.username}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-text-secondary">
                                {u.email}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                                  {u._count?.orders || 0} Orders
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-text-secondary">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => setSelectedUser(u)}
                                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-500/20 flex items-center gap-1.5"
                                  >
                                    <Eye size={14} />
                                    <span>View Details</span>
                                  </button>
                                  <button 
                                    onClick={() => setUserToDelete(u.id)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg text-sm transition-colors cursor-pointer border border-red-500/20"
                                    title="Delete user"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>


                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div data-lenis-prevent="true" className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky -top-6 -mx-6 px-6 pt-2 pb-4 mb-4 bg-background/95 backdrop-blur-md border-b border-white/10 z-30 flex items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Order Details</h2>
              <div className="flex items-center gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                    className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>Mark Paid</span>
                  </button>
                )}
                <button 
                  onClick={() => { setSelectedOrder(null); setIsCopied(false); }}
                  className="text-text-secondary hover:text-white transition-colors bg-cards hover:bg-white/10 p-2 rounded-xl border border-white/5 cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Order Info */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Order ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-primary font-mono text-sm font-bold bg-primary/10 px-2.5 py-1 rounded border border-primary/20">{formatOrderId(selectedOrder.id)}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(formatOrderId(selectedOrder.id));
                          setIsCopied(true);
                          toast.success('Order ID copied!');
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="text-primary hover:text-white transition-colors p-1 cursor-pointer"
                        title="Copy Order ID"
                      >
                        {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Status</p>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        selectedOrder.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        selectedOrder.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {selectedOrder.status}
                      </span>
                      {selectedOrder.status === 'PENDING' && (
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 rounded text-xs font-bold transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-text-secondary">Created: </span>
                    <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Updated: </span>
                    <span className="text-white">{new Date(selectedOrder.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-secondary text-xs uppercase">Username</p>
                    <p className="text-white font-bold">{selectedOrder.user.username}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs uppercase">Email</p>
                    <p className="text-white font-bold">{selectedOrder.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {(selectedOrder.submittedUtr || selectedOrder.transaction) && (
                <div className="bg-cards/50 p-4 rounded-xl border border-white/5 mt-4 mb-4">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.submittedUtr && (
                      <div>
                        <p className="text-text-secondary text-xs uppercase">Submitted UTR / Ref</p>
                        <p className="text-white font-mono text-sm font-bold bg-white/5 inline-block px-2 py-0.5 rounded mt-1 border border-white/10">
                          {selectedOrder.submittedUtr}
                        </p>
                      </div>
                    )}
                    {selectedOrder.transaction && (
                      <div>
                        <p className="text-text-secondary text-xs uppercase">Matched DB UTR</p>
                        <p className="text-green-400 font-mono text-sm font-bold bg-green-500/10 inline-block px-2 py-0.5 rounded mt-1 border border-green-500/20">
                          {selectedOrder.transaction.utr}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Info */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Order Items
                </h3>
                <div className="flex flex-col gap-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center bg-black/20 p-3 rounded-lg border border-white/5">
                      <img src={getImageUrl(item.game.coverImage)} alt={item.game.title} className="w-12 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-white font-bold">{item.game.title}</p>
                        <p className="text-text-secondary text-xs">{item.game.developer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{formatPrice(item.pricePaid)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white font-bold">{selectedOrder.status === 'COMPLETED' ? 'Total Paid' : 'Total Due'}</span>
                  <span className="text-2xl text-orange-500 font-black">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Request Details Modal */}
      {selectedCreatorRequest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div data-lenis-prevent="true" className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <div className="sticky -top-6 -mx-6 px-6 pt-2 pb-4 mb-4 bg-background/95 backdrop-blur-md border-b border-white/10 z-30 flex items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Creator Application Details</h2>
              <div className="flex items-center gap-2">
                {selectedCreatorRequest.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => updateCreatorRequestStatus(selectedCreatorRequest.id, 'APPROVED')}
                      className="bg-green-500 hover:bg-green-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => updateCreatorRequestStatus(selectedCreatorRequest.id, 'REJECTED')}
                      className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedCreatorRequest(null)}
                  className="text-text-secondary hover:text-white transition-colors bg-cards hover:bg-white/10 p-2 rounded-xl border border-white/5 cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Applicant Info */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Application ID</p>
                    <code className="text-white font-mono text-sm">{selectedCreatorRequest.id}</code>
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedCreatorRequest.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                      selectedCreatorRequest.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedCreatorRequest.status}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#DCF836] rounded-full"></div>
                  Applicant Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-text-secondary text-xs uppercase">Name</p>
                    <p className="text-white font-bold">{selectedCreatorRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs uppercase">Account Email</p>
                    <p className="text-white font-bold">{selectedCreatorRequest.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-[#DCF836] text-xs uppercase">Creator Email</p>
                    <p className="text-[#DCF836] font-bold">{selectedCreatorRequest.creatorEmail}</p>
                  </div>
                </div>
              </div>

              {/* Social Platforms */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#DCF836] rounded-full"></div>
                  Social Media Platforms
                </h3>
                <div className="flex flex-col gap-3">
                  {selectedCreatorRequest.youtubeLink && (
                    <div>
                      <span className="text-red-500 font-bold text-sm mr-2">YouTube:</span>
                      <a href={selectedCreatorRequest.youtubeLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">{selectedCreatorRequest.youtubeLink}</a>
                    </div>
                  )}
                  {selectedCreatorRequest.instagramLink && (
                    <div>
                      <span className="text-pink-500 font-bold text-sm mr-2">Instagram:</span>
                      <a href={selectedCreatorRequest.instagramLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">{selectedCreatorRequest.instagramLink}</a>
                    </div>
                  )}
                  {selectedCreatorRequest.facebookLink && (
                    <div>
                      <span className="text-blue-500 font-bold text-sm mr-2">Facebook:</span>
                      <a href={selectedCreatorRequest.facebookLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">{selectedCreatorRequest.facebookLink}</a>
                    </div>
                  )}
                  {selectedCreatorRequest.otherLink && (
                    <div>
                      <span className="text-white font-bold text-sm mr-2">Other:</span>
                      <a href={selectedCreatorRequest.otherLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">{selectedCreatorRequest.otherLink}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Creator Intent */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#DCF836] rounded-full"></div>
                  Creator Intent
                </h3>
                <div className="bg-black/30 p-4 rounded-lg border border-white/5 whitespace-pre-wrap text-white text-sm">
                  {selectedCreatorRequest.intent}
                </div>
              </div>

              {/* Contact Platforms */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#DCF836] rounded-full"></div>
                  Preferred Contact Methods
                </h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(JSON.parse(selectedCreatorRequest.contactPlatforms || '{}')).map(([platform, detail]: [string, any]) => (
                    <div key={platform} className="bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                      <span className="text-text-secondary text-xs uppercase block mb-1">{platform}</span>
                      <span className="text-white font-bold">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates & Guidelines */}
              <div className="flex justify-between text-sm text-text-secondary px-2">
                <div>
                  <span>Submitted: </span>
                  <span className="text-white">{new Date(selectedCreatorRequest.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span>Guidelines Accepted: </span>
                  <span className="text-white">Yes</span>
                </div>
              </div>

              {/* Manual Review Actions */}
              {selectedCreatorRequest.status === 'PENDING' && (
                <div className="mt-4 pt-6 border-t border-white/10 flex gap-4">
                  <button 
                    onClick={() => updateCreatorRequestStatus(selectedCreatorRequest.id, 'APPROVED')}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors"
                  >
                    Approve Application
                  </button>
                  <button 
                    onClick={() => updateCreatorRequestStatus(selectedCreatorRequest.id, 'REJECTED')}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details & Orders Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div data-lenis-prevent="true" className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors z-10 bg-cards p-2 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4 font-heading flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              User Profile & Ordered Games
            </h2>

            <div className="flex flex-col gap-6">
              {/* User Account Info */}
              <div className="bg-cards/50 p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-2xl font-black uppercase">
                    {selectedUser.username.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedUser.username}</h3>
                    <p className="text-text-secondary text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-text-secondary text-xs uppercase tracking-wider">Member Since</p>
                  <p className="text-white font-bold text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* User Order History & Games */}
              <div className="bg-cards/50 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <ShoppingCart size={18} className="text-primary" />
                    Purchased / Ordered Games ({selectedUser.orders?.length || 0})
                  </h3>
                </div>

                {!selectedUser.orders || selectedUser.orders.length === 0 ? (
                  <div className="py-10 text-center text-text-secondary">
                    <Gamepad2 className="w-10 h-10 text-white/10 mx-auto mb-2" />
                    <p className="text-sm">This user has not placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {selectedUser.orders.map((order: any) => (
                      <div key={order.id} className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <div className="text-xs text-text-secondary">
                            <span>Order </span>
                            <span className="font-mono text-white/70">#{order.id.slice(0, 8)}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="flex flex-col gap-2">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
                              {item.game?.coverImage && (
                                <img src={getImageUrl(item.game.coverImage)} alt={item.game?.title} className="w-10 h-14 object-cover rounded" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{item.game?.title || 'Unknown Game'}</p>
                                <p className="text-text-secondary text-xs">{item.game?.developer || 'Developer'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-primary font-bold text-sm">{formatPrice(item.pricePaid)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                          <span className="text-text-secondary">Total Amount</span>
                          <span className="text-white font-black text-sm">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Payments Section */}
          {activeTab === 'payments' && (
            <div className="w-full mt-6">
              <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                      <CreditCard className="text-emerald-400" />
                      Payment Management
                    </h3>
                    <p className="text-text-secondary text-xs sm:text-sm mt-1">
                      Monitor live UPI QR checkout sessions, incoming UTRs, and verify transactions.
                    </p>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto">
                    {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setPaymentFilter(st)}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer text-center ${
                          paymentFilter === st
                            ? st === 'COMPLETED'
                              ? 'bg-green-500 text-black font-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                              : st === 'PENDING'
                              ? 'bg-yellow-500 text-black font-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                              : st === 'CANCELLED'
                              ? 'bg-red-500 text-white font-black'
                              : 'bg-emerald-400 text-black font-black shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingPayments ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
                ) : adminPayments.length === 0 ? (
                  <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
                    <CreditCard className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Payments Found</h3>
                    {searchQuery && <p className="text-text-secondary">Try searching with a different term.</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-text-secondary text-sm">
                          <th className="py-3 px-4 whitespace-nowrap">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Submitted UTR</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminPayments.map(payment => (
                          <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-primary">
                                  {formatOrderId(payment.id)}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(formatOrderId(payment.id));
                                    toast.success(`Order ID ${formatOrderId(payment.id)} copied!`);
                                  }}
                                  className="text-text-secondary hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Copy Order ID"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white font-bold">{payment.user?.username || 'Guest'}</div>
                              <div className="text-text-secondary text-xs">{payment.user?.email || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-white">
                              {formatPrice(payment.totalAmount)}
                            </td>
                            <td className="py-3 px-4">
                              {payment.submittedUtr ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-emerald-400 font-bold text-xs">
                                    {payment.submittedUtr}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(payment.submittedUtr);
                                      toast.success('UTR copied!');
                                    }}
                                    className="text-text-secondary hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Copy UTR"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-text-secondary/50 italic">None</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                payment.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-secondary whitespace-nowrap">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => setSelectedPayment(payment)}
                                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>
                                {payment.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleAdminVerifyPayment(payment.id, payment.submittedUtr)}
                                    className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                                    title="Approve and fulfill order"
                                  >
                                    <Check size={13} />
                                    <span>Approve</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div data-lenis-prevent="true" className="bg-[#121214] border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky -top-6 sm:-top-8 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-2 pb-4 mb-4 bg-[#121214]/95 backdrop-blur-md border-b border-white/10 z-30 flex items-center justify-between gap-4">
              <h3 className="text-xl sm:text-2xl font-heading font-black text-white flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-emerald-400 rounded-full"></span>
                <span>Payment Session Details</span>
              </h3>
              <div className="flex items-center gap-2">
                {selectedPayment.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      handleAdminVerifyPayment(selectedPayment.id, selectedPayment.submittedUtr);
                      setSelectedPayment(null);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-white text-black font-heading font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>Approve</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Top Banner */}
              <div className="bg-cards/60 border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-1">Total Payable</p>
                  <p className="text-3xl font-heading font-black text-white">{formatPrice(selectedPayment.totalAmount)}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-1">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedPayment.status === 'COMPLETED'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : selectedPayment.status === 'PENDING'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              {/* Transaction & UTR Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-cards/40 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Order ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-primary text-sm font-bold">{formatOrderId(selectedPayment.id)}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formatOrderId(selectedPayment.id));
                        toast.success(`Order ID ${formatOrderId(selectedPayment.id)} copied!`);
                      }}
                      className="text-text-secondary hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      title="Copy Order ID"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div className="bg-cards/40 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Submitted UTR</p>
                  <p className="font-mono text-emerald-400 text-sm font-bold">{selectedPayment.submittedUtr || 'None'}</p>
                </div>
                <div className="bg-cards/40 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Customer Email</p>
                  <p className="text-white text-sm font-bold">{selectedPayment.user?.email || 'N/A'}</p>
                </div>
                <div className="bg-cards/40 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Created At</p>
                  <p className="text-white text-sm font-bold">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="bg-cards/40 p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Games Included in Order</h4>
                <div className="space-y-2">
                  {selectedPayment.items?.map((it: any) => (
                    <div key={it.id} className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      {it.game?.coverImage && (
                        <img src={getImageUrl(it.game.coverImage)} alt={it.game?.title} className="w-10 h-14 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{it.game?.title || 'Game'}</p>
                        <p className="text-primary text-xs font-bold">{formatPrice(it.pricePaid)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              {selectedPayment.status === 'PENDING' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      handleAdminVerifyPayment(selectedPayment.id, selectedPayment.submittedUtr);
                      setSelectedPayment(null);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-white text-black font-heading font-black rounded-xl text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
                  >
                    Manually Approve & Grant Steam Launcher Access
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cards border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">

            <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-text-secondary mb-6">Are you sure you want to delete this game? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setGameToDelete(null)}
                className="px-5 py-2.5 bg-cards border border-white/10 hover:bg-white/5 text-white rounded-xl transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-error/10 hover:bg-error text-error hover:text-white border border-error/20 hover:border-error rounded-xl transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Coupon Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cards border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-text-secondary mb-6">Are you sure you want to delete this coupon? Users will no longer be able to use it.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCouponToDelete(null)}
                className="px-5 py-2.5 bg-cards border border-white/10 hover:bg-white/5 text-white rounded-xl transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCoupon}
                className="px-5 py-2.5 bg-error/10 hover:bg-error text-error hover:text-white border border-error/20 hover:border-error rounded-xl transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cards border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Delete User Account</h3>
            <p className="text-text-secondary mb-6">Are you sure you want to delete this user account? All associated cart items and order records will also be removed.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2.5 bg-cards border border-white/10 hover:bg-white/5 text-white rounded-xl transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl transition-colors font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {isImportModalOpen && importPreviewData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-cards border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white">Import Preview</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-text-secondary hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-white mb-4">You are about to import <span className="font-bold text-primary">{importGamesData.length}</span> games.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <span className="block text-sm text-text-secondary mb-1">Will Create</span>
                  <span className="text-2xl font-bold text-emerald-400">{importPreviewData.createCount}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <span className="block text-sm text-text-secondary mb-1">Will Update</span>
                  <span className="text-2xl font-bold text-primary">{importPreviewData.updateCount}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <span className="block text-sm text-text-secondary mb-1">Will Skip</span>
                  <span className="text-2xl font-bold text-orange-400">{importPreviewData.skipCount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input 
                    type="radio" 
                    name="importMode" 
                    value="create-only"
                    checked={importMode === 'create-only'}
                    onChange={() => updateImportMode('create-only')}
                    className="w-5 h-5 accent-primary"
                  />
                  <div>
                    <span className="block font-bold text-white">Create Only (Safe)</span>
                    <span className="text-sm text-text-secondary">Only import games that do not exist yet. Existing games are skipped.</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-xl border border-error/30 bg-error/5 cursor-pointer hover:bg-error/10 transition-colors">
                  <input 
                    type="radio" 
                    name="importMode" 
                    value="restore"
                    checked={importMode === 'restore'}
                    onChange={() => updateImportMode('restore')}
                    className="w-5 h-5 accent-error"
                  />
                  <div>
                    <span className="block font-bold text-error">Restore / Update (Destructive)</span>
                    <span className="text-sm text-text-secondary">Overwrite existing games with the backup data.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="px-6 py-3 bg-cards border border-white/10 hover:bg-white/5 text-white rounded-xl transition-colors font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={executeImport}
                className="px-6 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 hover:border-primary rounded-xl transition-all duration-300 font-bold"
              >
                Execute Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Giveaway Participants Modal */}
      {participantsModalGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0f1115] border border-pink-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-[0_0_50px_rgba(236,72,153,0.15)] my-8 relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <Gift size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-white font-heading truncate max-w-md">
                      {participantsModalGame.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/15 text-pink-400 border border-pink-500/30">
                      {parseGiveawayRules(participantsModalGame.giveawayRules).category || 'Giveaway'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1 flex-wrap">
                    <span>Total: <strong className="text-white">{participantsList.length}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">
                      Approved: {participantsList.filter(e => e.status === 'APPROVED').length}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">
                      Pending DM: {participantsList.filter(e => e.status !== 'APPROVED').length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setParticipantsModalGame(null)}
                className="p-2 text-text-secondary hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick 4-Digit Code Approval Box */}
            <div className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/30 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FaInstagram size={18} className="text-pink-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-pink-300">
                    Verify & Approve Participant by 4-Digit Code
                  </span>
                </div>
                <a
                  href="https://ig.me/m/valqore.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-pink-400 hover:text-white bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all"
                >
                  <Send size={12} />
                  <span>Open Instagram DMs (@valqore.pro)</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <p className="text-[11px] text-text-secondary">
                Check if the user is following your Instagram, then copy their 4-digit code from DM, paste it here, and click Approve:
              </p>

              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  maxLength={10}
                  value={giveawayApproveCode}
                  onChange={(e) => setGiveawayApproveCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApproveGiveawayCode(participantsModalGame.id);
                    }
                  }}
                  placeholder="Paste 4-digit code (e.g. 4829)..."
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono tracking-widest text-sm focus:border-pink-500 outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-text-secondary/50"
                />
                <button
                  type="button"
                  disabled={approvingGiveawayCode || !giveawayApproveCode.trim()}
                  onClick={() => handleApproveGiveawayCode(participantsModalGame.id)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0"
                >
                  {approvingGiveawayCode ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Approve Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Winner banner if already drawn */}
            {(() => {
              const currentWinner = parseGiveawayRules(participantsModalGame.giveawayRules).winner;
              if (!currentWinner) return null;
              return (
                <div className="mb-4 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(234,179,8,0.15)] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 block">Current Winner</span>
                      <span className="text-white font-black text-base">{currentWinner.username}</span>
                      <span className="text-text-secondary text-xs ml-2">({currentWinner.email})</span>
                      {currentWinner.code && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-black/40 text-yellow-300 font-mono text-xs border border-yellow-500/30">
                          Code: {currentWinner.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-yellow-400 font-semibold px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    Selected
                  </span>
                </div>
              );
            })()}

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3 mb-3 shrink-0 flex-wrap">
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                Participants List ({participantsList.length})
              </span>

              <button
                type="button"
                disabled={
                  participantsList.filter(e => e.status === 'APPROVED').length === 0 || 
                  drawingWinnerForId === participantsModalGame.id
                }
                onClick={() => handleDrawWinner(participantsModalGame)}
                className="font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  participantsList.filter(e => e.status === 'APPROVED').length === 0
                    ? 'Approve participants with their 4-digit code first before drawing'
                    : 'Draw random winner from approved participants'
                }
              >
                {drawingWinnerForId === participantsModalGame.id ? (
                  <Loader2 size={15} className="animate-spin text-black" />
                ) : (
                  <Trophy size={15} />
                )}
                <span>
                  {parseGiveawayRules(participantsModalGame.giveawayRules).winner 
                    ? 'Re-Draw Winner (Approved Only)' 
                    : 'Draw Random Winner (Approved Only)'}
                </span>
              </button>
            </div>

            {/* List / Table Content */}
            <div className="flex-1 overflow-y-auto pr-1">
              {loadingParticipants ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-3">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="text-sm">Loading giveaway participants...</p>
                </div>
              ) : participantsList.length === 0 ? (
                <div className="text-center py-16 border border-white/5 bg-white/[0.02] rounded-2xl p-6">
                  <Users size={40} className="mx-auto text-text-secondary/40 mb-3" />
                  <h4 className="text-base font-bold text-white mb-1">No Entries Yet</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Users who follow on Instagram and click Participate will receive a 4-digit code and appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {participantsList.map((entry, index) => {
                    const winnerObj = parseGiveawayRules(participantsModalGame.giveawayRules).winner;
                    const isWinner = winnerObj && (winnerObj.id === entry.userId || winnerObj.email === entry.user?.email);
                    const isEntryApproved = entry.status === 'APPROVED';

                    return (
                      <div
                        key={entry.id || index}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all gap-3 ${
                          isWinner
                            ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                            : isEntryApproved
                            ? 'bg-emerald-500/[0.04] border-emerald-500/30 hover:border-emerald-500/50'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                        }`}
                      >
                        {/* User info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-mono font-bold text-text-secondary/60 w-6 text-center">
                            #{index + 1}
                          </span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isEntryApproved 
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                              : 'bg-primary/10 border border-primary/20 text-primary'
                          }`}>
                            {(entry.user?.username || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm truncate">
                                {entry.user?.username || 'User'}
                              </span>
                              {isWinner && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-500 text-black shadow-sm">
                                  <Trophy size={9} /> WINNER
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-secondary block truncate">
                              {entry.user?.email}
                            </span>
                          </div>
                        </div>

                        {/* 4-Digit Code Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] text-text-secondary uppercase font-bold">Code:</span>
                            <span className="font-mono font-black text-xs text-[#00F0FF] tracking-wider">
                              {entry.code || '----'}
                            </span>
                          </div>
                          {entry.code && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(entry.code);
                                toast.success(`Code ${entry.code} copied!`);
                              }}
                              className="p-1.5 text-text-secondary hover:text-white rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                              title="Copy 4-digit code"
                            >
                              <Copy size={13} />
                            </button>
                          )}
                        </div>

                        {/* Approval Status & Action Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isEntryApproved ? (
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                              <button
                                type="button"
                                disabled={revokingGiveawayEntryId === entry.id}
                                onClick={() => handleRevokeGiveawayEntryDirectly(entry.id)}
                                className="px-2.5 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                                title="Revoke approval if user unfollowed on Instagram"
                              >
                                {revokingGiveawayEntryId === entry.id ? (
                                  <Loader2 size={12} className="animate-spin text-red-400" />
                                ) : (
                                  <RotateCcw size={11} />
                                )}
                                <span>Revoke</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <Clock size={11} /> Pending DM
                              </span>
                              <button
                                type="button"
                                disabled={approvingGiveawayEntryId === entry.id}
                                onClick={() => handleApproveGiveawayEntryDirectly(entry.id)}
                                className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                                title="Approve this participant"
                              >
                                {approvingGiveawayEntryId === entry.id ? (
                                  <Loader2 size={12} className="animate-spin text-black" />
                                ) : (
                                  <Check size={12} />
                                )}
                                <span>Approve</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="text-right shrink-0 hidden sm:block">
                          <span className="text-[11px] text-text-secondary font-mono block">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-text-secondary/60 font-mono block">
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setParticipantsModalGame(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawn Winner Celebration Modal */}
      {drawnWinnerModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#181a20] to-[#0d0e12] border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_0_60px_rgba(234,179,8,0.3)] relative text-center">
            {/* Close Button */}
            <button
              onClick={() => setDrawnWinnerModal(null)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center text-yellow-400 mx-auto mb-4 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce">
              <Trophy size={40} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-black tracking-widest uppercase mb-2">
              <Sparkles size={13} /> Winner Selected!
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading mb-1">
              Congratulations!
            </h3>
            <p className="text-xs text-text-secondary mb-6 max-w-xs mx-auto">
              Randomly chosen from verified participants for <span className="text-white font-bold">{drawnWinnerModal.gameTitle}</span>
            </p>

            {/* Winner Card */}
            <div className="bg-black/50 border border-yellow-500/30 rounded-2xl p-5 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-black text-lg">
                  {(drawnWinnerModal.winner?.username || 'W')[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400/80 block">Winner Username</span>
                  <span className="text-lg font-black text-white">{drawnWinnerModal.winner?.username}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">Email Address</span>
                  <span className="text-sm font-mono text-white truncate block">{drawnWinnerModal.winner?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(drawnWinnerModal.winner?.email || '');
                    toast.success('Winner email copied to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Copy Email"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Close action */}
            <button
              onClick={() => setDrawnWinnerModal(null)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_25px_rgba(234,179,8,0.4)] cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

