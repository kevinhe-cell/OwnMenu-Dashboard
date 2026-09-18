import React, { useState } from 'react';
import { getToken } from '../../../store/utlits';
import { useDispatch } from 'react-redux';
import { getHomepageThunk } from '../../../store/homepagesettings';

function HeaderMenuToggle({ defaultToggle, restaurantId }) {
  const dispatch = useDispatch();
  const [showMenuLink, setShowMenuLink] = useState(defaultToggle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMenuLink = async () => {
    const newValue = !showMenuLink;
    setShowMenuLink(newValue);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/homepage-settings/header-menu-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ show_menu_link: newValue }),
      });
      if (!res.ok) throw new Error('Update failed');
      await res.json();
    } catch (err) {
      console.error(err);
      setError('Update failed');
      setShowMenuLink(!newValue); // revert on error
    } finally {
      setLoading(false);
      await dispatch(getHomepageThunk(restaurantId));
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {/* NOTE: 该开关现用于控制 Menu 按钮的跳转逻辑。开启时跳转至原 Menu 页面，关闭时默认跳转至 Online Order 页面 */}
      <span className="fw-semibold text-dark">Menu Link to Menu Page</span>

      {/* Bootstrap Switch */}
      <div className="form-check form-switch m-0">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="showMenuLinkSwitch"
          checked={showMenuLink}
          onChange={toggleMenuLink}
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

export default HeaderMenuToggle;
