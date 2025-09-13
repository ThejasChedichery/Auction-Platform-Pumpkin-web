import React, { useState, useEffect } from 'react';
import { Clock, User, IndianRupee } from 'lucide-react';
import { AuctionItem } from '../types';
// import { useAuth } from '../context/AuthContext';

interface AuctionCardProps {
  item: AuctionItem;
  onBid: (itemId: number, version: number) => Promise<void>;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ item, onBid }) => {
  const [bidding, setBidding] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  // const { user } = useAuth();

  useEffect(() => {
    if (item.is_locked && item.lock_expires_at) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const lockExpires = new Date(item.lock_expires_at!).getTime();
        const timeLeft = Math.max(0, lockExpires - now);
        
        setLockTimeLeft(timeLeft);
        
        if (timeLeft <= 0) {
          setLockTimeLeft(0);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 100);
      return () => clearInterval(interval);
    } else {
      setLockTimeLeft(0);
    }
  }, [item.is_locked, item.lock_expires_at]);

  const handleBid = async () => {
    if (bidding || lockTimeLeft > 0) return;
    
    setBidding(true);
    try {
      await onBid(item.id, item.version);
    } catch (error) {
      console.error('Bid failed:', error);
    } finally {
      setBidding(false);
    }
  };

  const nextBidAmount = item.current_bid + 1;
  const isOwnItem = false; // Disable for demo
  const isLocked = item.is_locked && lockTimeLeft > 0;
  const canBid = !bidding && !isLocked && !isOwnItem;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_uBQh3fWfbM9_GOXhWnW-eo7C_54bcUYKEaqIsHSC4wKSDfIxStEg_3IkkNhwqnWw1dc&usqp=CAU'}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <IndianRupee className="w-4 h-4" />
          {item.current_bid}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Current Bid</span>
            <span className="font-bold text-2xl text-green-600 flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {item.current_bid}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Next Bid</span>
            <span className="font-semibold text-purple-600 flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {nextBidAmount}
            </span>
          </div>

          {item.last_bidder && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Last Bidder</span>
              <span className="flex items-center gap-1 text-gray-700">
                <User className="w-4 h-4" />
                {item.last_bidder}
                {isOwnItem && <span className="text-purple-600 ml-1">(You)</span>}
              </span>
            </div>
          )}
        </div>

        {isLocked && (
          <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Locked for {Math.ceil(lockTimeLeft / 1000)} seconds</span>
          </div>
        )}

        <button
          onClick={handleBid}
          disabled={!canBid}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            canBid
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {bidding ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Placing Bid...
            </div>
          ) : isOwnItem ? (
            'Your Current Bid'
          ) : isLocked ? (
            `Locked (${Math.ceil(lockTimeLeft / 1000)}s)`
          ) : (
            `Bid ₹${nextBidAmount}`
          )}
        </button>
      </div>
    </div>
  );
};