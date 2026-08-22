import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Edit2, Trash2, LogOut, Search, Loader2, X, Package, Plus, AlertCircle, Gamepad2, Gift, Ticket, Image as ImageIcon, ShoppingCart, Copy, Check, Users } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { getYouTubeVideoId } from '../utils/youtube';
import type { Game } from '../types';
import { getImageUrl } from '../utils/image';
const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'games' | 'giveaways' | 'coupons' | 'posters' | 'orders' | 'creator_requests'>('games');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  // Order state
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Coupon state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponFormData, setCouponFormData] = useState({ code: '', discount: '', createdBy: 'Sagar', usageLimit: '' });
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Poster state
  const [posters, setPosters] = useState<any[]>([]);
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [posterToDelete, setPosterToDelete] = useState<string | null>(null);

  // Creator Requests state
  const [creatorRequests, setCreatorRequests] = useState<any[]>([]);
  const [loadingCreatorRequests, setLoadingCreatorRequests] = useState(false);
  const [selectedCreatorRequest, setSelectedCreatorRequest] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    rating: 0,
    genre: '',
    price: 0,
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
    tagImage: ''
  });
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
    if (activeTab === 'creator_requests' && token) {
      fetchCreatorRequests();
    }
  }, [activeTab]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const fetchGames = async () => {
    try {
      const res = await axios.get(`${API_URL}/games`);
      setGames(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch games');
      setLoading(false);
    }
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
      setCouponFormData({ ...couponFormData, code: '', discount: '', usageLimit: '' });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleTagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTagImageFile(e.target.files[0]);
    }
  };

  const handleScreenshotFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshotFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.trailerUrl && formData.trailerUrl.trim() !== '') {
      const videoId = getYouTubeVideoId(formData.trailerUrl);
      if (!videoId) {
        toast.error('Please enter a valid YouTube video URL.');
        return;
      }
    }

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

    const dataToSubmit = { ...formData, coverImage: imageUrl, tagImage: tagImageUrl, screenshots: screenshotsStr };

    try {
      if (isEditing && currentId) {
        await axios.put(`${API_URL}/games/${currentId}`, dataToSubmit, { headers: { 'Authorization': `Bearer ${token}` } });
        toast.success('Game updated successfully');
      } else {
        await axios.post(`${API_URL}/games`, dataToSubmit, { headers: { 'Authorization': `Bearer ${token}` } });
        toast.success('Game added successfully');
      }
      resetForm();
      setIsModalOpen(false);
      fetchGames();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Operation failed');
      console.error("Update failed:", err);
    }
  };

  const editGame = (game: any) => {
    setIsEditing(true);
    setCurrentId(game.id);
    setFormData({
      title: game.title,
      developer: game.developer,
      rating: game.rating,
      genre: game.genre,
      price: game.price,
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
      tagImage: game.tagImage || ''
    });
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

  const resetForm = (isGiveawayFlag: boolean = false) => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '',
      developer: '',
      rating: 0,
      genre: '',
      price: 0,
      discount: 0,
      coverImage: '',
      releaseDate: '',
      platforms: '',
      isRentable: false,
      outOfStock: false,
      isGiveaway: isGiveawayFlag,
      giveawayRules: '',
      rentPrice: '',
      rentDurationDays: 7,
      rentRules: '',
      minRequirements: '',
      recRequirements: '',
      trailerUrl: '',
      screenshots: '',
      tagImage: ''
    });
    setImageFile(null);
    setTagImageFile(null);
    setScreenshotFiles([]);
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    if (tagImageInputRef.current) tagImageInputRef.current.value = '';
    if (screenshotsInputRef.current) screenshotsInputRef.current.value = '';
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

  const totalGames = games.filter(g => !g.isGiveaway).length;
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
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors z-10 bg-cards p-2 rounded-lg"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-primary">{isEditing ? 'Edit Game' : 'Add New Game'}</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Basic Information */}
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
                  </div>
                </div>

                {/* Pricing & Rating */}
                {!formData.isGiveaway && (
                  <div className="p-5 border border-white/10 rounded-xl bg-cards/30">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full"></span>Pricing & Rating</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Price (₹)</label>
                      <input type="number" step="0.1" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" required className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-wider font-bold ml-1">Discount (%)</label>
                      <input type="number" step="1" name="discount" value={formData.discount} onChange={handleInputChange} placeholder="0" className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
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
                            <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover rounded-lg border border-white/10" />
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

              {/* Giveaway Options */}
              {formData.isGiveaway && (
                <div className="mt-4 p-5 border border-[#00F0FF]/30 rounded-xl bg-cards/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                  <h3 className="font-bold text-[#00F0FF] mb-4 flex items-center gap-2"><Gift size={16} /> Giveaway Details</h3>
                  <div className="flex flex-col gap-4">
                    <textarea 
                      name="giveawayRules" 
                      value={formData.giveawayRules} 
                      onChange={handleInputChange} 
                      placeholder="How to participate full guide (e.g. Subscribe to channel, Comment below...)" 
                      rows={6}
                      className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#00F0FF] outline-none resize-none" 
                    />
                  </div>
                </div>
              )}

              {/* Inventory Management */}
              <div className="mt-4 p-4 border border-white/10 rounded-xl bg-cards/30">
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
                  <span className="font-bold text-white text-red-500">Mark as Out of Stock</span>
                </label>
              </div>

              {/* System Requirements */}
              {!formData.isGiveaway && (
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

              {/* Game Media */}
              {!formData.isGiveaway && (
                <div className="mt-4 p-4 border border-white/10 rounded-xl bg-cards/30">
                <h3 className="font-bold text-white mb-4">Game Media (Epic Layout)</h3>
                <div className="flex flex-col gap-4">
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-text-secondary">Screenshots (Upload Multiple)</label>
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
                    {/* Visual display of current URLs */}
                    {formData.screenshots && formData.screenshots.split(',').filter(s => s.trim()).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {formData.screenshots.split(',').map(s => s.trim()).filter(Boolean).map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-white/10" />
                            <button 
                              type="button"
                              onClick={() => {
                                const newUrls = formData.screenshots.split(',').map(s => s.trim()).filter(Boolean).filter((_, i) => i !== idx);
                                setFormData({ ...formData, screenshots: newUrls.join(',') });
                              }}
                              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
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
                <button type="submit" className="flex-1 bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  {isEditing ? 'Update Game' : 'Add Game'}
                </button>
                <button type="button" onClick={() => { resetForm(); setIsModalOpen(false); }} className="bg-cards border border-white/10 text-white font-bold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 bg-white/[0.02] border border-white/5 p-2 rounded-2xl backdrop-blur-md shadow-xl overflow-hidden">
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl overflow-x-auto w-full xl:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button 
                onClick={() => setActiveTab('games')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === 'games' ? 'bg-primary text-background shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-100' : 'text-text-secondary hover:text-white hover:bg-white/5 scale-95'}`}
              >
                <Gamepad2 size={20} /> Games
              </button>
              <button 
                onClick={() => setActiveTab('giveaways')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === 'giveaways' ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-100' : 'text-text-secondary hover:text-white hover:bg-white/5 scale-95'}`}
              >
                <Gift size={20} /> Giveaways
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === 'coupons' ? 'bg-[#FF00F0] text-white shadow-[0_0_20px_rgba(255,0,240,0.4)] scale-100' : 'text-text-secondary hover:text-white hover:bg-white/5 scale-95'}`}
              >
                <Ticket size={20} /> Coupons
              </button>
              <button 
                onClick={() => setActiveTab('posters')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === 'posters' ? 'bg-[#00FFAA] text-black shadow-[0_0_20px_rgba(0,255,170,0.4)] scale-100' : 'text-text-secondary hover:text-white hover:bg-white/5 scale-95'}`}
              >
                <ImageIcon size={20} /> Posters
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-100' : 'text-text-secondary hover:text-white hover:bg-white/5 scale-95'}`}
              >
                <ShoppingCart size={20} /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('creator_requests')}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === 'creator_requests' ? 'bg-[#DCF836] text-black shadow-[0_0_20px_rgba(220,248,54,0.4)] scale-100' : 'text-text-secondary hover:text-white hover:bg-white/5 scale-95'}`}
              >
                <Users size={20} /> Creator Requests
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto px-2 lg:px-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && activeTab === 'orders') {
                      fetchAdminOrders(searchQuery);
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-primary/50 focus:bg-black/60 outline-none transition-all duration-300"
                />
              </div>
              {activeTab === 'orders' ? (
                <button
                  onClick={() => fetchAdminOrders(searchQuery)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              ) : activeTab !== 'coupons' && activeTab !== 'posters' && (
                <button
                  onClick={() => {
                    resetForm(activeTab === 'giveaways');
                    setIsModalOpen(true);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 ${activeTab === 'games' ? 'bg-primary/10 text-primary hover:bg-primary hover:text-background border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'}`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add {activeTab === 'games' ? 'Game' : 'Giveaway'}</span>
                </button>
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
                    <h3 className="text-2xl font-bold mb-6 text-white font-heading">Add New Poster</h3>
                    <form onSubmit={handlePosterSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
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
              ) : activeTab === 'games' || activeTab === 'giveaways' ? (
                <>
                  {games
                    .filter(game => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .filter(game => (game.isGiveaway || false) === (activeTab === 'giveaways'))
                    .map(game => (
                    <div 
                      key={game.id} 
                      className="group relative glass p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-gradient-to-r from-white/[0.02] to-transparent hover:from-white/[0.06] hover:border-white/20 transition-all duration-500 shadow-md hover:shadow-2xl overflow-hidden hover:-translate-y-1"
                    >
                      <div className="relative shrink-0 overflow-hidden rounded-xl w-full sm:w-20 h-48 sm:h-24 shadow-lg border border-white/10">
                        <img 
                          src={getImageUrl(game.coverImage)} 
                          alt={game.title} 
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${game.outOfStock ? 'grayscale opacity-60' : ''}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden"></div>
                      </div>
                      
                      <div className="flex-1 flex flex-col w-full z-10 sm:py-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-xl text-white mb-1 leading-tight group-hover:text-primary transition-colors">{game.title}</h3>
                            <p className="text-text-secondary text-sm font-medium">{formatPrice(game.price)}</p>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => toggleOutOfStock(game.id, game.outOfStock || false)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 border ${
                                game.outOfStock 
                                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${game.outOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}`}></div>
                              {game.outOfStock ? 'Out of Stock' : 'In Stock'}
                            </button>

                            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => editGame(game)} 
                                className="p-2.5 bg-black/40 hover:bg-primary/20 border border-white/5 hover:border-primary/50 rounded-xl text-text-secondary hover:text-primary transition-all duration-300 tooltip-trigger"
                                title="Edit Game"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(game.id)} 
                                className="p-2.5 bg-black/40 hover:bg-error/20 border border-white/5 hover:border-error/50 rounded-xl text-text-secondary hover:text-error transition-all duration-300 tooltip-trigger"
                                title="Delete Game"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {games.length === 0 && (
                    <div className="col-span-full py-20 px-8 flex flex-col items-center justify-center text-center glass rounded-2xl border border-dashed border-white/20 bg-white/[0.01]">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                        <Package className="w-10 h-10 text-white/40 relative z-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 font-heading">No {activeTab} found</h3>
                      <p className="text-text-secondary max-w-md">Your inventory is looking a little empty. Try adding a new item to get started.</p>
                      <button
                        onClick={() => {
                          resetForm(activeTab === 'giveaways');
                          setIsModalOpen(true);
                        }}
                        className="mt-6 font-bold py-3 px-8 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-2"
                      >
                        <Plus size={18} /> Add Item
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Coupon Management Section */}
          {activeTab === 'coupons' && (
            <div className="w-full mt-6">
              <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-white font-heading">Create New Coupon</h3>
                <form onSubmit={handleCouponSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
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
                      placeholder="e.g. 5 (or blank for unlmtd)"
                      value={couponFormData.usageLimit} 
                      onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                      className="bg-cards border border-white/10 rounded-lg p-3 text-white focus:border-[#FF00F0] outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-[#FF00F0] hover:bg-[#FF00F0]/80 text-white font-bold py-3 px-6 rounded-lg transition-colors h-[50px] shadow-[0_0_15px_rgba(255,0,240,0.3)]">
                    Create Coupon
                  </button>
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
                <h3 className="text-2xl font-bold mb-6 text-white font-heading">Order Management</h3>
                
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
                            <td className="py-3 px-4 font-mono text-xs text-white/70">
                              {order.id.substring(0, 8)}...
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
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => { setSelectedOrder(null); setIsCopied(false); }}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors z-10 bg-cards p-2 rounded-lg"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Order Details</h2>
            
            <div className="flex flex-col gap-6">
              {/* Order Info */}
              <div className="bg-cards/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Order ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-white font-mono text-sm">{selectedOrder.id}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrder.id);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="text-orange-500 hover:text-white transition-colors p-1"
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
          <div className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setSelectedCreatorRequest(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors z-10 bg-cards p-2 rounded-lg"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Creator Application Details</h2>
            
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
    </div>
  );
};
