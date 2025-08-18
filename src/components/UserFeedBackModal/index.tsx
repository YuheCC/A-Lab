import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { useTranslation } from 'react-i18next';
import feedbackSvg from '@/assets/svg/feedback.svg';
import { submitFeedback } from '@/services/feedback';
import { validateFile } from '@/services/file';
import './feedback.css';

interface FeedbackForm {
    type: string;
    feature: string;
    text: string;
    file?: File; // 可选的文件
}

const UserFeedBackModal = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState<FeedbackForm>({
        type: 'feature',
        feature: 'map', // 字段名从 function 改为 feature
        text: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        show: () => setShow(true),
        hide: () => setShow(false),
    }));

    const handleClose = () => {
        setShow(false);
        // 重置表单
        setFormData({
            type: 'feature',
            feature: 'map', // 字段名从 function 改为 feature
            text: ''
        });
        setUploadedFile(null);
        setFileError('');
        setImagePreview(null);
    };

    const handleInputChange = (field: keyof FeedbackForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFileError('');

        if (!file) return;

        // 使用新的文件验证函数
        const validation = validateFile(file, 5, ['image/jpeg', 'image/png']);
        if (!validation.valid) {
            setFileError(validation.error || t('feedback.feedback.invalidFileType'));
            return;
        }

        // 设置文件到组件状态和表单数据
        setUploadedFile(file);
        setFormData(prev => ({
            ...prev,
            file: file
        }));
        
        // 创建图片预览
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 前端验证
        if (!formData.type || !formData.feature || !formData.text.trim()) {
            alert(t('feedback.feedback.validationError'));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await submitFeedback({
                type: formData.type,
                feature: formData.feature,
                text: formData.text,
                file: formData.file // 直接传递文件
            });
            
            // 检查响应状态
            if (response.status >= 200 && response.status < 300) {
                alert(t('feedback.feedback.success'));
                handleClose();
            } else if (response.status >= 400 && response.status < 500) {
                // 客户端错误（如验证错误）
                const errorMessage = response.data?.message || t('feedback.feedback.validationError');
                alert(errorMessage);
            } else {
                // 服务器错误
                alert(t('feedback.feedback.failed'));
            }
        } catch (error: any) {
            console.error('Feedback submission error:', error);
            
            // 区分网络错误和其他错误
            if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
                alert(t('feedback.feedback.networkError'));
            } else {
                alert(t('feedback.feedback.failed'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`feedback-modal modal ${show ? 'show' : ''}`} id="feedbackModal">
            <div className="feedback-modal-content">
                <div className="feedback-modal-header">
                    <div className="feedback-modal-title">
                        <img src={feedbackSvg} alt="Feedback" className="item-icon" />
                        <span>{t('feedback.feedback.submitTitle')}</span>
                    </div>
                    <button className="feedback-modal-close" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="feedback-modal-body">
                    <form id="feedbackForm" onSubmit={handleSubmit}>
                        <div className="feedback-form-group">
                            <label htmlFor="feedbackType" className="feedback-label">
                                {t('feedback.feedback.type')} <span className="required">*</span>
                            </label>
                            <select 
                                id="feedbackType" 
                                className="feedback-select" 
                                required
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                            >
                                <option value="feature">{t('feedback.feedback.typeOptions.feature')}</option>
                                <option value="bug">{t('feedback.feedback.typeOptions.bug')}</option>
                                <option value="other">{t('feedback.feedback.typeOptions.other')}</option>
                            </select>
                        </div>
                        
                        <div className="feedback-form-group">
                            <label htmlFor="feedbackFeature" className="feedback-label">
                                {t('feedback.feedback.function')} <span className="required">*</span>
                            </label>
                            <select 
                                id="feedbackFeature" 
                                className="feedback-select" 
                                required
                                value={formData.feature} // 字段名从 function 改为 feature
                                onChange={(e) => handleInputChange('feature', e.target.value)} // 字段名从 function 改为 feature
                            >
                                <option value="map">{t('feedback.feedback.functionOptions.map')}</option>
                                <option value="regularAsk">{t('feedback.feedback.functionOptions.regularAsk')}</option>
                                <option value="deepSpace">{t('feedback.feedback.functionOptions.deepSpace')}</option>
                                <option value="search">{t('feedback.feedback.functionOptions.search')}</option>
                                <option value="filter">{t('feedback.feedback.functionOptions.filter')}</option>
                                <option value="favorites">{t('feedback.feedback.functionOptions.favorites')}</option>
                                <option value="other">{t('feedback.feedback.functionOptions.other')}</option>
                            </select>
                        </div>
                        
                        <div className="feedback-form-group">
                            <label htmlFor="feedbackDescription" className="feedback-label">
                                {t('feedback.feedback.description')} <span className="required">*</span>
                            </label>
                            <textarea 
                                id="feedbackDescription" 
                                className="feedback-textarea" 
                                placeholder={t('feedback.feedback.descriptionPlaceholder')} 
                                required
                                value={formData.text}
                                onChange={(e) => handleInputChange('text', e.target.value)}
                            />
                        </div>
                        
                        <div className="feedback-form-group">
                            <label className="feedback-label">
                                {t('feedback.feedback.uploadScreenshot')}
                            </label>
                            <div 
                                className={`feedback-upload-area ${uploadedFile ? 'has-file' : ''}`} 
                                id="feedbackUploadArea"
                                onClick={!isSubmitting ? handleUploadClick : undefined}
                                style={{ 
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                    position: 'relative',
                                    overflow: 'hidden',
                                    opacity: isSubmitting ? 0.5 : 1
                                }}
                            >
                                {imagePreview ? (
                                    <div className="image-preview-container">
                                        <img 
                                            src={imagePreview} 
                                            alt={t('feedback.feedback.imagePreview')}
                                            className="image-preview"
                                        />
                                        <div className="image-overlay">
                                            <span className="image-name">{uploadedFile?.name}</span>
                                            <button 
                                                type="button"
                                                className="remove-image-btn"
                                                title={t('feedback.feedback.removeImage')}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePreview(null);
                                                    setUploadedFile(null);
                                                    setFormData(prev => {
                                                        const { file, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <span>{t('feedback.feedback.uploadHint')}</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    id="feedbackFile" 
                                    accept="image/jpeg,image/png" 
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {fileError && <div className="feedback-error">{fileError}</div>}
                        </div>
                    </form>
                </div>
                <div className="feedback-modal-footer">
                    <button 
                        type="button" 
                        className="feedback-btn feedback-btn-secondary" 
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {t('feedback.feedback.cancel')}
                    </button>
                    <button 
                        type="submit" 
                        className="feedback-btn feedback-btn-primary" 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.text.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <svg 
                                    className="feedback-loading-spinner" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    width="16" 
                                    height="16"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('feedback.feedback.submitting')}
                            </>
                        ) : (
                            t('feedback.feedback.submit')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UserFeedBackModal;