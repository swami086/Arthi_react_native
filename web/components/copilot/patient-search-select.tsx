'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { User, ChevronDown, X } from 'lucide-react';
import type { Patient } from '@/app/therapist/_hooks/usePatientList';

export interface PatientSearchSelectProps {
  patients: Patient[];
  loading?: boolean;
  value: string;
  onSelect: (patient: Patient | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function PatientSearchSelect({
  patients,
  loading,
  value,
  onSelect,
  placeholder = 'Search patient by name...',
  label = 'Patient',
  className,
  disabled,
}: PatientSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => patients.find((p) => p.id === value) ?? null,
    [patients, value]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter((p) =>
      p.full_name?.toLowerCase().includes(q)
    );
  }, [patients, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [open]);

  const displayValue = selected?.full_name ?? '';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-1.5 block">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-2xl border-2 bg-gray-50/50 dark:bg-[#0f191d] overflow-hidden',
          'border-gray-100 dark:border-border focus-within:border-primary focus-within:bg-white dark:focus-within:bg-[#1a2c32]',
          'transition-colors',
          disabled && 'opacity-60 pointer-events-none'
        )}
      >
        <User className="w-4 h-4 ml-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={open ? query : displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 min-w-0 py-3 px-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground"
        />
        {selected && !open ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) setQuery('');
          }}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-xl transition-colors"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', open && 'rotate-180')}
          />
        </button>
      </div>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading patients...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {query ? 'No matching patients.' : 'No patients found.'}
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={value === p.id}
                onClick={() => {
                  onSelect(p);
                  setQuery('');
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors',
                  'hover:bg-muted/80',
                  value === p.id && 'bg-primary/10 text-primary'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <span>{p.full_name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          No patients found. Add patients from the My Patients page.
        </p>
      )}
    </div>
  );
}
