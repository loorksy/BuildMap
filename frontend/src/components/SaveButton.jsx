import React, { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SaveButton = ({ projectId, initialIsSaved = false, onSaveChange }) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    try {
      if (isSaved) {
        await axios.delete(`${API}/projects/${projectId}/save`, { withCredentials: true });
        toast.success('تم إلغاء الحفظ');
        setIsSaved(false);
        onSaveChange?.(false);
      } else {
        await axios.post(`${API}/projects/${projectId}/save`, {}, { withCredentials: true });
        toast.success('تم حفظ المشروع');
        setIsSaved(true);
        onSaveChange?.(true);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('يجب تسجيل الدخول أولاً');
      } else {
        toast.error(error.response?.data?.detail || 'حدث خطأ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`p-2 rounded-lg transition-smooth ${
        isSaved 
          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
          : 'bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground'
      }`}
      title={isSaved ? 'إلغاء الحفظ' : 'حفظ المشروع'}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
    </button>
  );
};

export default SaveButton;
