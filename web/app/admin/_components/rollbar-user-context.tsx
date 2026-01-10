'use client';

import { useEffect } from 'react';
import { setRollbarUser } from '@/lib/rollbar-utils';

interface RollbarUserContextProps {
    user: {
        id: string;
        email?: string;
        full_name?: string;
        is_super_admin?: boolean;
    };
}

export function RollbarUserContext({ user }: RollbarUserContextProps) {
    useEffect(() => {
        setRollbarUser(user.id, user.email, user.full_name, {
            role: 'admin',
            is_super_admin: user.is_super_admin
        });
    }, [user]);

    return null;
}
