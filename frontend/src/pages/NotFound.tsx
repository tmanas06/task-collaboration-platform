import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
            <div className="text-center animate-fade-in">
                <h1 className="text-8xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
                    404
                </h1>
                <p className="text-xl text-dark-300 mb-8">Page not found</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
