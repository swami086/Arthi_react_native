'use client';

import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

export interface CalendarPickerProps {
    selectedDate?: string | Date;
    onDateSelect: (date: Date) => void;
    availableDates?: string[]; // ISO date strings
    disabledDates?: string[]; // ISO date strings
    minDate?: string | Date;
    maxDate?: string | Date;
    className?: string;
}

/**
 * CalendarPicker component wrapping react-day-picker for agent-controlled scheduling.
 * Highlights available dates and handles date selection actions.
 */
export const CalendarPicker: React.FC<CalendarPickerProps> = ({
    selectedDate,
    onDateSelect,
    availableDates = [],
    disabledDates = [],
    minDate,
    maxDate,
    className
}) => {
    // Normalize date props
    const normalizedSelectedDate = typeof selectedDate === 'string' ? parseISO(selectedDate) : selectedDate;
    const normalizedMinDate = minDate ? (typeof minDate === 'string' ? parseISO(minDate) : minDate) : new Date();
    const normalizedMaxDate = typeof maxDate === 'string' ? parseISO(maxDate) : maxDate;

    // Convert string dates to Date objects for efficient lookup
    const availableDateObjects = availableDates.map(d => parseISO(d));
    const disabledDateObjects = disabledDates.map(d => parseISO(d));

    const modifiers = {
        available: (date: Date) => availableDateObjects.some(d => isSameDay(d, date)),
    };

    const modifiersClassNames = {
        available: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-green-500 after:rounded-full',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "p-4 bg-white dark:bg-[#1a2c32] rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm inline-block",
                className
            )}
        >
            <DayPicker
                mode="single"
                selected={normalizedSelectedDate}
                onSelect={(date) => date && onDateSelect(date)}
                disabled={[
                    { before: normalizedMinDate },
                    ...(normalizedMaxDate ? [{ after: normalizedMaxDate }] : []),
                    ...disabledDateObjects
                ]}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-black text-gray-900 dark:text-gray-100",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary rounded-lg transition-all",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground !opacity-100",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-20 cursor-not-allowed",
                    day_hidden: "invisible",
                }}
            />
        </motion.div>
    );
};

CalendarPicker.displayName = 'CalendarPicker';
