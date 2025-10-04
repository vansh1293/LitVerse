export default function Footer() {
    return (
        <footer className="w-full py-6 text-center text-white/60 border-t border-white/10 mt-10">
            <div>© {new Date().getFullYear()} <span className="font-semibold text-white">LitVerse</span>. All rights reserved.</div>
        </footer>
    )
}
