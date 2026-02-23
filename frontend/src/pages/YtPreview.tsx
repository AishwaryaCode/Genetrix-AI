
import { yt_html } from '../assets/assets';
import { useSearchParams } from 'react-router-dom';

const YtPreview = () => {
  const [searchParams] = useSearchParams();

  const thumbnail_url = searchParams.get('thumbnail_url'); 
  const title = searchParams.get('title'); 

  console.log('title:', title, 'thumbnail:', thumbnail_url);

  const new_html = yt_html
    .replace('%%THUMBNAIL_URL%%', thumbnail_url || '')
    .replace('%%TITLE%%', title || 'No Title');

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <iframe srcDoc={new_html} width="100%" height="100%" allowFullScreen />
    </div>
  );
};

export default YtPreview;

