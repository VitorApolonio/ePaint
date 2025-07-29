import { createRoot } from 'react-dom/client';
import { version, author } from '../../package.json';

const AboutWindow = () => {
  return (
    <div id="root">
      <div className="top">
        <label className="label">ePaint: A drawing app</label>
        <img src="/src/img/icon.png" alt="App icon" />
      </div>
      <div className="bottom">
        <p>Version {version}</p>
        <p>Copyright &copy; 2025 {author.name}</p>
      </div>
    </div>
  );
};

createRoot(document.body).render(
  <AboutWindow />,
);
