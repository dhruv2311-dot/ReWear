import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X, Upload, LoaderCircle, MapPin } from 'lucide-react';
import UploadProgress from '../components/UploadProgress';
import { itemService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Formal', 'Kids'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Worn'];
const TYPES = ['Swap', 'Points', 'Both'];

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tops',
    type: 'Both',
    size: 'M',
    condition: 'Good',
    pointsValue: 50,
    tags: '',
    city: '',
    state: '',
    country: '',
    lat: '',
    lng: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await itemService.getItem(id);
        if (data.item.owner._id !== user._id) {
          navigate('/dashboard');
          toast.error('You can only edit your own items');
          return;
        }
        setItem(data.item);
        setFormData({
          title: data.item.title || '',
          description: data.item.description || '',
          category: data.item.category || 'Tops',
          type: data.item.type || 'Both',
          size: data.item.size || 'M',
          condition: data.item.condition || 'Good',
          pointsValue: data.item.pointsValue || 50,
          tags: data.item.tags ? data.item.tags.join(', ') : '',
          city: data.item.location?.city || '',
          state: data.item.location?.state || '',
          country: data.item.location?.country || '',
          lat: data.item.location?.coordinates?.coordinates?.[1] || '',
          lng: data.item.location?.coordinates?.coordinates?.[0] || '',
        });
        setImagePreviews(data.item.images || []);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load item');
        navigate('/dashboard');
      }
    };
    fetchItem();
  }, [id, user._id, navigate]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      new: true
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    const image = imagePreviews[index];
    if (!image.new) {
      setRemovedImages(prev => [...prev, image.publicId]);
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress({});
    setUploadErrors({});

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('type', formData.type);
      submitData.append('size', formData.size);
      submitData.append('condition', formData.condition);
      submitData.append('pointsValue', formData.pointsValue);
      submitData.append('tags', formData.tags);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('country', formData.country);
      if (formData.lat && formData.lng) {
        submitData.append('lat', formData.lat);
        submitData.append('lng', formData.lng);
      }
      submitData.append('removedImages', JSON.stringify(removedImages));

      images.forEach(image => {
        submitData.append('images', image);
      });

      const onUploadProgress = (progressEvent) => {
        if (images.length > 0) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const newProgress = {};
          images.forEach((img, idx) => {
            newProgress[`${img.name}_${idx}`] = percentCompleted;
          });
          setUploadProgress(newProgress);
        }
      };

      await itemService.updateItem(id, submitData, onUploadProgress);
      toast.success('Item updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
      images.forEach((image, index) => {
        const key = `${image.name}_${index}`;
        setUploadErrors(prev => ({ ...prev, [key]: 'Upload failed' }));
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0' }}>
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                background: 'rgba(27,94,32,0.08)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#1B5E20'
              }}
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.8rem', color: '#1B5E20' }}>
              Edit Item
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Title */}
              <div>
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category *</label>
                <select
                  className="input-field"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="form-label">Type *</label>
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  {TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="form-label">Size *</label>
                <select
                  className="input-field"
                  value={formData.size}
                  onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  required
                >
                  {SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="form-label">Condition *</label>
                <select
                  className="input-field"
                  value={formData.condition}
                  onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                  required
                >
                  {CONDITIONS.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              {/* Points Value */}
              <div>
                <label className="form-label">Points Value *</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.pointsValue}
                  onChange={e => setFormData(prev => ({ ...prev, pointsValue: parseInt(e.target.value) || 0 }))}
                  min={0}
                  required
                />
              </div>

              {/* Tags */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.tags}
                  onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="vintage, cotton, formal"
                />
              </div>

              {/* Location */}
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.country}
                  onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                  onClick={() => {
                    if (navigator.geolocation) {
                      toast.loading('Acquiring location...', { id: 'geoToastEdit' });
                      navigator.geolocation.getCurrentPosition(
                        async pos => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          setFormData(prev => ({ ...prev, lat, lng }));
                          toast.success('Coordinates acquired!', { id: 'geoToastEdit' });
                          
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                            const data = await res.json();
                            if (data.address) {
                              setFormData(prev => ({
                                ...prev,
                                city: data.address.city || data.address.town || data.address.village || prev.city,
                                state: data.address.state || prev.state,
                                country: data.address.country || prev.country
                              }));
                              toast.success('Address auto-filled!');
                            }
                          } catch (e) {
                            console.error('Reverse geocoding failed', e);
                          }
                        },
                        () => toast.error('Could not get location', { id: 'geoToastEdit' })
                      );
                    }
                  }}>
                  <MapPin size={16} /> Get Current Coordinates
                </button>
                {formData.lat && formData.lng && <span style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>Coordinates saved!</span>}
              </div>

              {/* Description */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description *</label>
                <textarea
                  className="input-field"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                  maxLength={1000}
                />
              </div>
            </div>

            {/* Images */}
            <div style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Images</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                {imagePreviews.map((image, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={image.preview || image.url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #E5E7EB'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <label
                  style={{
                    width: '100%',
                    height: '120px',
                    border: '2px dashed #E5E7EB',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = '#1B5E20';
                    e.target.style.background = 'rgba(27,94,32,0.04)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = 'transparent';
                  }}
                >
                  <Upload size={24} color="#9CA3AF" />
                  <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    Add Images
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Upload Progress */}
              {saving && images.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                    Upload Progress
                  </h3>
                  <UploadProgress
                    files={images}
                    progress={uploadProgress}
                    errors={uploadErrors}
                    onRemove={(idx) => removeImage(imagePreviews.length - images.length + idx)}
                    showProgress={true}
                    compact={true}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditItemPage;
