'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    IndianRupee,
    Calendar,
    TrendingUp,
    Activity,
    Star,
    Video,
    CheckCircle,
    MessageSquare,
    Plus,
    CreditCard,
    DollarSign,
    Briefcase
} from 'lucide-react';
import {
    Button,
    StatCard,
    SessionCard,
    GradientAvatar,
    TagPill,
    MentorCard,
    PaymentCard,
    EarningsCard,
    MenteeCard,
    ConversationCard,
    PendingMentorRequestCard,
    MetadataCard,
    QuickActionButton,
    SectionHeader,
    BottomActionBar,
    MessageBubble,
    FilterChip,
    FeedbackChip,
    RatingStars,
    GoalProgress,
    Input,
    LoadingSkeleton,
    CardSkeleton,
    ListSkeleton,
    ErrorBanner,
    ErrorBoundary,
    SoapSection
} from '@/components/ui';

export default function ComponentsShowcase() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [soapExpanded, setSoapExpanded] = useState(false);
    const [soapValue, setSoapValue] = useState('Patient reported feeling much better today. Sleep has improved significantly over the last week.');
    const [showError, setShowError] = useState(true);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0c1417] p-8 pb-32">
            <div className="max-w-6xl mx-auto">
                <SectionHeader
                    title="Component Galaxy"
                    subtitle="Interactive UI Design System"
                    action={
                        <Button size="sm" variant="outline" leftIcon={<Plus size={16} />}>
                            Add Component
                        </Button>
                    }
                />

                <ErrorBanner
                    visible={showError}
                    message="This is a test error banner for demonstration purposes."
                    onRetry={() => alert('Retrying...')}
                    onClose={() => setShowError(false)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">

                    {/* Section: Skeletons & Loading */}
                    <section>
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-primary">Loading & Physics</h3>
                        <div className="space-y-6 bg-white dark:bg-[#1a2c32] p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-border-dark">
                            <LoadingSkeleton height={140} />
                            <CardSkeleton />
                            <ListSkeleton count={2} />
                        </div>
                    </section>

                    {/* Section: Avatars & Identity */}
                    <section>
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-primary">Identity Models</h3>
                        <div className="flex flex-wrap gap-8 items-center bg-white dark:bg-[#1a2c32] p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-border-dark">
                            <GradientAvatar src="https://i.pravatar.cc/150?u=1" alt="Avatar 1" size={100} online={true} />
                            <GradientAvatar src="https://i.pravatar.cc/150?u=2" alt="Avatar 2" size={80} online={false} />
                            <GradientAvatar src="https://i.pravatar.cc/150?u=3" alt="Avatar 3" size={60} online={true} />
                            <div className="flex flex-wrap gap-2">
                                <TagPill label="Mental Health" color="blue" />
                                <TagPill label="Anxiety" color="purple" />
                                <TagPill label="Expert" color="green" />
                            </div>
                        </div>
                    </section>

                    {/* Section: Stats & Financials */}
                    <section className="lg:col-span-2">
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-primary">Data Streams</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Active Mentees"
                                value="1248"
                                icon={Users}
                                growth="12"
                                growthLabel="vs last month"
                            />
                            <StatCard
                                title="Monthly Revenue"
                                value="84200"
                                icon={IndianRupee}
                                iconColor="#10b981"
                                growth="8.5"
                                growthLabel="vs last month"
                            />
                            <EarningsCard
                                title="Wallet Balance"
                                amount={12500}
                                icon={CreditCard}
                                color="#3b82f6"
                                trend={15}
                            />
                            <EarningsCard
                                title="Pending Payout"
                                amount={4200}
                                icon={Activity}
                                color="#f59e0b"
                                trend={-2}
                            />
                        </div>
                    </section>

                    {/* Section: Communication */}
                    <section>
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-primary">Communication Nodes</h3>
                        <div className="space-y-4 bg-white dark:bg-[#1a2c32] p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-border-dark">
                            <ConversationCard
                                name="Dr. Sanjana"
                                lastMessage="Thank you for the session today!"
                                timestamp={new Date().toISOString()}
                                unreadCount={2}
                                isOnline={true}
                                onClick={() => { }}
                            />
                            <div className="flex flex-col gap-2 mt-6">
                                <MessageBubble
                                    content="Hi there! Hope you're having a good day."
                                    timestamp={new Date().toISOString()}
                                    isMyMessage={false}
                                />
                                <MessageBubble
                                    content="Yes, feeling very productive. Thanks for asking!"
                                    timestamp={new Date().toISOString()}
                                    isMyMessage={true}
                                    isRead={true}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section: Mentorship Elements */}
                    <section>
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-primary">Mentorship Lattice</h3>
                        <div className="space-y-4">
                            <MenteeCard
                                name="Rahul Sharma"
                                age={24}
                                education="Masters in Design"
                                status="Active"
                                statusColor="#10b981"
                                nextInfo="Session Tomorrow @ 10 AM"
                                onMessage={() => { }}
                                onViewProfile={() => { }}
                            />
                            <PendingMentorRequestCard
                                request={{
                                    id: '1',
                                    created_at: new Date().toISOString(),
                                    notes: "I want to specialize in UI design and need guidance on portfolio building.",
                                    mentor: {
                                        full_name: "Amit Patel",
                                        specialization: "Product Designer",
                                        expertise_areas: ["UI/UX", "System Design", "Mentorship"]
                                    }
                                }}
                                onAccept={() => { }}
                                onDecline={() => { }}
                                isProcessing={false}
                            />
                        </div>
                    </section>

                    {/* Section: Clinical & Input */}
                    <section className="lg:col-span-2">
                        <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-primary">Clinical Interface</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-[#1a2c32] p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-border-dark">
                            <div className="space-y-6">
                                <Input
                                    label="Search Mentors"
                                    placeholder="Type to search..."
                                    leftIcon={Users}
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error="Password is too weak"
                                />
                                <div className="flex flex-wrap gap-4">
                                    <QuickActionButton
                                        icon={Calendar}
                                        title="Schedule"
                                        color="#30bae8"
                                        onClick={() => { }}
                                    />
                                    <QuickActionButton
                                        icon={MessageSquare}
                                        title="Messages"
                                        color="#9055ff"
                                        onClick={() => { }}
                                    />
                                    <QuickActionButton
                                        icon={Video}
                                        title="Video Call"
                                        color="#10b981"
                                        onClick={() => { }}
                                    />
                                </div>
                                <GoalProgress title="Career Objectives" percentage={75} color="#30bae8" />
                            </div>

                            <div className="space-y-4">
                                <SoapSection
                                    title="Subjective"
                                    icon={Activity}
                                    value={soapValue}
                                    onChange={setSoapValue}
                                    isExpanded={soapExpanded}
                                    onToggle={() => setSoapExpanded(!soapExpanded)}
                                    minChars={30}
                                />
                                <div className="flex items-center gap-6 mt-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-2">Mentor Rating</span>
                                        <RatingStars rating={4.5} onRatingChange={() => { }} />
                                    </div>
                                    <div className="flex gap-2">
                                        <FilterChip label="Design" isSelected={activeFilter === 'Design'} onClick={() => setActiveFilter('Design')} />
                                        <FilterChip label="Tech" isSelected={activeFilter === 'Tech'} onClick={() => setActiveFilter('Tech')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Interactive Cards */}
                    <section className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MentorCard
                            name="Dr. Sarah Johnson"
                            role="Product Strategist"
                            bio="Helping founders scale their startups from 1 to 10. Focused on sustainable growth and lean operations."
                            expertise={["Strategy", "Operations", "Scale"]}
                            isOnline={true}
                            onClick={() => { }}
                        />
                        <PaymentCard
                            payment={{
                                id: 'p1',
                                status: 'completed',
                                amount: 1500,
                                currency: '₹',
                                created_at: new Date().toISOString(),
                                payment_method: 'UPI Pay',
                                razorpay_payment_id: 'pay_ABC123XYZ789',
                                appointment_id: 'a1',
                                mentee_id: 'm1',
                                mentor_id: 'mt1',
                                updated_at: new Date().toISOString()
                            } as any}
                        />
                    </section>
                </div>
            </div>

            <BottomActionBar
                primaryLabel="Deploy System"
                onPrimaryClick={() => { }}
                secondaryLabel="Discard View"
                onSecondaryClick={() => { }}
            />
        </div>
    );
}
