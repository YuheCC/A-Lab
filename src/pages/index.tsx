import yayJpg from '../assets/yay.jpg';
import { useTranslation } from "react-i18next"

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('about.whatIs.title')}</h2>
      <p>
        <img src={yayJpg} width="388" />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
    </div>
  );
}
