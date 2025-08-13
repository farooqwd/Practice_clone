// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-black text-white text-center py-4 mt-8">
      <p>© {new Date().getFullYear()}  This web app is an experimental demo app. none of the streaming material is hosted on our database. some of data might not be availbale or inncorrect.</p>
    </footer>
  );
}
