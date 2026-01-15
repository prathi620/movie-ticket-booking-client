import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

const SeatingChart = ({ seats, selectedSeats, onSeatSelect, disabled = false }) => {
    const [seatMap, setSeatMap] = useState({});
    const [hoveredSeat, setHoveredSeat] = useState(null);

    useEffect(() => {
        // Organize seats by row and column
        const map = {};
        seats.forEach(seat => {
            if (!map[seat.row]) {
                map[seat.row] = [];
            }
            map[seat.row].push(seat);
        });

        // Sort each row by column
        Object.keys(map).forEach(row => {
            map[row].sort((a, b) => a.col - b.col);
        });

        setSeatMap(map);
    }, [seats]);

    const getSeatClass = (seat) => {
        const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);

        // Base classes
        let classes = 'seat transition-all duration-200 flex items-center justify-center rounded-md md:rounded-lg';

        // Size classes (mobile vs desktop)
        classes += ' w-7 h-7 text-[10px] md:w-12 md:h-12 md:text-sm';

        if (seat.status === 'booked') {
            classes += ' bg-slate-700 opacity-50 cursor-not-allowed';
        } else if (seat.status === 'locked') {
            classes += ' bg-yellow-500 cursor-not-allowed';
        } else if (isSelected) {
            classes += ' bg-indigo-600 shadow-[0_0_0_2px_#818cf8] text-white';
        } else {
            classes += ' bg-green-500 hover:bg-green-400 hover:scale-110';
        }

        return classes;
    };

    const handleSeatClick = (seat) => {
        if (disabled || seat.status === 'booked' || seat.status === 'locked') {
            return;
        }
        onSeatSelect(seat);
    };

    const getSeatTypeIcon = (type) => {
        switch (type) {
            case 'vip':
                return '👑';
            case 'premium':
                return '⭐';
            default:
                return '';
        }
    };

    const rows = Object.keys(seatMap).sort((a, b) => a - b);

    return (
        <div className="w-full">
            {/* Scrollable Container for Screen & Seats */}
            <div className="w-fit mx-auto min-w-full px-4">
                {/* Screen */}
                <div className="mb-8 md:mb-12">
                    <div className="flex flex-col items-center">
                        <div className="w-48 md:w-full md:max-w-3xl h-1 md:h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full mb-2" />
                        <div className="flex items-center space-x-2 text-slate-400 text-xs md:text-sm">
                            <Monitor className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Screen</span>
                        </div>
                    </div>
                </div>

                {/* Seating Grid */}
                <div className="flex flex-col items-center space-y-1 md:space-y-4 mb-8 relative">
                    {/* Custom Tooltip */}
                    {hoveredSeat && (
                        <div
                            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 px-6 py-4 bg-gray-900 border border-gray-700 text-white rounded-xl shadow-2xl min-w-[180px] text-center"
                            style={{
                                top: hoveredSeat.y - 10,
                                left: hoveredSeat.x
                            }}
                        >
                            <div className="font-bold text-xl mb-1">{hoveredSeat.seatNumber}</div>
                            <div className="uppercase text-xs tracking-wider text-gray-400 mb-2">{hoveredSeat.type}</div>
                            <div className="text-2xl font-bold text-primary">₹{hoveredSeat.price}</div>
                            {/* Arrow */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                        </div>
                    )}

                    {rows.map(row => (
                        <div key={row} className="flex items-center space-x-1 md:space-x-3">
                            {/* Row Label */}
                            <div className="w-4 md:w-8 text-center text-slate-400 font-bold text-xs md:text-lg">
                                {String.fromCharCode(65 + parseInt(row))}
                            </div>

                            {/* Seats */}
                            <div className="flex space-x-1 md:space-x-3">
                                {seatMap[row].map(seat => (
                                    <button
                                        key={seat.seatNumber}
                                        onClick={() => handleSeatClick(seat)}
                                        // Tooltip logic remains...
                                        onMouseEnter={(e) => {
                                            const rect = e.target.getBoundingClientRect();
                                            const parentRect = e.target.closest('.relative').getBoundingClientRect();
                                            setHoveredSeat({
                                                ...seat,
                                                x: rect.left - parentRect.left + (rect.width / 2),
                                                y: rect.top - parentRect.top
                                            });
                                        }}
                                        onMouseLeave={() => setHoveredSeat(null)}
                                        disabled={disabled || seat.status === 'booked' || seat.status === 'locked'}
                                        className={getSeatClass(seat)}
                                        style={{
                                            backgroundColor: seat.type === 'vip' ? '#fbbf24' : seat.type === 'premium' ? '#a855f7' : '',
                                            color: (seat.type !== 'standard' || selectedSeats.some(s => s.seatNumber === seat.seatNumber)) ? 'white' : ''
                                        }}
                                    >
                                        {getSeatTypeIcon(seat.type)}
                                        {seat.type === 'standard' && (
                                            <span className="font-bold text-inherit opacity-90">
                                                {seat.col + 1}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Row Label (Right) */}
                            <div className="w-4 md:w-8 text-center text-slate-400 font-bold text-xs md:text-lg">
                                {String.fromCharCode(65 + parseInt(row))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-8 p-4 md:p-8 bg-slate-800/50 rounded-2xl">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg bg-green-500 opacity-90" />
                    <span className="text-xs md:text-lg text-slate-300">Available</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg bg-indigo-600 border-2 border-indigo-400 opacity-90" />
                    <span className="text-xs md:text-lg text-slate-300">Selected</span>
                </div>

                <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg bg-slate-700 opacity-90" />
                    <span className="text-xs md:text-lg text-slate-300">Booked</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                    <span className="text-xl md:text-3xl">👑</span>
                    <span className="text-xs md:text-lg text-slate-300">VIP</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3">
                    <span className="text-xl md:text-3xl">⭐</span>
                    <span className="text-xs md:text-lg text-slate-300">Premium</span>
                </div>
            </div>
        </div>
    );
};

export default SeatingChart;
