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

        if (seat.status === 'booked') {
            return 'seat seat-booked';
        } else if (seat.status === 'locked') {
            return 'seat seat-locked';
        } else if (isSelected) {
            return 'seat seat-selected';
        } else {
            return 'seat seat-available';
        }
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
            {/* Screen */}
            <div className="mb-12">
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-3xl h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full mb-2" />
                    <div className="flex items-center space-x-2 text-slate-400 text-sm">
                        <Monitor className="w-4 h-4" />
                        <span>Screen</span>
                    </div>
                </div>
            </div>

            {/* Seating Grid */}
            <div className="flex flex-col items-center space-y-4 mb-8 relative">
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
                    <div key={row} className="flex items-center space-x-3">
                        {/* Row Label */}
                        <div className="w-8 text-center text-slate-400 font-bold text-lg">
                            {String.fromCharCode(65 + parseInt(row))}
                        </div>

                        {/* Seats */}
                        <div className="flex space-x-3">
                            {seatMap[row].map(seat => (
                                <button
                                    key={seat.seatNumber}
                                    onClick={() => handleSeatClick(seat)}
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
                                    className={`${getSeatClass(seat)} hover:scale-110 transition-transform duration-200 text-sm`}
                                    style={{
                                        backgroundColor: seat.type === 'vip' ? '#fbbf24' : seat.type === 'premium' ? '#a855f7' : '',
                                        color: seat.type !== 'standard' ? 'white' : ''
                                    }}
                                >
                                    {getSeatTypeIcon(seat.type)}
                                    {seat.type === 'standard' && (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-700">
                                            {seat.col + 1}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Row Label (Right) */}
                        <div className="w-8 text-center text-slate-400 font-bold text-lg">
                            {String.fromCharCode(65 + parseInt(row))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-8 p-8 bg-slate-800/50 rounded-2xl">
                <div className="flex items-center space-x-3">
                    <div className="seat seat-available w-8 h-8 opacity-90" />
                    <span className="text-lg text-slate-300">Available</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="seat seat-selected w-8 h-8 opacity-90" />
                    <span className="text-lg text-slate-300">Selected</span>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="seat seat-booked w-8 h-8 opacity-90" />
                    <span className="text-lg text-slate-300">Booked</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-3xl">👑</span>
                    <span className="text-lg text-slate-300">VIP</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-3xl">⭐</span>
                    <span className="text-sm text-slate-300">Premium</span>
                </div>
            </div>
        </div>
    );
};

export default SeatingChart;
