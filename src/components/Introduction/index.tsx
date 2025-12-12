import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

interface IntroductionProps {
  /** i18n translation key */
  i18nKey?: string;
  /** Default text if translation not found */
  defaultText?: string;
  /** Custom content to render instead of placeholder */
  children?: React.ReactNode;
}

const Introduction: React.FC<IntroductionProps> = ({
  i18nKey = 'common.introduction.comingSoon',
  defaultText = 'Introduction content coming soon...',
  children
}) => {
  const { t } = useTranslation();

  return (
    <div className="cc-introduction">
      {children ? (
        children
      ) : (
        <p className="cc-introduction__placeholder">
          {t(i18nKey, defaultText)}
        </p>
      )}
    </div>
  );
};

export default Introduction;
