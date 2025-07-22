import { useSelector } from 'react-redux';

export default function LoadingComponent() {
    const isLoading = useSelector((state) => state.apiData.loading);


    // Démarrer automatiquement le loader au montage
    // useEffect(() => {
    //     dispatch(setLoading(true));
    // }, []);

    if (!isLoading) return null;

    return (
        <>
            {/* Loader principal en haut */}
            <div 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(110, 118, 129, 0.1)',
                    zIndex: 9999,
                    overflow: 'hidden'
                }}
            >
                <div 
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #58a6ff, #1f6feb, #58a6ff)',
                        backgroundSize: '200% 100%',
                        width: '100%',
                        animation: 'loading 2s ease-in-out infinite, gradient 1.5s ease-in-out infinite'
                    }}
                />
            </div>

            {/* Loader GitHub style */}
           

            <style jsx="true">{`
                @keyframes loading {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
                
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                
            `}</style>
        </>
    );
}