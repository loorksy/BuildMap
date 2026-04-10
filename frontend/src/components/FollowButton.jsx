import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FollowButton = ({ userId, initialIsFollowing = false, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${API}/users/${userId}/follow`, { withCredentials: true });
        toast.success('تم إلغاء المتابعة');
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await axios.post(`${API}/users/${userId}/follow`, {}, { withCredentials: true });
        toast.success('تمت المتابعة بنجاح');
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="rounded-lg text-xs sm:text-sm"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 ml-1" />
          يتابع
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 ml-1" />
          متابعة
        </>
      )}
    </Button>
  );
};

export default FollowButton;
