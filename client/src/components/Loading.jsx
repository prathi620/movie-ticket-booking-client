const Loading = ({ size = 'md', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className={`spinner ${sizeClasses[size]}`} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                    {spinner}
                    <p className="mt-4 text-slate-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-12">
            {spinner}
        </div>
    );
};

export default Loading;
