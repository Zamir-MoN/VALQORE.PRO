import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Edit2, Trash2, LogOut, Search, Loader2, X, Package, Plus, AlertCircle, Gamepad2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { getYouTubeVideoId } from '../utils/youtube';
import type { Game } from '../types';
const API_URL = import.meta.env.VITE_API_URL || 'https://valqore.pro/api';

export const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

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
    }
  }, [token]);

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

  const resetForm = () => {
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

  return (
    <div className="min-h-screen bg-background text-text-primary p-8 pt-24">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex justify-between items-center mb-8">
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
                            <img src={formData.tagImage} alt="Badge Preview" className="max-w-full max-h-full object-contain drop-shadow-lg" />
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

              {/* Game Media */}
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
          {/* List Section */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3 mb-2">
                  <Gamepad2 className="w-8 h-8 text-primary" />
                  Manage Games
                </h2>
                <p className="text-text-secondary text-sm">Control your store inventory and game details.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary/50 focus:bg-white/5 outline-none transition-all duration-300 shadow-inner"
                  />
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="bg-primary text-background font-bold py-3 px-6 rounded-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Game</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="glass p-5 rounded-2xl border border-white/5 flex gap-5 items-center animate-pulse bg-white/[0.02]">
                    <div className="w-20 h-28 bg-white/5 rounded-xl shadow-inner"></div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="h-6 bg-white/10 rounded-md w-2/3"></div>
                      <div className="h-4 bg-white/5 rounded w-1/3"></div>
                      <div className="h-8 bg-white/5 rounded-full w-32 mt-2"></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                      <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {games
                    .filter(game => game.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(game => (
                    <div 
                      key={game.id} 
                      className="group relative glass p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-gradient-to-br from-white/[0.03] to-transparent hover:from-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      {game.outOfStock && (
                        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none opacity-80">
                          <div className="absolute top-4 -right-8 w-32 bg-red-500/90 text-[10px] font-black tracking-wider text-white text-center py-1 shadow-lg shadow-red-500/20 rotate-45 backdrop-blur-sm border-y border-white/20">
                            OUT OF STOCK
                          </div>
                        </div>
                      )}
                      
                      <div className="relative shrink-0 overflow-hidden rounded-xl w-full sm:w-20 h-48 sm:h-28">
                        <img 
                          src={game.coverImage} 
                          alt={game.title} 
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${game.outOfStock ? 'grayscale opacity-70' : ''}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden"></div>
                      </div>
                      
                      <div className="flex-1 flex flex-col w-full z-10">
                        <h3 className="font-bold text-xl text-white mb-1 leading-tight line-clamp-1">{game.title}</h3>
                        <p className="text-primary font-semibold text-sm mb-4">{formatPrice(game.price)}</p>
                        
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3 cursor-pointer group/toggle p-1.5 pr-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/5 transition-colors">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={game.outOfStock || false} 
                                onChange={() => toggleOutOfStock(game.id, game.outOfStock || false)} 
                                className="sr-only"
                              />
                              <div className={`block w-11 h-6 rounded-full transition-colors duration-300 ease-in-out ${game.outOfStock ? 'bg-red-500' : 'bg-white/10 group-hover/toggle:bg-white/20'}`}></div>
                              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm ${game.outOfStock ? 'transform translate-x-5' : ''}`}></div>
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wide ${game.outOfStock ? 'text-red-400' : 'text-text-secondary group-hover/toggle:text-white'}`}>
                              {game.outOfStock ? 'Out of Stock' : 'In Stock'}
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 z-10">
                        <button 
                          onClick={() => editGame(game)} 
                          className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-xl text-white hover:text-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] group/btn tooltip-trigger"
                          title="Edit Game"
                        >
                          <Edit2 size={18} className="transition-transform group-hover/btn:scale-110" />
                        </button>
                        <button 
                          onClick={() => handleDelete(game.id)} 
                          className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-white/5 hover:bg-error/20 border border-white/10 hover:border-error/50 rounded-xl text-white hover:text-error transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] group/btn tooltip-trigger"
                          title="Delete Game"
                        >
                          <Trash2 size={18} className="transition-transform group-hover/btn:scale-110" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {games.length === 0 && (
                    <div className="col-span-full py-16 px-8 flex flex-col items-center justify-center text-center glass rounded-2xl border border-white/10">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-white/40" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
                      <p className="text-text-secondary">Try adjusting your search or add a new game to your inventory.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};
