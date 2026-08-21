import React, { useEffect, useState } from 'react';
import { Mail, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { apiFetch } from '../utils/api';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { user: clerkUser } = useUser();
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch detailed profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await apiFetch('/api/auth/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || clerkUser?.fullName || clerkUser?.username || '');
          setAvatarUrl(data.avatar_url || clerkUser?.imageUrl || '');
          setMobile(data.mobile || '');
          setAddress(data.address || '');
          setBio(data.bio || '');
          setEmail(data.email || clerkUser?.primaryEmailAddress?.emailAddress || '');
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    if (clerkUser) {
      fetchProfile();
    }
  }, [clerkUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setSaveMessage(null);
      
      const res = await apiFetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          avatar_url: avatarUrl,
          mobile,
          address,
          bio
        })
      });
      
      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Changes saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await res.json();
        setSaveMessage({ type: 'error', text: errorData.detail || 'Failed to save changes.' });
      }
    } catch (err) {
      console.error("Error saving profile", err);
      setSaveMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'P';
  };

  if (loadingProfile) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleSave} className={styles.profileForm}>
        {/* Header Block Card */}
        <div className={styles.headerCard}>
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className={styles.avatarImage} onError={() => setAvatarUrl('')} />
            ) : (
              <div className={styles.avatarInitial}>{getInitial()}</div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h3 className={styles.headerName}>{name || 'Researcher'}</h3>
            <div className={styles.headerEmail}>
              <Mail size={14} className={styles.mailIcon} />
              <span>{email}</span>
            </div>
            <div className={styles.verifiedBadge}>
              <ShieldCheck size={14} className={styles.badgeIcon} />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className={styles.formFields}>
          {/* Username */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Your username"
              required
            />
            <span className={styles.helperText}>Pulled from your sign-in provider — change it any time.</span>
          </div>

          {/* Avatar URL */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Avatar URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={styles.input}
              placeholder="https://example.com/avatar.jpg"
            />
            <span className={styles.helperText}>Link to an image. Leave blank to use your initial.</span>
          </div>

          {/* Mobile & Address in Two Columns */}
          <div className={styles.grid2Col}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={styles.input}
                placeholder="+91 90000 00000"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Bio */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textarea}
              placeholder="A sentence about you."
              rows={4}
            />
          </div>

          {/* Messages */}
          {saveMessage && (
            <div className={saveMessage.type === 'success' ? styles.successMessage : styles.errorMessage}>
              {saveMessage.text}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={savingProfile} className={styles.submitBtn}>
            {savingProfile ? (
              <>
                <Loader2 className={styles.btnSpinner} size={16} />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
