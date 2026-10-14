import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100 shadow-xs">
        <Compass className="w-10 h-10 animate-spin text-indigo-600" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Catalogue Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The archive or catalog shelf you are looking for does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
