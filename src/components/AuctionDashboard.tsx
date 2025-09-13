import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Trophy, Users } from 'lucide-react';
import { AuctionCard } from './AuctionCard';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { AuctionItem } from '../types';

export const AuctionDashboard: React.FC = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [bidError, setBidError] = useState('');

  const { user, logout } = useAuth();

  const fetchAuctions = async (showLoader = false) => {
    try {
      if (showLoader) setRefreshing(true);
      const response = await apiService.getAuctions();
      setItems(response.items);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch auctions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    
    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      fetchAuctions();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleBid = async (itemId: number) => {
    setBidError('');
    try {
      await apiService.placeBid(itemId);
      // Immediately refresh to show updated state
      await fetchAuctions();
    } catch (error) {
      setBidError(error instanceof Error ? error.message : 'Failed to place bid');
      // Still refresh to get latest state
      await fetchAuctions();
    }
  };

  const handleRefresh = () => {
    fetchAuctions(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Auction Hub</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5" />
                <span className="font-medium">{user?.name || 'Demo User'}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Live Auctions</h2>
          <p className="text-gray-600">Place your bids now! Each bid must be exactly ₹1 higher than the current bid.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {bidError && (
          <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-700 px-6 py-4 rounded-xl">
            {bidError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <AuctionCard
              key={item.id}
              item={item}
              onBid={handleBid}
            />
          ))}
        </div>

        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No auctions available</h3>
            <p className="text-gray-500">Check back later for new items!</p>
          </div>
        )}
      </main>
    </div>
  );
};