export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h2>404 - Page Not Found</h2>
      <a href="/">Go Home</a>
    </div>
  );
}
