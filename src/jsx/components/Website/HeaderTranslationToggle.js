import React, { useState } from 'react';
import { getToken } from '../../../store/utlits';
import { useDispatch } from 'react-redux';
import { getHomepageThunk } from '../../../store/homepagesettings';

function HeaderTranslationToggle({ defaultToggle, restaurantId }) {
  const dispatch = useDispatch();
  const [showTranslation, setShowTranslation] = useState(defaultToggle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTranslation = async () => {
    const newValue = !showTranslation;
    setShowTranslation(newValue);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/homepage-settings/header-translation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ show_translation: newValue }),
      });
      if (!res.ok) throw new Error('Update failed');
      await res.json();
    } catch (err) {
      console.error(err);
      setError('Update failed');
      setShowTranslation(!newValue); // revert on error
    } finally {
      setLoading(false);
      await dispatch(getHomepageThunk(restaurantId));
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {/* Label */}
      <span className="fw-semibold text-dark">Show Translation</span>

      {/* Bootstrap Switch */}
      <div className="form-check form-switch m-0">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="showTranslationSwitch"
          checked={showTranslation}
          onChange={toggleTranslation}
          disabled={loading}
          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        />
      </div>

      {/* Status */}
      {loading && (
        <span className="small text-muted">Updating...</span>
      )}
      {error && (
        <span className="small text-danger">{error}</span>
      )}
    </div>
  );
}

export default HeaderTranslationToggle;
