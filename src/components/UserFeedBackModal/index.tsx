import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { useTranslation } from 'react-i18next';
import feedbackSvg from '@/assets/svg/feedback.svg';
import './feedback.css';

interface FeedbackForm {
    type: string;
    function: string;
    description: string;
    screenshot?: File;
}

const UserFeedBackModal = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState<FeedbackForm>({
        type: 'feature',
        function: 'map',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
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
            function: 'map',
            description: ''
        });
        setUploadedFile(null);
        setFileError('');
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

        // 检查文件类型
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setFileError(t('feedback.feedback.invalidFileType'));
            return;
        }

        // 检查文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setFileError(t('feedback.feedback.fileTooLarge'));
            return;
        }

        setUploadedFile(file);
        setFormData(prev => ({
            ...prev,
            screenshot: file
        }));
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.description.trim()) {
            alert(t('feedback.feedback.description') + ' ' + t('feedback.feedback.required'));
            return;
        }

        setIsSubmitting(true);

        try {
            // 这里可以添加实际的API调用
            // const response = await submitFeedback(formData);
            
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert(t('feedback.feedback.success'));
            handleClose();
        } catch (error) {
            alert(t('feedback.feedback.failed'));
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
                            <label htmlFor="feedbackFunction" className="feedback-label">
                                {t('feedback.feedback.function')} <span className="required">*</span>
                            </label>
                            <select 
                                id="feedbackFunction" 
                                className="feedback-select" 
                                required
                                value={formData.function}
                                onChange={(e) => handleInputChange('function', e.target.value)}
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
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                        </div>
                        
                        <div className="feedback-form-group">
                            <label className="feedback-label">{t('feedback.feedback.uploadScreenshot')}</label>
                            <div 
                                className={`feedback-upload-area ${uploadedFile ? 'has-file' : ''}`} 
                                id="feedbackUploadArea"
                                onClick={handleUploadClick}
                            >
                                {uploadedFile ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                        <span>{uploadedFile.name}</span>
                                    </>
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
                                    id="feedbackScreenshot" 
                                    accept="image/jpeg,image/png" 
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
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
                        disabled={isSubmitting || !formData.description.trim()}
                    >
                        {isSubmitting ? t('feedback.feedback.uploading') : t('feedback.feedback.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default UserFeedBackModal;