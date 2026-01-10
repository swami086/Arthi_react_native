import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'SafeSpace';

        // ?description=<description>
        const hasDescription = searchParams.has('description');
        const description = hasDescription
            ? searchParams.get('description')?.slice(0, 200)
            : 'Mental Health Support Platform';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(0,0,0,0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0,0,0,0.05) 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Logo Section */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 40,
                            padding: '20px',
                        }}
                    >
                        {/* Simple SVG Logo approximation */}
                        <svg
                            width="60"
                            height="60"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#7C3AED"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: '16px' }}
                        >
                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>

                        <div
                            style={{
                                fontSize: 60,
                                fontWeight: 800,
                                color: '#7C3AED', // Primary Color
                                letterSpacing: '-0.02em',
                            }}
                        >
                            SafeSpace
                        </div>
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: 70,
                            fontWeight: 900,
                            color: '#111827',
                            textAlign: 'center',
                            maxWidth: '85%',
                            marginBottom: 20,
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                        }}
                    >
                        {title}
                    </div>

                    {/* Description */}
                    <div
                        style={{
                            fontSize: 32,
                            fontWeight: 500,
                            color: '#4B5563',
                            textAlign: 'center',
                            maxWidth: '75%',
                            lineHeight: 1.4,
                        }}
                    >
                        {description}
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '16px',
                            backgroundImage: 'linear-gradient(to right, #7C3AED, #C084FC)',
                        }}
                    />
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
