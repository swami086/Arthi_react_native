'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Video } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SessionCardProps {
    session: any;
    isUpcoming?: boolean;
}

export function SessionCard({ session, isUpcoming }: SessionCardProps) {
    const patient = session.patient;
    const router = useRouter();

    const handleJoinClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/video/${session.id}/waiting`);
    };

    return (
        <Link href={`/therapist/sessions/${session.id}`}>
            <Card className="hover:border-[#30bae8]/50 transition-colors cursor-pointer dark:bg-[#121f24] dark:border-white/5">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={patient?.avatar_url} />
                            <AvatarFallback>{patient?.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{patient?.full_name || 'Patient'}</h3>
                            <p className="text-sm text-slate-500">{session.type || 'Therapy Session'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 flex-1 justify-end">
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                <Calendar className="w-4 h-4 text-[#30bae8]" />
                                {formatDate(session.start_time)}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Clock className="w-4 h-4" />
                                {formatTime(session.start_time)} - {formatTime(session.end_time)}
                            </div>
                        </div>

                        <Badge variant={isUpcoming ? "default" : "secondary"} className={isUpcoming ? "bg-[#30bae8] hover:bg-[#30bae8]/90" : ""}>
                            {session.status}
                        </Badge>

                        {isUpcoming && session.status === 'confirmed' && (
                            <Button size="sm" className="hidden md:flex ml-4" onClick={handleJoinClick}>
                                <Video className="w-4 h-4 mr-2" />
                                Join
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
