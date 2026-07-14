import { Routes, Route } from 'react-router-dom';
import PortfolioShell from './portfolio/PortfolioShell';
import PortfolioHomePage from './portfolio/PortfolioHomePage';
import PortfolioSectionPage from './portfolio/PortfolioSectionPage';

export default function PortfolioRouter() {
  return (
    <Routes>
      <Route path=":slug" element={<PortfolioShell />}>
        <Route index element={<PortfolioHomePage />} />
        <Route path=":section" element={<PortfolioSectionPage />} />
      </Route>
    </Routes>
  );
}
