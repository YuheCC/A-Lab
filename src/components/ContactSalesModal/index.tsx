import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { contactSales } from '@/services/auth';
import './ContactSalesModal.less';

type ContactPlanType = 'enterprise1' | 'enterprise2' | 'enterprise3' | 'joint';

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: ContactPlanType;
  userEmail?: string;
}

const ContactSalesModal = ({ isOpen, onClose, planType, userEmail }: ContactSalesModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 自动填充 email（如果已登录）
  useEffect(() => {
    if (isOpen && userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }));
    }
  }, [isOpen, userEmail]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = {
        email: formData.email,
        message: formData.message,
      };

      await contactSales(submitData);
      setSubmitStatus('success');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: ''
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Contact sales form submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });
      setSubmitStatus('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-sales-modal-overlay">
      <div className="contact-sales-modal">
        <div className="contact-sales-modal-header">
          <h2>{t(`pricing.contactSales.${planType}`)} - {t('pricing.contactSales.title')}</h2>
          <button 
            className="contact-sales-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="contact-sales-modal-body">
          {submitStatus === 'success' ? (
            <div className="contact-sales-success">
              <p>{t('pricing.contactSales.messages.success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-sales-form">
              {/* <div className="form-group">
                <label htmlFor="name">{t('pricing.contactSales.form.name')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div> */}

              <div className="form-group">
                <label htmlFor="email">{t('pricing.contactSales.form.email')} *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* <div className="form-group">
                <label htmlFor="company">{t('pricing.contactSales.form.company')} *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">{t('pricing.contactSales.form.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div> */}

              <div className="form-group">
                <label htmlFor="message">{t('pricing.contactSales.form.message')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t('pricing.contactSales.form.messagePlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              {submitStatus === 'error' && (
                <div className="contact-sales-error">
                  <p>{t('pricing.contactSales.messages.error')}</p>
                </div>
              )}

              <div className="contact-sales-modal-actions">
                <button
                  type="button"
                  className="contact-sales-btn-cancel"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {t('pricing.contactSales.buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className="contact-sales-btn-submit"
                  disabled={isSubmitting || !formData.email}
                >
                  {isSubmitting ? t('pricing.contactSales.buttons.submitting') : t('pricing.contactSales.buttons.submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSalesModal; 
