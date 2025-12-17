import { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

const CalendarView = ({ selectedDate, onDateSelect, showtimes = [] }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    const nextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
    };

    const prevWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7));
    };

    const getShowtimesForDate = (date) => {
        return showtimes.filter(showtime => {
            const showtimeDate = new Date(showtime.startTime);
            return isSameDay(showtimeDate, date);
        });
    };

    return (
        <div className="calendar-view bg-white rounded-lg shadow-md p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={prevWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Previous week"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold text-gray-900">
                    {format(currentWeekStart, 'MMMM yyyy')}
                </h3>

                <button
                    onClick={nextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Next week"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const dayShowtimes = getShowtimesForDate(day);
                    const hasShowtimes = dayShowtimes.length > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => onDateSelect(day)}
                            className={`
                                relative p-4 rounded-lg border-2 transition-all
                                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }
                                ${!hasShowtimes && 'opacity-50 cursor-not-allowed'}
                            `}
                            disabled={!hasShowtimes}
                        >
                            <div className="text-center">
                                <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                                    {format(day, 'EEE')}
                                </div>
                                <div className={`
                                    text-2xl font-bold
                                    ${isToday ? 'text-indigo-600' : 'text-gray-900'}
                                    ${isSelected && 'text-indigo-600'}
                                `}>
                                    {format(day, 'd')}
                                </div>
                                {hasShowtimes && (
                                    <div className="mt-2">
                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                                            {dayShowtimes.length} {dayShowtimes.length === 1 ? 'show' : 'shows'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                        Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
